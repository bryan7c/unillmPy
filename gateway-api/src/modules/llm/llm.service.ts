/**
 * @fileoverview Gateway de conexão com o LiteLLM via Vercel AI SDK
 * @description Provê métodos de streaming e geração de texto usando pools de modelos gratuitos
 *   do LiteLLM. Quando nenhum modelo é especificado, utiliza os pools `free-models-*`
 *   que garantem balanceamento e fallback automático entre modelos gratuitos.
 * @author Bryan Marvila
 * @version 3.0.0
 * @since 2026-03-04
 */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText, streamText } from 'ai';
import type { StreamTextResult } from 'ai';

const FREE_POOL_TEXT = 'free-models-text';

interface ChatOptions {
    messages: any[];
    model?: string;
    system?: string;
    temperature?: number;
}

@Injectable()
export class LlmService {
    private readonly litellmProvider;

    constructor(private readonly configService: ConfigService) {
        const baseURL = this.configService.get<string>(
            'LITELLM_BASE_URL',
            'http://localhost:4007/v1',
        );
        const apiKey = this.configService.get<string>(
            'LITELLM_API_KEY',
            'sk-default-key',
        );

        this.litellmProvider = createOpenAICompatible({
            name: 'litellm',
            baseURL,
            apiKey,
        });
    }

    /**
     * Normaliza mensagens para o formato CoreMessage do AI SDK.
     * Converte `parts` (Gemini-style) para string e limpa campos não suportados.
     */
    private normalizeToCoreMessages(messages: any[]): any[] {
        return messages.map(msg => {
            const role = msg.role as 'user' | 'assistant' | 'system' | 'tool';
            let content = msg.content ?? '';

            if (msg.parts && Array.isArray(msg.parts)) {
                content = msg.parts.map((p: any) => p.text || '').join('\n');
            }

            const cleanMsg: any = { role, content };
            if (msg.tool_calls) cleanMsg.tool_calls = msg.tool_calls;
            if (msg.tool_results) cleanMsg.tool_results = msg.tool_results;

            return cleanMsg;
        });
    }

    /**
     * Envia um prompt cru para o modelo de triagem inicial (compatibilidade)
     * @param prompt Texto do usuário
     * @param noCache Ignora o cache do LiteLLM se verdadeiro
     * @returns Texto gerado pelo provedor de IA
     */
    async generateResponse(prompt: string, noCache?: boolean): Promise<string> {
        try {
            const response = await generateText({
                model: this.litellmProvider.chatModel(FREE_POOL_TEXT),
                prompt,
                headers: noCache ? { 'no-cache': 'true' } : {},
            });

            return response.text;
        } catch (error: any) {
            throw new InternalServerErrorException(
                `Falha ao comunicar-se com o provedor LLM. Erro: ${error.message || error}`,
            );
        }
    }

    /**
     * Cria um stream de resposta para conversa via pools LiteLLM.
     * Suporta system prompt opcional para aplicações que injetam contexto (ex: Artha RAG).
     * @param options Opções de chat (messages, model, system)
     * @param onFinish Callback chamado quando o stream finaliza
     * @returns Resultado do streamText com data stream compatível com Vercel AI SDK
     */
    streamFreeChat(options: ChatOptions, onFinish?: (r: any) => void): StreamTextResult<any, any> {
        const { messages, model, system, temperature } = options;
        const targetModel = model || FREE_POOL_TEXT;
        const coreMessages = this.normalizeToCoreMessages(messages);

        console.log(`[LlmService] Stream com modelo: ${targetModel} | System: ${system ? 'Sim' : 'Não'}`);

        return streamText({
            model: this.litellmProvider.chatModel(targetModel),
            messages: coreMessages,
            ...(system && { system }),
            ...(temperature !== undefined && { temperature }),
            onFinish: (result) => {
                console.log(`[LlmService] Stream finalizado. Uso:`, JSON.stringify(result.usage));
                onFinish?.(result);
            },
        });
    }

    /**
     * Geração síncrona de texto para aplicações que não precisam de streaming.
     * Retorna texto completo + metadata (modelo, uso, tempo).
     * @param options Opções de chat (messages, model, system, temperature)
     * @returns Objeto com text e metadata
     */
    async generateFreeChat(options: ChatOptions): Promise<{
        text: string;
        metadata: { model: string; usage: any; responseTime: string };
    }> {
        const { messages, model, system, temperature } = options;
        const targetModel = model || FREE_POOL_TEXT;
        const coreMessages = this.normalizeToCoreMessages(messages);

        console.log(`[LlmService] Generate com modelo: ${targetModel} | System: ${system ? 'Sim' : 'Não'}`);

        const startTime = Date.now();

        try {
            const result = await generateText({
                model: this.litellmProvider.chatModel(targetModel),
                messages: coreMessages,
                ...(system && { system }),
                ...(temperature !== undefined && { temperature }),
            });

            const responseTime = ((Date.now() - startTime) / 1000).toFixed(1);

            console.log(`[LlmService] Generate finalizado em ${responseTime}s. Uso:`, JSON.stringify(result.usage));

            return {
                text: result.text,
                metadata: {
                    model: result.response?.modelId ?? targetModel,
                    usage: result.usage,
                    responseTime: `${responseTime}s`,
                },
            };
        } catch (error: any) {
            throw new InternalServerErrorException(
                `Falha ao gerar resposta LLM. Erro: ${error.message || error}`,
            );
        }
    }
}
