import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LlmService } from './llm.service';
import { ConfigService } from '@nestjs/config';
import * as aiModule from 'ai';

// Mockando o módulo 'ai' (Vercel AI SDK)
vi.mock('ai', () => ({
  generateText: vi.fn(),
}));

/**
 * @fileoverview Testes unitários do LlmService usando Vercel AI SDK
 * @description Garante que o serviço formata os chamados corretamente para a URL do LiteLLM
 * @author Bryan Marvila
 * @version 1.1.0
 * @since 2026-03-04
 */
describe('LlmService', () => {
  let llmService: LlmService;
  let configServiceMock: ConfigService;

  beforeEach(() => {
    configServiceMock = {
      get: vi.fn((key: string, defaultVal?: string) => {
        if (key === 'LITELLM_BASE_URL') return 'http://localhost:4000/v1';
        if (key === 'LITELLM_API_KEY') return 'sk-mock-key';
        return defaultVal ?? null;
      }),
    } as unknown as ConfigService;

    llmService = new LlmService(configServiceMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('generateResponse', () => {
    it('deve chamar o generateText com o modelo e prompt corretos', async () => {
      // Arrange
      const mockPrompt = 'Fale um texto qualquer';
      const mockResponse = { text: 'Resposta simulada da IA' };
      vi.mocked(aiModule.generateText).mockResolvedValue(mockResponse as any);

      // Act
      const response = await llmService.generateResponse(mockPrompt);

      // Assert
      expect(response).toBe('Resposta simulada da IA');
      expect(aiModule.generateText).toHaveBeenCalledTimes(1);

      const callArgs = vi.mocked(aiModule.generateText).mock.calls[0][0];
      expect(callArgs.prompt).toBe(mockPrompt);
      expect(callArgs.headers).toEqual({}); // Cache habilitado por padrão (headers vazios)
    });

    it('deve passar o header no-cache se o parâmetro noCache for verdadeiro', async () => {
      // Arrange
      const mockPrompt = 'Prompt sem cache';
      vi.mocked(aiModule.generateText).mockResolvedValue({ text: 'ok' } as any);

      // Act
      await llmService.generateResponse(mockPrompt, true);

      // Assert
      const callArgs = vi.mocked(aiModule.generateText).mock.calls[0][0];
      expect(callArgs.headers).toEqual({ 'no-cache': 'true' });
    });

    it('deve rejeitar e propagar erro caso o LiteLLM/Vercel retorne erro com mensagem', async () => {
      // Arrange
      vi.mocked(aiModule.generateText).mockRejectedValue(
        new Error('LiteLLM Timeout'),
      );

      // Act & Assert
      await expect(llmService.generateResponse('test')).rejects.toThrow(
        'Falha ao comunicar-se com o provedor LLM. Erro: LiteLLM Timeout',
      );
    });

    it('deve tratar erro sem propriedade message de forma genérica', async () => {
      // Arrange
      vi.mocked(aiModule.generateText).mockRejectedValue('Erro desconhecido');

      // Act & Assert
      await expect(llmService.generateResponse('test')).rejects.toThrow(
        'Falha ao comunicar-se com o provedor LLM. Erro: Erro desconhecido',
      );
    });
  });
});
