import { Module } from '@nestjs/common';
import { OpenRouterSyncService } from './openrouter-sync.service.js';
import { OpenRouterSyncController } from './openrouter-sync.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
    imports: [AuthModule],
    controllers: [OpenRouterSyncController],
    providers: [OpenRouterSyncService],
    exports: [OpenRouterSyncService],
})
export class OpenRouterSyncModule { }
