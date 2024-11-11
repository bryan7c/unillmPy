// src/services/LLMServiceFactory.ts
import { ILLMService } from "../interfaces/ILLMService";
import { OpenAIService } from "../services/OpenAIService";

export class LLMServiceFactory {
    static getService(provider: string): ILLMService {
        switch (provider.toLowerCase()) {
            case "openai":
                return new OpenAIService();
            default:
                throw new Error("Unsupported provider");
        }
    }
}
