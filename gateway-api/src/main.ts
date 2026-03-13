/**
 * @fileoverview Ponto de entrada do OmniBridge Gateway API
 * @description Bootstrap do NestJS com CORS habilitado para clientes internos (OmniChat)
 * @author Bryan Marvila
 * @version 1.1.0
 * @since 2026-03-04
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
