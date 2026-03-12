import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../auth.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * @fileoverview Testes unitários do AuthGuard
 * @description Valida a intercepção e extração do cabeçalho "Authorization" e a sinergia com o AuthService
 * @author Bryan Marvila
 * @version 1.0.0
 * @since 2026-03-04
 */
describe('AuthGuard', () => {
    let guard: AuthGuard;
    let authServiceMock: AuthService;

    beforeEach(() => {
        // Mockando AuthService
        authServiceMock = {
            validateInternalKey: vi.fn(),
        } as unknown as AuthService;

        guard = new AuthGuard(authServiceMock);
    });

    const createMockContext = (headers: Record<string, string>): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({ headers }),
            }),
        } as unknown as ExecutionContext;
    };

    describe('canActivate', () => {
        it('deve autorizar a requisição se o cabeçalho Authorization for válido', async () => {
            // Arrange
            const validToken = 'omni_sk_mock_valid_key_2026';
            const mockContext = createMockContext({ authorization: `Bearer ${validToken}` });

            // Simulando resposta do serviço
            vi.spyOn(authServiceMock, 'validateInternalKey').mockResolvedValue(true);

            // Act
            const result = await guard.canActivate(mockContext);

            // Assert
            expect(result).toBe(true);
            expect(authServiceMock.validateInternalKey).toHaveBeenCalledWith(validToken);
        });

        it('deve lançar UnauthorizedException se não houver cabeçalho Authorization', async () => {
            // Arrange
            const mockContext = createMockContext({});

            // Act & Assert
            await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
            expect(authServiceMock.validateInternalKey).not.toHaveBeenCalled();
        });

        it('deve lançar UnauthorizedException se o token não for do tipo Bearer', async () => {
            // Arrange
            const mockContext = createMockContext({ authorization: `Basic user:pass` });

            // Act & Assert
            await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
            expect(authServiceMock.validateInternalKey).not.toHaveBeenCalled();
        });

        it('deve lançar UnauthorizedException se o token for inválido', async () => {
            // Arrange
            const invalidToken = 'omni_sk_mock_invalid_key_9999';
            const mockContext = createMockContext({ authorization: `Bearer ${invalidToken}` });

            // Simulando serviço rejeitando a chave
            vi.spyOn(authServiceMock, 'validateInternalKey').mockResolvedValue(false);

            // Act & Assert
            await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
            expect(authServiceMock.validateInternalKey).toHaveBeenCalledWith(invalidToken);
        });
    });
});
