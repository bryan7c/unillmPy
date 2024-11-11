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
exports.generateText = void 0;
const LLMServiceFactory_1 = require("../factories/LLMServiceFactory");
const generateText = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { provider, input } = req.body;
    const llmService = LLMServiceFactory_1.LLMServiceFactory.getService(provider);
    try {
        const result = yield llmService.generateText(input);
        res.json({ result });
    }
    catch (error) {
        next(error); // Passa o erro para o próximo middleware de tratamento de erros
    }
});
exports.generateText = generateText;
