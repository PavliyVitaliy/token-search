import Redis from 'ioredis'
import { CacheService } from './cache.service';

jest.mock('ioredis', () => {
    const mRedis = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    };
    return jest.fn(() => mRedis);
});

describe('CacheService', () => {
    let cacheService: CacheService;
    let redisClient: jest.Mocked<Redis>;

    beforeEach(() => {
        redisClient = new Redis() as jest.Mocked<Redis>;
        cacheService = new CacheService(redisClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should retrieve cached data', async () => {
        const testKey = 'test_key';
        const mockResult = { test: 'value' };

        redisClient.get.mockResolvedValueOnce(JSON.stringify(mockResult));

        const result = await cacheService.get(testKey);

        expect(redisClient.get).toHaveBeenCalledWith(testKey);
        expect(result).toEqual(mockResult);
    });

    it('should set data in the cache', async () => {
        const testKey = 'test_key';
        const mockResult = { test: 'value' };
        const ttl = 10;

        await cacheService.set(testKey, mockResult, ttl);

        expect(redisClient.set).toHaveBeenCalledWith(
            testKey,
            JSON.stringify(mockResult),
            'EX',
            ttl,
        );
    });

    it('should delete data from the cache', async () => {
        const testKey = 'test_key';

        await cacheService.del(testKey);

        expect(redisClient.del).toHaveBeenCalledWith(testKey);
    });

    it('should handle Redis errors gracefully', async () => {
        const testKey = 'test_key';
        const mockError = 'Redis error';
        redisClient.get.mockRejectedValue(new Error(mockError));

        const result = await cacheService.get(testKey);

        expect(result).toBeNull();
    });
});
