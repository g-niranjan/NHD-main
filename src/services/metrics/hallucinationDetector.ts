// // src/services/metrics/hallucinationDetector.ts
// import { ModelFactory } from "@/services/llm/modelfactory";
// import { LLMServiceConfig } from "@/services/llm/types";
// import { RunnableSequence } from "@langchain/core/runnables";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { JsonOutputParser } from "@langchain/core/output_parsers";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// interface HallucinationResult {
//   isHallucination: boolean;
//   reasoning: string;
// }
// const genAI = new GoogleGenerativeAI("YOUR_API_KEY");
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// const HALLUCINATION_PROMPT = `You are a hallucination detector. Analyze the following assistant response for potential hallucinations.

// AGENT DESCRIPTION: {agentDescription}
// CONVERSATION HISTORY: {context}
// USER QUERY: {query}
// ASSISTANT RESPONSE: {response}

// A hallucination occurs when the AI:
// 1. Presents fictional information as fact
// 2. Claims knowledge about things not mentioned in the conversation history
// 3. Contradicts information previously stated in the conversation
// 4. Makes assertions that go beyond what can be reasonably inferred
// 5. Drifts to completely unrelated topics (e.g., answering about weather when asked about laptop prices)
// 6. Acts outside its described capabilities
// 7. Assumes or provides specific details (locations, dates, names, quantities, identifiers, etc.) that were NOT requested or mentioned by the user
// 8. Answers with specifics when the query was general (e.g., answering "Product X costs $99" when asked "What are your prices?")

// CRITICAL: When users ask general questions without specifics, the assistant should:
// - Request clarification if specifics are needed
// - Provide general information only
// - NOT assume or fabricate specific examples, instances, or details
// Any unrequested specific information IS a hallucination, regardless of domain.

// Respond in this exact JSON format:
// {{
//   "isHallucination": boolean,
//   "reasoning": "Brief explanation of your analysis"
// }}

// Only output the JSON, nothing else.`;

// export class HallucinationDetector {
//   private model;
//   private agentDescription: string;
  
//   constructor(modelConfig: LLMServiceConfig, agentDescription: string) {
//     this.agentDescription = agentDescription;
//     this.model = ModelFactory.createLangchainModel(
//       modelConfig.id,
//       modelConfig.apiKey,
//       modelConfig.extraParams
//     );
//   }
 
  
//   async detectHallucination(
//     context: string, 
//     query: string, 
//     response: string
//   ): Promise<boolean | null> {
//     try {
//       const prompt = ChatPromptTemplate.fromMessages([
//         ["user", HALLUCINATION_PROMPT]
//       ]);
      
//       const chain = RunnableSequence.from([
//         prompt,
//         this.model,
//         new JsonOutputParser<HallucinationResult>()
//       ]);
      
//       const result = await chain.invoke({
//         agentDescription: this.agentDescription,
//         context: context,
//         query,
//         response
//       });
      
//       // Log the reasoning for debugging and analysis purposes
//       console.log(`Hallucination detection result for query "${query.substring(0, 30)}...": ${result.isHallucination ? "DETECTED" : "NOT DETECTED"}`);
//       console.log(`Reasoning: ${result.reasoning}`);
      
//       return result.isHallucination;
//     } catch (error) {
//       console.error("Error detecting hallucination:", error);
      
//       // If JsonOutputParser fails, try manual parsing
//       try {
//         const prompt = ChatPromptTemplate.fromMessages([
//           ["user", HALLUCINATION_PROMPT]
//         ]);
        
//         const chain = RunnableSequence.from([
//           prompt,
//           this.model
//         ]);
        
//         const rawResult = await chain.invoke({
//           agentDescription: this.agentDescription,
//           context: context,
//           query,
//           response
//         });
        
//         const responseText = typeof rawResult === 'string' ? rawResult : rawResult.content;
//         const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
        
//         if (jsonMatch) {
//           const parsed = JSON.parse(jsonMatch[0]) as HallucinationResult;
//           // console.log("Successfully parsed hallucination result from raw response");
//           return parsed.isHallucination;
//         }
//       } catch (fallbackError) {
//         console.error("Fallback parsing also failed:", fallbackError);
//       }
      
//       return null;
//     }
//   }
// }

// export default HallucinationDetector;



import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMServiceConfig } from "@/services/llm/types";
import { ModelFactory } from "@/services/llm/modelfactory";

interface HallucinationResult {
  isHallucination: boolean;
  reasoning: string;
}

