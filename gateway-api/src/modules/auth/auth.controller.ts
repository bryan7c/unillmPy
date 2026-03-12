import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth/auth.guard';

/**
 * @fileoverview Controller focado na validação de acessos ao serviço
 * @description Expõe primariamente a rota que valida de forma ativa uma chave de API, útil para checagens prévias por clientes e serviços satélites
 * @author Bryan Marvila
 * @version 1.0.0
 * @since 2026-03-04
 */
@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('verify')
    @UseGuards(AuthGuard)
    verifyToken() {
        return {
            status: 'success',
            message: 'Token válido. Acesso permitido ao OmniBridge.',
        };
    }
}
