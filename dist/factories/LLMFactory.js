"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMFactory = void 0;
const OpenAIService_1 = require("../services/OpenAIService");
class LLMFactory {
    static createProvider(type, apiKey, modelName) {
        switch (type) {
            case 'openai':
                return new OpenAIService_1.OpenAIService();
            default:
                throw new Error('Provedor LLM não suportado');
        }
    }
}
exports.LLMFactory = LLMFactory;