const HALLUCINATION_PROMPT_TEMPLATE = `
You are a hallucination detector. Analyze the following assistant response for potential hallucinations.

AGENT DESCRIPTION: {agentDescription}
CONVERSATION HISTORY: {context}
USER QUERY: {query}
ASSISTANT RESPONSE: {response}

A hallucination occurs when the AI:
1. Presents fictional information as fact
2. Claims knowledge about things not mentioned in the conversation history
3. Contradicts information previously stated in the conversation
4. Makes assertions that go beyond what can be reasonably inferred
5. Drifts to completely unrelated topics (e.g., answering about weather when asked about laptop prices)
6. Acts outside its described capabilities
7. Assumes or provides specific details (locations, dates, names, quantities, identifiers, etc.) that were NOT requested or mentioned by the user
8. Answers with specifics when the query was general (e.g., answering "Product X costs $99" when asked "What are your prices?")

CRITICAL: When users ask general questions without specifics, the assistant should:
- Request clarification if specifics are needed
- Provide general information only
- NOT assume or fabricate specific examples, instances, or details
Any unrequested specific information IS a hallucination, regardless of domain.

Respond in this exact JSON format:
{
  "isHallucination": boolean,
  "reasoning": "Brief explanation of your analysis"
}

Only output the JSON, nothing else.
`;

export class HallucinationDetector {
  private agentDescription: string;
  private model: ReturnType<typeof GoogleGenerativeAI.prototype.getGenerativeModel>;

  constructor(modelConfig: LLMServiceConfig, agentDescription: string) {
    this.agentDescription = agentDescription;

    const genAI = new GoogleGenerativeAI(modelConfig.apiKey);
    this.model = genAI.getGenerativeModel({ model: `${modelConfig.id || 'gemini-1.5-flash'}` });
  }

  // async detectHallucination(
  //   context: string,
  //   query: string,
  //   response: string
  // ): Promise<boolean | null> {
  //   const filledPrompt = HALLUCINATION_PROMPT_TEMPLATE
  //     .replace("{agentDescription}", this.agentDescription)
  //     .replace("{context}", context)
  //     .replace("{query}", query)
  //     .replace("{response}", response);

  //   try {
  //     const result = await this.model.generateContent([
  //       { text: filledPrompt }
  //     ]);

  //     const textResponse = result.response.text().trim();
  //     const jsonMatch = textResponse.match(/\{[\s\S]*?\}/);

  //     if (!jsonMatch) {
  //       console.warn("Could not extract JSON from Gemini response:", textResponse);
  //       return null;
  //     }

  //     const parsed: HallucinationResult = JSON.parse(jsonMatch[0]);
  //     console.log(`✅ Hallucination check complete - ${parsed.isHallucination ? "DETECTED" : "NOT DETECTED"}`);
  //     console.log(`Reason: ${parsed.reasoning}`);
  //     return parsed.isHallucination;
  //   } catch (error) {
  //     console.error("❌ Error during hallucination detection:", error);
  //     return null;
  //   }
  // }

  async detectHallucination(
    context: string,
    query: string,
    response: string
  ): Promise<boolean | null> {
    const filledPrompt = HALLUCINATION_PROMPT_TEMPLATE
      .replace("{agentDescription}", this.agentDescription)
      .replace("{context}", context)
      .replace("{query}", query)
      .replace("{response}", response);

    try {
      // const result = await this.model.generateContent([{ text: filledPrompt }]);
      const result = await retryWithBackoff(() => this.model.generateContent([{ text: filledPrompt }]));


      const textResponse = result.response.text().trim();
      const jsonMatch = textResponse.match(/\{[\s\S]*?\}/);
      console.log('jsonMatch: ', jsonMatch);

      if (!jsonMatch) {
        console.warn("Could not extract JSON from Gemini response:", textResponse);
        return null;
      }

      const parsed: HallucinationResult = JSON.parse(jsonMatch[0]);
      console.log(`✅ Hallucination check complete - ${parsed.isHallucination ? "DETECTED" : "NOT DETECTED"}`);
      console.log(`Reason: ${parsed.reasoning}`);
      return parsed.isHallucination;
    } catch (error) {
      console.error("❌ Error during hallucination detection:", error);
      return null;
    }
  }

}

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let delay = 1000; // start with 1 second
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (err.status === 429 && i < retries - 1) {
        console.warn(`Rate limit hit. Retrying in ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; // exponential backoff
      } else {
        throw err;
      }
    }
  }
  throw new Error("Failed after retries due to rate limits");
}

export default HallucinationDetector;