import { ILLMService } from '../interfaces/ILLMService';
import { OpenAIService } from '../services/OpenAIService';

export class LLMFactory {
  static createProvider(type: 'openai' | 'anthropic', apiKey: string, modelName?: string): ILLMService {
    switch (type) {
      case 'openai':
        return new OpenAIService();
      default:
        throw new Error('Provedor LLM não suportado');
    }
  }
} 