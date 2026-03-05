import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { LlmModule } from './modules/llm/llm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna o ConfigService acessível em qualquer módulo sem necessidade de importar
    }),
    AuthModule,
    LlmModule,
  ],
})
export class AppModule { }
