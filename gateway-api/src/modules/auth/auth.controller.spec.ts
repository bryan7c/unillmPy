import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';

/**
 * @fileoverview Testes unitários do Controller de Autenticação
 * @description Garante que a rota exposta responde corretamente quando validada ou não pelo guard.
 * @author Bryan Marvila
 * @version 1.0.0
 * @since 2026-03-04
 */
describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
        controller = new AuthController(authService);
    });

    describe('verify', () => {
        it('deve retornar a confirmação de que o token é válido quando a rota for acessada', () => {
            // Act
            const result = controller.verifyToken();

            // Assert
            expect(result).toEqual({
                status: 'success',
                message: 'Token válido. Acesso permitido ao OmniBridge.'
            });
        });

        it('a rota /verify deve estar protegida pelo AuthGuard', () => {
            // Act
            const guards = Reflect.getMetadata('__guards__', controller.verifyToken);

            // Assert
            expect(guards).toBeDefined();
            expect(guards[0]).toBe(AuthGuard);
        });
    });
});
