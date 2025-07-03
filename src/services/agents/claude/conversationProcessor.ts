import { v4 as uuidv4 } from 'uuid';
import { TestMessage } from '@/types/runs';
import { RunnableSequence } from '@langchain/core/runnables';
import { BufferMemory } from 'langchain/memory';
import { dbService } from '@/services/db';
import { QaAgentConfig } from './types';

/**
 * ConversationProcessor - Simplified helper class for processing conversation turns
 * Updated to work with adaptive conversation approach
 */
export class ConversationProcessor {
  private model;ConversationProcessor
  private config: QaAgentConfig;

  constructor(model: any, config: QaAgentConfig) {
    this.model = model;
    this.config = config;
  }

  /**
   * Process a single conversation message
   * Handles API request, response parsing, and database operations
   */
  async processMessage(
    message: string,
    chatId: string,
    memory: BufferMemory
  ): Promise<{
    response: string;
    responseTime: number;
    messages: TestMessage[];
  }> {
    try {
      // Import required modules here to avoid circular dependencies
      const { ApiHandler } = require('./apiHandler');
      const { ConversationHandler } = require('./conversationHandler');
      
      // Format the message according to API requirements
      const formattedInput = ApiHandler.formatInput(
        message, 
        this.config.apiConfig.inputFormat
      );
      
      // Call the endpoint and measure response time
      const startTime = Date.now();
      let apiResponse;
      try {
        apiResponse = await ApiHandler.callEndpoint(
          this.config.endpointUrl,
          this.config.headers,
          formattedInput,
          // Add timeout signal
          new AbortController().signal
        );
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('API request timed out');
        }
        throw error;
      }
      const responseTime = Date.now() - startTime;


      console.log("API response:", apiResponse);

      // Extract chat response
      const chatResponse = apiResponse?.response?.text || 
        ConversationHandler.extractChatResponse(apiResponse, this.config.apiConfig.rules);

        //!added by niranjan
        console.log("input message:", message);
      console.log("Chat response:", chatResponse);
      
      // Save to memory
      await memory.saveContext(
        { input: message },
        { output: chatResponse }
      );
      
      // Create message objects
      const userMsgId = uuidv4();
      const assistantMsgId = uuidv4();
      
      const messages: TestMessage[] = [
        {
          id: userMsgId,
          chatId: chatId,
          role: 'user',
          content: message,
          metrics: { responseTime: 0 }
        },
        {
          id: assistantMsgId,
          chatId: chatId,
          role: 'assistant',
          content: chatResponse,
          metrics: { responseTime }
        }
      ];
      
      // Save to database
      await dbService.saveConversationMessage({
        id: userMsgId,
        conversationId: chatId,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        metrics: { responseTime: 0 }
      });
      
      await dbService.saveConversationMessage({
        id: assistantMsgId,
        conversationId: chatId,
        role: 'assistant',
        content: chatResponse,
        timestamp: new Date().toISOString(),
        metrics: { responseTime }
      });
      
      return { response: chatResponse, responseTime, messages };
    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  }

  /**
   * Evaluate if conversation should continue based on current progress
   * NOTE: This replaces the rigid conversation plan approach
   */
  async evaluateContinuation(
    chain: RunnableSequence,
    memory: BufferMemory,
    scenario: string,
    expectedOutput: string
  ): Promise<{
    shouldContinue: boolean;
    reason: string;
  }> {
    try {
      // Load current conversation history
      const memoryVariables = await memory.loadMemoryVariables({});
      const history = memoryVariables.chat_history;
      
      // Prepare evaluation prompt
      const evaluationPrompt = `
        Test scenario: ${scenario}
        Expected behavior: ${expectedOutput}
        
        Current conversation history:
        ${JSON.stringify(history)}
        
        Based on the conversation so far, should we continue the test conversation?
        Consider:
        1. Has enough information been gathered to evaluate the agent?
        2. Is the agent's behavior clear in relation to the expected output?
        3. Would additional messages add value to the evaluation?
        
        Answer YES if we should continue, or NO with a brief reason if we should stop.
      `;
      
      // Get model's evaluation
      const result = await chain.invoke({ input: evaluationPrompt });
      const shouldContinue = result.toLowerCase().includes('yes');
      
      // Extract reason if available
      const reasonMatch = result.match(/no[,:\s]+(.+)/i);
      const reason = reasonMatch ? reasonMatch[1].trim() : 'Sufficient information gathered';
      
      return { shouldContinue, reason };
    } catch (error) {
      console.error("Error evaluating continuation:", error);
      // Default to continuing if evaluation fails
      return { shouldContinue: true, reason: "Evaluation error" };
    }
  }

  /**
   * Generate the next message based on conversation history
   * Creates more adaptive and natural follow-ups
   */
  async generateNextMessage(
    chain: RunnableSequence,
    memory: BufferMemory,
    scenario: string,
    expectedOutput: string
  ): Promise<string> {
    try {
      // Load current conversation history
      const memoryVariables = await memory.loadMemoryVariables({});
      const history = memoryVariables.chat_history;
      
      
      const generationPrompt = `
  AS A HUMAN USER with the personality traits described earlier,
  your goal is: ${scenario}
  Expected behavior: ${expectedOutput}
  Here's the conversation so far:
  ${JSON.stringify(history)}

  Write your next message to the AI assistant.

  IMPORTANT REMINDERS:
  - Write ONLY what a real human would type in a chat interface
  - NO roleplaying elements (like "*sighs*" or "*excited tone*")
  - NO theatrical descriptions of actions or emotions
  - Just write plain text like a normal person typing a message
  - DO NOT ask the assistant any clarifying or follow-up questions.
  - DO NOT request more information from the assistant.
  - Only respond as a user would, based on the scenario and conversation so far.

  After your message, on a separate line, indicate if the conversation should end:
  COMPLETE: true (if the AI has successfully addressed your needs)
  COMPLETE: false (if you still need more information or help)
  `;
      
      // Get next message
      const result = await chain.invoke({ input: generationPrompt });
      
      // Clean up any metadata or explanations
      return result.replace(/^.*?(Message:|Next message:|User:|Human:)/i, '').trim();
    } catch (error) {
      console.error("Error generating next message:", error);
      // Fallback to a generic follow-up
      return "Could you tell me more about that?";
    }
  }
}