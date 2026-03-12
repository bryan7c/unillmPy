import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * @fileoverview Interceptador de autenticação para proteger rotas da API
 * @description Inspeciona as requisições HTTP antes de chegarem aos controllers e valida a chave com o serviço.
 * @author Bryan Marvila
 * @version 1.0.0
 * @since 2026-03-04
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Chave de API (Bearer Token) não fornecida.');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de autorização inválido. Use "Bearer <TOKEN>".');
    }

    const isValid = await this.authService.validateInternalKey(token);

    if (!isValid) {
      throw new UnauthorizedException('Chave de API inválida ou revogada.');
    }

    // Se válido, permite o fluxo continuar
    return true;
  }
}
