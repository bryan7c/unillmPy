"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIService = void 0;
const axios_1 = __importDefault(require("axios"));
const apiConfig_1 = require("../config/apiConfig");
class OpenAIService {
    generateText(input, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.post(`${apiConfig_1.API_CONFIG.openai.baseUrl}/completions`, Object.assign({ prompt: input }, options), {
                headers: { Authorization: `Bearer ${apiConfig_1.API_CONFIG.openai.apiKey}` }
            });
            return response.data.choices[0].text;
        });
    }
    getEmbedding(input) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implementar chamada para obter embedding
            return []; // Retorna um array vazio como exemplo
        });
    }
    translateText(input, targetLanguage) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implementar chamada para tradução
            return ""; // Retorna um array vazio como exemplo
        });
    }
}
exports.OpenAIService = OpenAIService;
