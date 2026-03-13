/**
 * @fileoverview Controller de conversa com modelos de IA
 * @description Expõe rotas de chat protegidas com validação Zod.
 *   A rota `/api/chat/free` garante uso exclusivo de modelos gratuitos via pools LiteLLM.
 *   Se um `model` é fornecido, o LiteLLM usa esse modelo diretamente.
 * @author Bryan Marvila
 * @version 2.1.0
 * @since 2026-03-04
 */
import { Controller, Post, Body, UseGuards, BadRequestException, Res } from '@nestjs/common';
import type { Response } from 'express';
import { LlmService } from './llm.service';
import { AuthGuard } from '../auth/auth/auth.guard';
import { z } from 'zod';

const chatSchema = z.object({
    prompt: z.string().min(2, 'O prompt precisa ter pelo menos 2 caracteres.'),
    noCache: z.boolean().optional(),
});

const messageSchema = z.object({
    role: z.enum(['user', 'assistant', 'system', 'tool']),
    content: z.union([
        z.string(),
        z.array(z.object({
            type: z.enum(['text', 'image']),
            text: z.string().optional(),
            image: z.any().optional(),
        }).passthrough()),
    ]).optional(),
    tool_calls: z.array(z.any()).optional(),
    tool_results: z.array(z.any()).optional(),
}).passthrough();

const freeChatSchema = z.object({
    messages: z.array(messageSchema).min(1, 'Envie pelo menos uma mensagem.'),
    model: z.string().optional(),
});

@Controller('api/chat')
export class ChatController {
    constructor(private readonly llmService: LlmService) { }

    /**
     * Endpoint legado de geração de texto (compatibilidade)
     */
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

    /**
     * Endpoint de conversa gratuita com streaming SSE.
     * Usa exclusivamente pools de modelos gratuitos do LiteLLM.
     * Se `model` for fornecido no body, usa o modelo específico.
     * Aplica sliding window de 15 mensagens para otimizar contexto.
     */
    @Post('free')
    async streamFree(@Body() body: any, @Res() res: Response) {
        console.log('[ChatController] Recebido pedido no /free:', JSON.stringify(body).slice(0, 500));
        const parsed = freeChatSchema.safeParse(body);
        if (!parsed.success) {
            console.error('[ChatController] Erro de validação Zod:', JSON.stringify(parsed.error.format()));
            throw new BadRequestException(parsed.error.format());
        }

        const { messages, model } = parsed.data;
        const targetModel = model || 'free-models-text';
        const startTime = Date.now();

        // Sliding window: envia apenas as últimas 15 mensagens ao LLM
        const MAX_CONTEXT_MESSAGES = 15;
        const windowedMessages = messages.length > MAX_CONTEXT_MESSAGES
            ? messages.slice(-MAX_CONTEXT_MESSAGES)
            : messages;

        console.log(`[ChatController] Mensagens: ${messages.length} total, ${windowedMessages.length} enviadas ao LLM`);

        let finishMeta: any = {};

        const result = this.llmService.streamFreeChat(
            windowedMessages as any[],
            model,
            (finishResult) => {
                const responseTime = ((Date.now() - startTime) / 1000).toFixed(1);
                finishMeta = {
                    model: finishResult.response?.modelId ?? targetModel,
                    usage: finishResult.usage,
                    responseTime: `${responseTime}s`,
                };
                console.log('[ChatController] Stream finalizado, meta:', JSON.stringify(finishMeta));
            },
        );

        result.pipeUIMessageStreamToResponse(res, {
            messageMetadata: ({ part }: { part: any }) => {
                if (part.type === 'start') {
                    return {
                        model: targetModel,
                        provider: 'litellm',
                    };
                }
                if (part.type === 'finish') {
                    return finishMeta;
                }
            },
        });
    }
}
