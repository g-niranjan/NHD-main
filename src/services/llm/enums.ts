import { Gem } from "lucide-react";

export enum LLMProvider {
  Anthropic = 'anthropic',
  OpenAI = 'openai',
  //!added by niranjan
  // Add other providers as needed  
  Gemini = 'gemini'
}

export enum AnthropicModel {
  Sonnet3_5 = 'claude-3-sonnet-20240229',
  Opus3 = 'claude-3-opus-20240229',
  Haiku3 = 'claude-3-haiku-20240307'
}

export enum OpenAIModel {
  GPT4 = 'gpt-4-0125-preview',
  GPT4Turbo = 'gpt-4-turbo-preview', 
  GPT35Turbo = 'gpt-3.5-turbo-0125'
}
//!added by niranjan
export enum GeminiModel {
  Sonnet3_5 = 'gemini-3.5-sonnet',
  Opus3 = 'gemini-3-opus',
  Haiku3 = 'gemini-3-haiku'
}