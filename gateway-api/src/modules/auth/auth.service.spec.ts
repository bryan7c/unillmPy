import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth.service';

/**
 * @fileoverview Testes unitários do serviço de autenticação
 * @description Valida a lógica de negócio para chaves de API internas do OmniBridge
 * @author Bryan Marvila
 * @version 1.0.0
 * @since 2026-03-04
 */
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    // Instanciando diretamente para testes unitários rápidos e isolados (sem overhead do TestingModule)
    service = new AuthService();
  });

  describe('validateInternalKey', () => {
    it('deve retornar true para uma chave de API válida e autorizada', async () => {
      // Arrange
      const validKey = 'omni_sk_mock_valid_key_2026';

      // Act
      const isValid = await service.validateInternalKey(validKey);

      // Assert
      expect(isValid).toBe(true);
    });

    it('deve retornar false para uma chave de API inválida ou inexistente', async () => {
      // Arrange
      const invalidKey = 'omni_sk_mock_invalid_key_9999';

      // Act
      const isValid = await service.validateInternalKey(invalidKey);

      // Assert
      expect(isValid).toBe(false);
    });

    it('deve retornar false se a chave fornecida for vazia ou nula', async () => {
      // Act
      const isEmptyValid = await service.validateInternalKey('');
      const isNullValid = await service.validateInternalKey(null as unknown as string);

      // Assert
      expect(isEmptyValid).toBe(false);
      expect(isNullValid).toBe(false);
    });
  });
});
