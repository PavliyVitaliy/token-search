import { Logger } from '@nestjs/common';
import { CacheService } from 'src/cache/cache.service';
import { ApiClient } from 'src/utils/api.client';
import { TokensService } from './tokens.service';
import { MetricsService } from 'src/metrics/metrics.service';

jest.mock('../utils/api.client');
jest.mock('../cache/cache.service');
jest.mock('src/metrics/metrics.service');

describe('TokensService', () => {
    let tokensService: TokensService;
    let apiClient: jest.Mocked<ApiClient>;
    let cacheService: jest.Mocked<CacheService>;
    let metricsService: jest.Mocked<MetricsService>;

    beforeEach(() => {
        apiClient = new ApiClient() as jest.Mocked<ApiClient>;
        cacheService = new CacheService({} as any, {} as any) as jest.Mocked<CacheService>;
        metricsService = new MetricsService() as jest.Mocked<MetricsService>;
        metricsService.requestCount = { add: jest.fn() } as any;
        tokensService = new TokensService(cacheService, apiClient, metricsService);
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return cached data if available', async () => {
        const testQuery = 'test-query';
        const mockResult = 'CachedToken';
        cacheService.get.mockResolvedValue([{ name: mockResult}]);

        const result = await tokensService.searchTokens({ query: testQuery });

        expect(cacheService.get).toHaveBeenCalledWith(testQuery);
        expect(result).toEqual([{ name: mockResult }]);
        expect(apiClient.fetchTokens).not.toHaveBeenCalled();
        expect(metricsService.requestCount.add).toHaveBeenCalledWith(1, { endpoint: 'searchTokens' });
    });

    it('should fetch data from API and cache it if cache is missed', async () => {
        const testQuery = 'test-query';
        const mockResult = 'APIToken';
        cacheService.get.mockResolvedValue(null);
        apiClient.fetchTokens.mockResolvedValue([{ name: mockResult }]);

        const result = await tokensService.searchTokens({ query: testQuery });

        expect(apiClient.fetchTokens).toHaveBeenCalledWith(testQuery);
        expect(cacheService.set).toHaveBeenCalledWith(testQuery, [{ name: mockResult }], expect.any(Number));
        expect(metricsService.requestCount.add).toHaveBeenCalledWith(1, { endpoint: 'searchTokens' });
        expect(result).toEqual([{ name: mockResult }]);
    });

    it('should handle errors gracefully', async () => {
        const testQuery = 'test-query';
        const mockError = 'API Error';

        apiClient.fetchTokens.mockRejectedValue(new Error(mockError));

        await expect(tokensService.searchTokens({ query: testQuery })).rejects.toThrow(mockError);
        expect(metricsService.requestCount.add).toHaveBeenCalledWith(1, { endpoint: 'searchTokens' });
    });
});
