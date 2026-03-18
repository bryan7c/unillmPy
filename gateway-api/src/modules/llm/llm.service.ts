/**
 * @fileoverview Gateway de conexão com o LiteLLM via Vercel AI SDK
 * @description Provê métodos de streaming e geração de texto usando pools de modelos gratuitos
 *   do LiteLLM. Failover sequencial: tenta cada modelo do pool em ordem até um responder.
 * @author Bryan Marvila
 * @version 4.0.0
 * @since 2026-03-18
 */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText, streamText } from 'ai';
import type { StreamTextResult } from 'ai';
import { readFile } from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';

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
    private readonly litellmBaseURL: string;
    private readonly litellmApiKey: string;

    constructor(private readonly configService: ConfigService) {
        this.litellmBaseURL = this.configService.get<string>(
            'LITELLM_BASE_URL',
            'http://localhost:4007/v1',
        );
        this.litellmApiKey = this.configService.get<string>(
            'LITELLM_API_KEY',
            'sk-default-key',
        );

        console.log(`[LlmService] Inicializado com LiteLLM em: ${this.litellmBaseURL}`);

        this.litellmProvider = createOpenAICompatible({
            name: 'litellm',
            baseURL: this.litellmBaseURL,
            apiKey: this.litellmApiKey,
        });
    }

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

    /** Lê todos os modelos de um pool do config.yaml, em ordem de prioridade. */
    private async getModelsForPool(poolName: string): Promise<string[]> {
        try {
            const configPath = process.env.LITELLM_CONFIG_PATH ||
                path.join(process.cwd(), 'litellm/config.yaml');

            const fileContents = await readFile(configPath, 'utf8');
            const config = yaml.load(fileContents) as any;

            if (!config?.model_list || !Array.isArray(config.model_list)) {
                console.warn('[LlmService] config.yaml sem model_list válido.');
                return [poolName];
            }

            const models = config.model_list
                .filter((m: any) => m.model_info?.pool === poolName)
                .map((m: any) => m.model_name);

            if (models.length === 0) {
                console.warn(`[LlmService] Pool "${poolName}" vazio no config.`);
                return [poolName];
            }

            return models;
        } catch (error: any) {
            console.error('[LlmService] Erro ao ler config:', error.message);
            return [poolName];
        }
    }

    /**
     * Consulta o LiteLLM para obter os IDs de modelos registrados.
     * Usado para filtrar modelos do config que o LiteLLM ainda não carregou.
     */
    private async getRegisteredModelIds(): Promise<Set<string>> {
        try {
            const response = await fetch(`${this.litellmBaseURL}/models`, {
                headers: { Authorization: `Bearer ${this.litellmApiKey}` },
            });
            if (!response.ok) return new Set();
            const data = await response.json();
            return new Set(data.data?.map((m: any) => m.id) ?? []);
        } catch {
            return new Set();
        }
    }

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

    async streamFreeChat(options: ChatOptions): Promise<{ result: StreamTextResult<any, any>; realModelId: string }> {
        const { messages, model, system, temperature } = options;
        const targetPool = model || FREE_POOL_TEXT;
        const coreMessages = this.normalizeToCoreMessages(messages);

        const [modelsInPool, registeredIds] = await Promise.all([
            this.getModelsForPool(targetPool),
            this.getRegisteredModelIds(),
        ]);

        // Filtra apenas modelos que o LiteLLM conhece (evita 400 por nome desconhecido).
        // Se não conseguir consultar o LiteLLM, usa a lista completa.
        const candidates = registeredIds.size > 0
            ? modelsInPool.filter(m => registeredIds.has(m))
            : modelsInPool;

        const targetModel = candidates.length > 0 ? candidates[0] : modelsInPool[0];

        if (candidates.length === 0) {
            console.warn(`[LlmService] Nenhum modelo do pool "${targetPool}" está registrado no LiteLLM. Usando "${targetModel}" mesmo assim.`);
        }

        console.log(`[LlmService] Stream: "${targetModel}" (${candidates.length}/${modelsInPool.length} candidatos registrados)`);

        const result = streamText({
            model: this.litellmProvider.chatModel(targetModel),
            messages: coreMessages,
            ...(system && { system }),
            ...(temperature !== undefined && { temperature }),
        });

        return { result, realModelId: targetModel };
    }

    async generateFreeChat(options: ChatOptions): Promise<{
        text: string;
        metadata: { model: string; usage: any; responseTime: string };
    }> {
        const { messages, model, system, temperature } = options;
        const targetPool = model || FREE_POOL_TEXT;
        const coreMessages = this.normalizeToCoreMessages(messages);

        const modelsInPool = await this.getModelsForPool(targetPool);
        const startTime = Date.now();

        let lastError: any;
        for (const modelName of modelsInPool) {
            try {
                console.log(`[LlmService] Generate: tentando "${modelName}"...`);

                const result = await generateText({
                    model: this.litellmProvider.chatModel(modelName),
                    messages: coreMessages,
                    ...(system && { system }),
                    ...(temperature !== undefined && { temperature }),
                });

                const responseTime = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`[LlmService] Generate OK: "${modelName}" em ${responseTime}s`);

                return {
                    text: result.text,
                    metadata: {
                        model: modelName,
                        usage: result.usage,
                        responseTime: `${responseTime}s`,
                    },
                };
            } catch (error: any) {
                lastError = error;
                console.warn(`[LlmService] "${modelName}" falhou: ${error.message}. Tentando próximo...`);
            }
        }

        console.error('[LlmService] Todos os modelos falharam.');
        throw new InternalServerErrorException('Todos os modelos do pool falharam.');
    }
}
