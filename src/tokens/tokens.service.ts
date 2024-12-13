import { Injectable, Logger } from '@nestjs/common';
import { SearchTokensDto } from './dto/search-tokens.dto';
import { ApiClient } from '../utils/api.client';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class TokensService {
    private readonly logger = new Logger(TokensService.name);
    private readonly cacheTTL = parseInt(process.env.REDIS_TTL, 10);

    constructor(
        private readonly cacheService: CacheService,
        private readonly apiClient: ApiClient,
    ) {}

    async searchTokens(searchTokensDto: SearchTokensDto): Promise<any> {
        const { query } = searchTokensDto;

        try {
            const start = Date.now();
            const cachedResult = await this.cacheService.get(query);
      
            if (cachedResult) {
                this.logger.log(`Cache found for query: ${query}`);
                this.logger.log(`Cache retrieval took ${Date.now() - start} ms`);
                return cachedResult;
            }
      
            this.logger.log(`Cache miss for query: ${query}`);
            const tokensData = await this.apiClient.fetchTokens(query);
      
            await this.cacheService.set(query, tokensData, this.cacheTTL);
            return tokensData;
        } catch (error) {
            this.logger.error(`Error during token search for query: ${query}`, error.stack);
            throw error;
        }
    }
}
