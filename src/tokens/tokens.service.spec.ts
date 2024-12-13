import { Logger } from '@nestjs/common';
import { CacheService } from 'src/cache/cache.service';
import { ApiClient } from 'src/utils/api.client';
import { TokensService } from './tokens.service';

jest.mock('../utils/api.client');
jest.mock('../cache/cache.service');

describe('TokensService', () => {
    let tokensService: TokensService;
    let apiClient: jest.Mocked<ApiClient>;
    let cacheService: jest.Mocked<CacheService>;

    beforeEach(() => {
        apiClient = new ApiClient() as jest.Mocked<ApiClient>;
        cacheService = new CacheService({} as any) as jest.Mocked<CacheService>;
        tokensService = new TokensService(cacheService, apiClient);
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
    });

    it('should fetch data from API and cache it if cache is missed', async () => {
        const testQuery = 'test-query';
        const mockResult = 'APIToken';
        cacheService.get.mockResolvedValue(null);
        apiClient.fetchTokens.mockResolvedValue([{ name: mockResult }]);

        const result = await tokensService.searchTokens({ query: testQuery });

        expect(apiClient.fetchTokens).toHaveBeenCalledWith(testQuery);
        expect(cacheService.set).toHaveBeenCalledWith(testQuery, [{ name: mockResult }], expect.any(Number));
        expect(result).toEqual([{ name: mockResult }]);
    });

    it('should handle errors gracefully', async () => {
        const testQuery = 'test-query';
        const mockError = 'API Error';

        apiClient.fetchTokens.mockRejectedValue(new Error(mockError));

        await expect(tokensService.searchTokens({ query: testQuery })).rejects.toThrow(mockError);
    });
});
