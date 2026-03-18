import { Controller, Post, UseGuards } from '@nestjs/common';
import { OpenRouterSyncService } from './openrouter-sync.service.js';
import { AuthGuard } from '../auth/auth/auth.guard.js';

@Controller('api/models/sync')
export class OpenRouterSyncController {
    constructor(private readonly syncService: OpenRouterSyncService) { }

    @Post('openrouter')
    @UseGuards(AuthGuard)
    async triggerSync() {
        await this.syncService.syncFreeModels();
        return { message: 'Sincronização concluída. Reinicie o LiteLLM para carregar os novos modelos.' };
    }
}
