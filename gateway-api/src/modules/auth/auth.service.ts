import { Injectable } from '@nestjs/common';

/**
 * @fileoverview Serviço de autenticação do OmniBridge
 * @description Lida com a validação de chaves internas do sistema antes de repassar para o LiteLLM
 * @author Bryan Marvila
 * @version 1.0.0
 * @since 2026-03-04
 */
@Injectable()
export class AuthService {
    // Mock temporário para chaves. 
    // Na próxima iteração, buscaremos isso de um PostgreSQL ou Vault via .env
    private readonly validKeys = new Set(['omni_sk_mock_valid_key_2026']);

    /**
     * Valida se uma chave interna fornecida pelo cliente é legítima
     * @param apiKey Chave que vem do cabeçalho da requisição (ex: Authorization: Bearer <key>)
     * @returns Booleano indicando se a chave tem acesso
     */
    async validateInternalKey(apiKey: string): Promise<boolean> {
        if (!apiKey || typeof apiKey !== 'string') {
            return false;
        }

        return this.validKeys.has(apiKey);
    }
}
