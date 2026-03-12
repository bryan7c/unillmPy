import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { ChatController } from './chat.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // Necessita importar o AuthModule porque usamos o AuthGuard + AuthService nas rotas
  controllers: [ChatController],
  providers: [LlmService],
})
export class LlmModule { }
