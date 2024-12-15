import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { MetricsService } from 'src/metrics/metrics.service';

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);

    constructor(
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
        private readonly metricsService: MetricsService,
    ) {}

    async get(key: string): Promise<any> {
        try {
            const cachedData = await this.redisClient.get(key);
            if (cachedData) {
                this.metricsService.cacheHits.add(1);
                return JSON.parse(cachedData);
            }
            this.metricsService.cacheMisses.add(1);
            return null;
        } catch (error) {
            this.logger.error(`Error fetching data from cache for key: ${key}`, error.stack);
            this.metricsService.cacheMisses.add(1);
            return null;
        }
    }

    async set(key: string, value: any, ttl: number): Promise<void> {
        try {
            await this.redisClient.set(key, JSON.stringify(value), 'EX', ttl);
            this.metricsService.cacheSetSuccesses.add(1);
        } catch (error) {
            this.logger.error(`Error setting cache for key: ${key}`, error.stack);
            this.metricsService.cacheSetFailures.add(1);
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.redisClient.del(key);
        } catch (error) {
            this.logger.error(`Error deleting cache for key: ${key}`, error.stack);
        }
    }
}
