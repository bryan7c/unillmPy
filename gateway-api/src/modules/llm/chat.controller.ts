/**
 * @fileoverview Controller de conversa com modelos de IA
 * @description Expõe rotas de chat protegidas com validação Zod.
 *   A rota `/api/chat/free` garante uso exclusivo de modelos gratuitos via pools LiteLLM.
 *   A rota `/api/chat/generate` oferece geração síncrona com metadata.
 *   Se um `model` é fornecido, o LiteLLM usa esse modelo diretamente.
 * @author Bryan Marvila
 * @version 3.0.0
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
    system: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
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
     * Suporta `system` prompt para injeção de contexto (RAG).
     * Aplica sliding window de 15 mensagens para otimizar contexto.
     */
    @Post('free')
    async streamFree(@Body() body: any, @Res() res: Response) {
        console.log('[ChatController] POST /free:', JSON.stringify(body).slice(0, 500));
        const parsed = freeChatSchema.safeParse(body);
        if (!parsed.success) {
            console.error('[ChatController] Validação:', JSON.stringify(parsed.error.format()));
            throw new BadRequestException(parsed.error.format());
        }

        const { messages, model, system, temperature } = parsed.data;
        const targetModel = model || 'free-models-text';
        const startTime = Date.now();

        // Sliding window: envia apenas as últimas 15 mensagens ao LLM
        const MAX_CONTEXT_MESSAGES = 15;
        const windowedMessages = messages.length > MAX_CONTEXT_MESSAGES
            ? messages.slice(-MAX_CONTEXT_MESSAGES)
            : messages;

        console.log(`[ChatController] Msgs: ${messages.length} total, ${windowedMessages.length} ao LLM`);

        let finishMeta: any = {};

        const { result, realModelId } = await this.llmService.streamFreeChat({
            messages: windowedMessages as any[],
            model,
            system,
            temperature,
        });

        console.log(`[ChatController] Iniciando stream com realModelId: ${realModelId}`);

        (result as any).pipeUIMessageStreamToResponse(res, {
            messageMetadata: ({ part }: { part: any }) => {
                if (part.type === 'start') {
                    console.log(`[ChatController] Enviando metadata START com model: ${realModelId}`);
                    return {
                        model: realModelId,
                        provider: 'litellm',
                    };
                }
                if (part.type === 'finish') {
                    const responseTime = ((Date.now() - startTime) / 1000).toFixed(1);
                    console.log(`[ChatController] Enviando metadata FINISH para ${realModelId}. Uso:`, part.usage);
                    return {
                        model: realModelId,
                        usage: part.usage,
                        responseTime: `${responseTime}s`,
                    };
                }
            },
        });
    }

    /**
     * Endpoint síncrono de geração de texto.
     * Retorna a resposta completa com metadata (modelo, tempo, uso de tokens).
     * Ideal para pipelines de IA que não precisam de streaming (ex: geração de insights).
     */
    @Post('generate')
    async generateChat(@Body() body: any) {
        console.log('[ChatController] POST /generate:', JSON.stringify(body).slice(0, 500));
        const parsed = freeChatSchema.safeParse(body);
        if (!parsed.success) {
            console.error('[ChatController] Validação:', JSON.stringify(parsed.error.format()));
            throw new BadRequestException(parsed.error.format());
        }

        const { messages, model, system, temperature } = parsed.data;

        const result = await this.llmService.generateFreeChat({
            messages: messages as any[],
            model,
            system,
            temperature,
        });

        return result;
    }
}
