/**
 * @fileoverview Serviço de sincronização de modelos gratuitos do OpenRouter
 * @description Busca modelos gratuitos do OpenRouter via API interna do frontend
 *              e atualiza o config.yaml do LiteLLM com os pools de balanceamento.
 * @author Bryan Marvila
 * @version 3.0.0
 * @since 2026-03-06
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { readFile, writeFile, rename, stat, access } from 'fs/promises';
import { constants } from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const FRONTEND_API_URL = 'https://openrouter.ai/api/frontend/models/find';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

type Modality = 'text' | 'image' | 'embeddings';

interface FreeModelEntry {
    id: string;
    poolName: string;
}

const MODALITY_TO_POOL: Record<Modality, string> = {
    text: 'free-models-text',
    image: 'free-models-image',
    embeddings: 'free-models-embedding',
};

@Injectable()
export class OpenRouterSyncService implements OnModuleInit {
    private readonly logger = new Logger(OpenRouterSyncService.name);
    readonly configPath: string;

    constructor() {
        this.configPath =
            process.env.LITELLM_CONFIG_PATH ||
            path.resolve(process.cwd(), '../litellm/config.yaml');
    }

    async onModuleInit(): Promise<void> {
        await this.syncIfStale();
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailySync(): Promise<void> {
        this.logger.log('Sincronização diária iniciada.');
        await this.syncFreeModels();
    }

    async syncIfStale(): Promise<void> {
        try {
            await access(this.configPath, constants.F_OK);
        } catch {
            this.logger.warn(`config.yaml não encontrado em ${this.configPath}.`);
            return;
        }

        const { mtimeMs } = await stat(this.configPath);
        const ageMs = Date.now() - mtimeMs;

        if (ageMs > TWENTY_FOUR_HOURS_MS) {
            this.logger.log(`config.yaml desatualizado (${(ageMs / 3_600_000).toFixed(1)}h). Sincronizando...`);
            await this.syncFreeModels();
        } else {
            this.logger.log(`config.yaml recente (${(ageMs / 3_600_000).toFixed(1)}h). Nenhuma ação.`);
        }
    }

    async syncFreeModels(): Promise<void> {
        try {
            const specializedEntries = await this.fetchSpecializedModalities();
            const specializedSlugs = new Set(specializedEntries.map(e => e.id));

            const textSlugs = await this.fetchFreeModelsByModality('text');
            const textEntries: FreeModelEntry[] = textSlugs
                .filter(slug => !specializedSlugs.has(`openrouter/${slug}`))
                .map(slug => ({ id: `openrouter/${slug}`, poolName: MODALITY_TO_POOL.text }));

            const allEntries = [...specializedEntries, ...textEntries];

            if (allEntries.length === 0) {
                this.logger.warn('Nenhum modelo gratuito encontrado.');
                return;
            }

            this.logger.log(`${allEntries.length} modelos gratuitos encontrados. Atualizando YAML...`);
            await this.persistToYaml(allEntries);
        } catch (error) {
            this.logger.error('Falha na sincronização.', error);
        }
    }

    async fetchFreeModelsByModality(modality: Modality): Promise<string[]> {
        const params = new URLSearchParams({ fmt: 'cards', max_price: '0' });

        if (modality !== 'text') {
            params.set('output_modalities', modality);
        }

        const url = `${FRONTEND_API_URL}?${params.toString()}`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OmniBridge/1.0)' },
        });

        if (!response.ok) {
            this.logger.warn(`Falha ao buscar ${modality}: ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        const models = data?.data?.models ?? data?.data ?? [];

        if (!Array.isArray(models)) {
            this.logger.warn(`Resposta inesperada para ${modality}.`);
            return [];
        }

        return models.map((m: any) => m.slug ?? m.id).filter(Boolean);
    }

    async persistToYaml(entries: FreeModelEntry[]): Promise<void> {
        const fileContents = await readFile(this.configPath, 'utf8');
        const config = yaml.load(fileContents) as Record<string, any>;

        if (!config || typeof config !== 'object') {
            throw new Error('YAML inválido.');
        }

        const preserved = (config.model_list ?? []).filter(
            (m: any) => !m.model_name?.startsWith('free-models-'),
        );

        const generated = entries.map(({ id, poolName }) => ({
            model_name: poolName,
            litellm_params: {
                model: id,
                api_key: 'os.environ/OPENROUTER_API_KEY',
            },
        }));

        config.model_list = [...preserved, ...generated];

        const newYaml = yaml.dump(config, { indent: 2, lineWidth: -1, noRefs: true });
        
        // Em ambientes Docker local no Windows (Bind Mounts OCI), usar fs.rename (Atomic Write com inodes)
        // destrói o arquivo original na máquina host e recria, o que faz o docker container perder
        // referência de inode. Então sobrescrevemos diretamente o arquivo:
        await writeFile(this.configPath, newYaml, 'utf8');

        this.logger.log(`✅ config.yaml atualizado com ${entries.length} modelos.`);
    }

    private async fetchSpecializedModalities(): Promise<FreeModelEntry[]> {
        const modalities: Modality[] = ['image', 'embeddings'];
        const entries: FreeModelEntry[] = [];

        for (const modality of modalities) {
            const slugs = await this.fetchFreeModelsByModality(modality);
            const poolName = MODALITY_TO_POOL[modality];
            entries.push(...slugs.map(slug => ({ id: `openrouter/${slug}`, poolName })));
            this.logger.log(`${modality}: ${slugs.length} modelos`);
        }

        return entries;
    }
}
