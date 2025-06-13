import { TestMessage } from "@/types/runs";

export interface Rule {
    id: string;
    path: string;
    condition: string;
    value: string;
    isValid: boolean;
  }
  
  export interface ApiConfig {
    inputFormat: Record<string, any>;
    outputFormat: Record<string, any>;
    rules: Rule[];
  }
  
  export interface QaAgentConfig {
    modelId: string;
    provider: string;
    headers: Record<string, string>;
    endpointUrl: string;
    apiConfig: ApiConfig;
    persona?: string;
    userApiKey: string;
    extraParams?: Record<string, any>;
    conversationId?: string;
    agentDescription: string; 
  }

  export interface TestResult {
    conversation: {
      humanMessage: string;
      rawInput: Record<string, any>;
      rawOutput: Record<string, any>;
      chatResponse: string;
      allMessages: TestMessage[];
    };
    validation: {
      passedTest: boolean;
      formatValid: boolean;
      conditionMet: boolean;
      explanation: string;
      conversationResult?: {
        isCorrect: boolean;
        explanation: string;
      };
      metrics: {
        responseTime: number;
      };
    };
  }
