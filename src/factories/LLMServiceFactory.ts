// src/services/LLMServiceFactory.ts
import { ILLMService } from "../interfaces/ILLMService";
import { OpenAIService } from "../services/OpenAIService";
import { OllamaService } from "../services/OllamaService";
export class LLMServiceFactory {
    static getService(provider: string): ILLMService {
        switch (provider.toLowerCase()) {
            case "openai":
                return new OpenAIService();
            case "ollama":
                return new OllamaService();
            default:
                throw new Error("Unsupported provider");
        }
    }
}
