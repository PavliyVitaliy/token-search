import { Module } from '@nestjs/common';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';
import { ApiClient } from '../utils/api.client';
import { RedisModule } from 'src/cache/redis.module';
import { CacheService } from 'src/cache/cache.service';
import { MetricsService } from 'src/metrics/metrics.service';

@Module({
    imports: [RedisModule],
    controllers: [TokensController],
    providers: [
        TokensService,
        ApiClient,
        CacheService,
        MetricsService
    ],
})
export class TokensModule {}
