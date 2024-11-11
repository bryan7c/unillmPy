// src/controllers/llmController.ts
import { Request, Response, NextFunction } from "express";
import { LLMServiceFactory } from "../factories/LLMServiceFactory";

export const generateText = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { provider, input, options } = req.body;
    const llmService = LLMServiceFactory.getService(provider);

    try {
        const result = await llmService.generateText(input);
        res.json({ result });
    } catch (error) {
        next(error); // Passa o erro para o próximo middleware de tratamento de erros
    }
};
