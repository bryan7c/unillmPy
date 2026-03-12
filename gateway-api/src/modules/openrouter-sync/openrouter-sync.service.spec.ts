/**
 * @fileoverview Testes unitários do OpenRouterSyncService
 * @description Cobre os fluxos de sincronização, coleta de modelos e persistência YAML
 * @author Bryan Marvila
 * @version 1.0.0
 * @since 2026-03-06
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { OpenRouterSyncService } from './openrouter-sync.service';

vi.mock('fs/promises', () => ({
    readFile: vi.fn(),
    writeFile: vi.fn(),
    rename: vi.fn(),
    stat: vi.fn(),
    access: vi.fn(),
}));

import * as fsPromises from 'fs/promises';

const createFetchResponse = (body: any, ok = true, statusText = 'OK') => ({
    ok,
    statusText,
    json: () => Promise.resolve(body),
});

describe('OpenRouterSyncService', () => {
    let service: OpenRouterSyncService;
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.LITELLM_CONFIG_PATH = '/tmp/test-config.yaml';
        service = new OpenRouterSyncService();
        globalThis.fetch = vi.fn();
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        delete process.env.LITELLM_CONFIG_PATH;
    });

    describe('constructor', () => {
        it('deve usar LITELLM_CONFIG_PATH da env', () => {
            expect(service.configPath).toBe('/tmp/test-config.yaml');
        });

        it('deve usar path padrão quando env não definida', () => {
            delete process.env.LITELLM_CONFIG_PATH;
            const svc = new OpenRouterSyncService();
            expect(svc.configPath).toContain('config.yaml');
        });
    });

    describe('syncIfStale', () => {
        it('deve retornar sem ação se config.yaml não existir', async () => {
            vi.mocked(fsPromises.access).mockRejectedValue(new Error('ENOENT'));
            await service.syncIfStale();
            expect(fsPromises.stat).not.toHaveBeenCalled();
        });

        it('deve sincronizar se config.yaml tem mais de 24h', async () => {
            vi.mocked(fsPromises.access).mockResolvedValue(undefined);
            vi.mocked(fsPromises.stat).mockResolvedValue({
                mtimeMs: Date.now() - 25 * 60 * 60 * 1000,
            } as any);

            const syncSpy = vi.spyOn(service, 'syncFreeModels').mockResolvedValue();
            await service.syncIfStale();
            expect(syncSpy).toHaveBeenCalledOnce();
        });

        it('deve pular sincronização se config.yaml tem menos de 24h', async () => {
            vi.mocked(fsPromises.access).mockResolvedValue(undefined);
            vi.mocked(fsPromises.stat).mockResolvedValue({
                mtimeMs: Date.now() - 1 * 60 * 60 * 1000,
            } as any);

            const syncSpy = vi.spyOn(service, 'syncFreeModels').mockResolvedValue();
            await service.syncIfStale();
            expect(syncSpy).not.toHaveBeenCalled();
        });
    });

    describe('fetchFreeModelsByModality', () => {
        it('deve retornar slugs de modelos para modalidade text', async () => {
            vi.mocked(globalThis.fetch).mockResolvedValue(
                createFetchResponse({
                    data: { models: [{ slug: 'meta/llama-3:free' }, { slug: 'google/gemma-3' }] },
                }) as any,
            );

            const result = await service.fetchFreeModelsByModality('text');
            expect(result).toEqual(['meta/llama-3:free', 'google/gemma-3']);

            const calledUrl = vi.mocked(globalThis.fetch).mock.calls[0][0] as string;
            expect(calledUrl).not.toContain('output_modalities');
        });

        it('deve incluir output_modalities para image', async () => {
            vi.mocked(globalThis.fetch).mockResolvedValue(
                createFetchResponse({
                    data: { models: [{ slug: 'flux/model-1' }] },
                }) as any,
            );

            await service.fetchFreeModelsByModality('image');

            const calledUrl = vi.mocked(globalThis.fetch).mock.calls[0][0] as string;
            expect(calledUrl).toContain('output_modalities=image');
        });

        it('deve incluir output_modalities para embeddings', async () => {
            vi.mocked(globalThis.fetch).mockResolvedValue(
                createFetchResponse({
                    data: { models: [{ slug: 'nvidia/embed:free' }] },
                }) as any,
            );

            const result = await service.fetchFreeModelsByModality('embeddings');
            expect(result).toEqual(['nvidia/embed:free']);

            const calledUrl = vi.mocked(globalThis.fetch).mock.calls[0][0] as string;
            expect(calledUrl).toContain('output_modalities=embeddings');
        });

        it('deve retornar array vazio quando fetch falha', async () => {
            vi.mocked(globalThis.fetch).mockResolvedValue(
                createFetchResponse({}, false, 'Internal Server Error') as any,
            );

            const result = await service.fetchFreeModelsByModality('text');
            expect(result).toEqual([]);
        });

        it('deve retornar array vazio quando resposta não é array', async () => {
            vi.mocked(globalThis.fetch).mockResolvedValue(
                createFetchResponse({ data: { models: 'not-an-array' } }) as any,
            );

            const result = await service.fetchFreeModelsByModality('text');
            expect(result).toEqual([]);
        });

        it('deve usar id quando slug não existe', async () => {
            vi.mocked(globalThis.fetch).mockResolvedValue(
                createFetchResponse({
                    data: { models: [{ id: 'provider/model-fallback' }] },
                }) as any,
            );

            const result = await service.fetchFreeModelsByModality('text');
            expect(result).toEqual(['provider/model-fallback']);
        });
    });

    describe('syncFreeModels', () => {
        it('deve buscar image e embeddings antes de texto e deduplicar', async () => {
            const fetchSpy = vi.spyOn(service, 'fetchFreeModelsByModality');

            fetchSpy.mockImplementation(async (modality) => {
                if (modality === 'image') return ['flux/img-1'];
                if (modality === 'embeddings') return ['nvidia/embed-1'];
                return ['flux/img-1', 'nvidia/embed-1', 'meta/llama-3'];
            });

            const persistSpy = vi.spyOn(service, 'persistToYaml').mockResolvedValue();
            await service.syncFreeModels();

            expect(fetchSpy).toHaveBeenCalledTimes(3);
            expect(persistSpy).toHaveBeenCalledOnce();

            const entries = persistSpy.mock.calls[0][0];
            expect(entries).toHaveLength(3);

            const textEntries = entries.filter(e => e.poolName === 'free-models-text');
            expect(textEntries).toHaveLength(1);
            expect(textEntries[0].id).toBe('openrouter/meta/llama-3');

            const imageEntries = entries.filter(e => e.poolName === 'free-models-image');
            expect(imageEntries).toHaveLength(1);

            const embedEntries = entries.filter(e => e.poolName === 'free-models-embedding');
            expect(embedEntries).toHaveLength(1);
        });

        it('deve retornar sem persistir se nenhum modelo encontrado', async () => {
            vi.spyOn(service, 'fetchFreeModelsByModality').mockResolvedValue([]);
            const persistSpy = vi.spyOn(service, 'persistToYaml').mockResolvedValue();

            await service.syncFreeModels();
            expect(persistSpy).not.toHaveBeenCalled();
        });

        it('deve tratar erros sem lançar exceção', async () => {
            vi.spyOn(service, 'fetchFreeModelsByModality').mockRejectedValue(new Error('Network error'));

            await expect(service.syncFreeModels()).resolves.toBeUndefined();
        });
    });

    describe('persistToYaml', () => {
        it('deve preservar modelos não-free e adicionar os novos', async () => {
            const existingYaml = `
model_list:
  - model_name: gateway-default-model
    litellm_params:
      model: openrouter/stepfun/step-3.5-flash:free
      api_key: os.environ/OPENROUTER_API_KEY
  - model_name: free-models-text
    litellm_params:
      model: openrouter/old-model
      api_key: os.environ/OPENROUTER_API_KEY
litellm_settings:
  drop_params: true
`;
            vi.mocked(fsPromises.readFile).mockResolvedValue(existingYaml);
            vi.mocked(fsPromises.writeFile).mockResolvedValue();
            vi.mocked(fsPromises.rename).mockResolvedValue();

            await service.persistToYaml([
                { id: 'openrouter/new-model', poolName: 'free-models-text' },
            ]);

            expect(fsPromises.writeFile).toHaveBeenCalledOnce();
            const writtenYaml = vi.mocked(fsPromises.writeFile).mock.calls[0][1] as string;

            expect(writtenYaml).toContain('gateway-default-model');
            expect(writtenYaml).toContain('openrouter/new-model');
            expect(writtenYaml).not.toContain('openrouter/old-model');
            expect(writtenYaml).toContain('drop_params');
        });

        it('deve lançar erro quando YAML é inválido', async () => {
            vi.mocked(fsPromises.readFile).mockResolvedValue('null');

            await expect(
                service.persistToYaml([{ id: 'x', poolName: 'y' }]),
            ).rejects.toThrow('YAML inválido');
        });

        it('deve criar model_list quando não existe no YAML', async () => {
            vi.mocked(fsPromises.readFile).mockResolvedValue('litellm_settings:\n  drop_params: true');
            vi.mocked(fsPromises.writeFile).mockResolvedValue();
            vi.mocked(fsPromises.rename).mockResolvedValue();

            await service.persistToYaml([
                { id: 'openrouter/test', poolName: 'free-models-text' },
            ]);

            const writtenYaml = vi.mocked(fsPromises.writeFile).mock.calls[0][1] as string;
            expect(writtenYaml).toContain('openrouter/test');
        });

        it('deve usar escrita direta para evitar quebra de inode no Docker', async () => {
            vi.mocked(fsPromises.readFile).mockResolvedValue('model_list: []');
            vi.mocked(fsPromises.writeFile).mockResolvedValue();

            await service.persistToYaml([{ id: 'x', poolName: 'y' }]);

            const targetPath = vi.mocked(fsPromises.writeFile).mock.calls[0][0] as string;
            expect(targetPath).not.toContain('.tmp');
            expect(targetPath).toBe(service.configPath);
        });
    });

    describe('handleDailySync', () => {
        it('deve chamar syncFreeModels', async () => {
            const syncSpy = vi.spyOn(service, 'syncFreeModels').mockResolvedValue();
            await service.handleDailySync();
            expect(syncSpy).toHaveBeenCalledOnce();
        });
    });

    describe('onModuleInit', () => {
        it('deve chamar syncIfStale', async () => {
            const staleSpy = vi.spyOn(service, 'syncIfStale').mockResolvedValue();
            await service.onModuleInit();
            expect(staleSpy).toHaveBeenCalledOnce();
        });
    });
});
