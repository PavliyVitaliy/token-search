import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);

    constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

    async get(key: string): Promise<any> {
        try {
            const cachedData = await this.redisClient.get(key);
            return cachedData ? JSON.parse(cachedData) : null;
        } catch (error) {
            this.logger.error(`Error fetching data from cache for key: ${key}`, error.stack);
            return null;
        }
    }

    async set(key: string, value: any, ttl: number): Promise<void> {
        try {
            await this.redisClient.set(key, JSON.stringify(value), 'EX', ttl);
        } catch (error) {
            this.logger.error(`Error setting cache for key: ${key}`, error.stack);
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
