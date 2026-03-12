import { Module } from '@nestjs/common';
import { OpenRouterSyncService } from './openrouter-sync.service.js';

@Module({
    providers: [OpenRouterSyncService],
    exports: [OpenRouterSyncService],
})
export class OpenRouterSyncModule { }
