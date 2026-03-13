/**
 * @fileoverview Gateway de conexão com o LiteLLM via Vercel AI SDK
 * @description Provê métodos de streaming e geração de texto usando pools de modelos gratuitos
 *   do LiteLLM. Quando nenhum modelo é especificado, utiliza os pools `free-models-*`
 *   que garantem balanceamento e fallback automático entre modelos gratuitos.
 * @author Bryan Marvila
 * @version 2.1.0
 * @since 2026-03-04
 */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText, streamText } from 'ai';
import type { StreamTextResult } from 'ai';

const FREE_POOL_TEXT = 'free-models-text';

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
     * Envia um prompt cru para o modelo de triagem inicial (compatibilidade)
     * @param prompt Texto do usuário
     * @param noCache Ignora o cache do LiteLLM se verdadeiro
     * @returns Texto gerado pelo provedor de IA
     */
    async generateResponse(prompt: string, noCache?: boolean): Promise<string> {
        try {
            const response = await generateText({
                model: this.litellmProvider.chatModel('free-models-text'),
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
     * Cria um stream de resposta para conversa gratuita via pools LiteLLM.
     * Se `model` for fornecido, usa o modelo específico.
     * Caso contrário, usa o pool `free-models-text` que rotaciona entre modelos gratuitos.
     * @param messages Histórico de mensagens no formato CoreMessage
     * @param model Modelo específico (opcional — omitir = pool gratuito automático)
     * @returns Resultado do streamText com data stream compatível com Vercel AI SDK
     */
    streamFreeChat(messages: any[], model?: string, onFinish?: (r: any) => void): StreamTextResult<any, any> {
        const targetModel = model || FREE_POOL_TEXT;

        // Mapeia mensagens para o formato CoreMessage rigoroso
        const coreMessages: any[] = messages.map(msg => {
            const role = msg.role as 'user' | 'assistant' | 'system' | 'tool';

            // Garante que content nunca seja undefined e limpa campos não suportados como 'parts'
            let content = msg.content ?? '';

            // Se for do tipo Gemini (parts), converte para string/content-array se necessário
            // Para simplificar e garantir compatibilidade, forçamos string se parts existir
            if (msg.parts && Array.isArray(msg.parts)) {
                content = msg.parts.map((p: any) => p.text || '').join('\n');
            }

            const cleanMsg: any = { role, content };

            if (msg.tool_calls) cleanMsg.tool_calls = msg.tool_calls;
            if (msg.tool_results) cleanMsg.tool_results = msg.tool_results;

            return cleanMsg;
        });

        console.log(`[LlmService] Iniciando chat com modelo: ${targetModel}`);
        console.log(`[LlmService] Mensagens normalizadas:`, JSON.stringify(coreMessages));

        return streamText({
            model: this.litellmProvider.chatModel(targetModel),
            messages: coreMessages,
            onFinish: (result) => {
                console.log(`[LlmService] Chat finalizado. Uso:`, JSON.stringify(result.usage));
                onFinish?.(result);
            },
        });
    }
}
