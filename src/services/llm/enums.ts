export enum LLMProvider {
  Anthropic = 'anthropic',
  OpenAI = 'openai',
  //!added by niranjan
  // Add other providers as needed  
  Google = 'google'
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
export enum GoogleModel {
  Gemini15Pro = 'gemini-1.5-pro-latest',
  Gemini10Pro = 'gemini-1.0-pro-latest',
  Gemini1_5Flash = 'gemini-1.5-flash-latest',
  Gemini2_5Flash = 'gemini-2.5-flash-latest',
}