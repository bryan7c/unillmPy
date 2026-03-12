import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatController } from './chat.controller';
import { LlmService } from './llm.service';
import { AuthGuard } from '../auth/auth/auth.guard';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * @fileoverview Testes unitários do Controller de Chat (LLM)
 * @description Garante validações e chamadas repassadas ao Service.
 * @author Bryan Marvila
 * @version 1.0.0
 * @since 2026-03-04
 */
describe('ChatController', () => {
    let controller: ChatController;
    let llmServiceMock: LlmService;

    beforeEach(() => {
        // Mock do serviço para testes isolados
        llmServiceMock = {
            generateResponse: vi.fn(),
        } as unknown as LlmService;

        controller = new ChatController(llmServiceMock);
    });

    describe('generate', () => {
        it('deve usar o LlmService e retornar o texto do payload gerado pela IA', async () => {
            // Arrange
            const dto = { prompt: 'Qual é a resposta para a vida, o universo e tudo mais?' };
            vi.spyOn(llmServiceMock, 'generateResponse').mockResolvedValue('A resposta é 42.');

            // Act
            const result = await controller.generate(dto);

            // Assert
            expect(result).toEqual({ message: 'A resposta é 42.' });
            expect(llmServiceMock.generateResponse).toHaveBeenCalledWith(dto.prompt, undefined);
        });

        it('deve repassar o campo noCache para o LlmService quando fornecido', async () => {
            // Arrange
            const dto = { prompt: 'Teste com cache off', noCache: true };
            vi.spyOn(llmServiceMock, 'generateResponse').mockResolvedValue('Resposta sem cache');

            // Act
            await controller.generate(dto);

            // Assert
            expect(llmServiceMock.generateResponse).toHaveBeenCalledWith(dto.prompt, true);
        });

        it('deve lançar BadRequestException se o prompt for inválido (muito curto)', async () => {
            // Arrange
            const dto = { prompt: 'a' }; // Mínimo é 2

            // Act & Assert
            await expect(controller.generate(dto)).rejects.toThrow(BadRequestException);
            expect(llmServiceMock.generateResponse).not.toHaveBeenCalled();
        });

        it('a rota de chat deve estar protegida pelo AuthGuard de Chaves Internas', () => {
            // Act
            const guards = Reflect.getMetadata('__guards__', controller.generate);

            // Assert
            expect(guards).toBeDefined();
            expect(guards[0]).toBe(AuthGuard);
        });
    });
});
