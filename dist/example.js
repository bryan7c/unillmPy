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
Object.defineProperty(exports, "__esModule", { value: true });
const LLMServiceFactory_1 = require("./factories/LLMServiceFactory");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const openaiProvider = LLMServiceFactory_1.LLMServiceFactory.getService('openai');
        // Uso normal
        const openaiResponse = yield openaiProvider.generateText('Olá, como vai?', {
            temperature: 0.7,
            maxTokens: 100
        });
        console.log(openaiResponse);
        // TODO Uso com streaming
    });
}
main().catch(console.error);
