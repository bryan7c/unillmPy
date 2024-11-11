"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMServiceFactory = void 0;
const OpenAIService_1 = require("../services/OpenAIService");
class LLMServiceFactory {
    static getService(provider) {
        switch (provider.toLowerCase()) {
            case "openai":
                return new OpenAIService_1.OpenAIService();
            default:
                throw new Error("Unsupported provider");
        }
    }
}
exports.LLMServiceFactory = LLMServiceFactory;
