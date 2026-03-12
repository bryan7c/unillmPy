import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';

/**
 * @fileoverview Gateway de conexão com o painel LiteLLM
 * @description Injeta as configurações locais e repassa o processamento NLP para o roteador LLM.
 *   Utiliza @ai-sdk/openai-compatible para tolerância total ao JSON estendido do OpenRouter/LiteLLM.
 * @author Bryan Marvila
 * @version 1.1.0
 * @since 2026-03-04
 */
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
     * Envia um prompt cru para o modelo de triagem inicial
     * @param prompt Texto do usuário para testes base
     * @param noCache Opcional: Ignora o cache do LiteLLM se verdadeiro
     * @returns Texto gerado pelo provedor de IA
     */
    async generateResponse(prompt: string, noCache?: boolean): Promise<string> {
        try {
            const response = await generateText({
                model: this.litellmProvider.chatModel('gateway-default-model'),
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
}
