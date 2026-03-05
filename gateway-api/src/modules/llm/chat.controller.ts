import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { LlmService } from './llm.service';
import { AuthGuard } from '../auth/auth/auth.guard';
import { z } from 'zod';

const chatSchema = z.object({
    prompt: z.string().min(2, 'O prompt precisa ter pelo menos 2 caracteres.'),
    noCache: z.boolean().optional(),
});

/**
 * @fileoverview Ponto de entrada das aplicações paras conversação via Modelos de IA
 * @description Expõe a rota POST /api/chat protegida e já validação de input do Zod.
 * @author Bryan Marvila
 * @version 1.1.0
 * @since 2026-03-04
 */
@Controller('api/chat')
export class ChatController {
    constructor(private readonly llmService: LlmService) { }

    @Post()
    @UseGuards(AuthGuard)
    async generate(@Body() body: any) {
        const parsed = chatSchema.safeParse(body);
        if (!parsed.success) {
            throw new BadRequestException(parsed.error.format());
        }

        const { prompt, noCache } = parsed.data;
        const responseText = await this.llmService.generateResponse(prompt, noCache);

        return {
            message: responseText,
        };
    }
}
