import Redis from 'ioredis'
import { CacheService } from './cache.service';
import { MetricsService } from 'src/metrics/metrics.service';

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
    let metricsService: jest.Mocked<MetricsService>;

    beforeEach(() => {
        redisClient = new Redis() as jest.Mocked<Redis>;
        metricsService = {
            cacheHits: { add: jest.fn() },
            cacheMisses: { add: jest.fn() },
            cacheSetSuccesses: { add: jest.fn() },
            cacheSetFailures: { add: jest.fn() },
        } as any;
        cacheService = new CacheService(redisClient, metricsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should retrieve cached data and increment cacheHits', async () => {
        const testKey = 'test_key';
        const mockResult = { test: 'value' };
        redisClient.get.mockResolvedValueOnce(JSON.stringify(mockResult));

        const result = await cacheService.get(testKey);

        expect(redisClient.get).toHaveBeenCalledWith(testKey);
        expect(result).toEqual(mockResult);
        expect(metricsService.cacheHits.add).toHaveBeenCalledWith(1);
        expect(metricsService.cacheMisses.add).not.toHaveBeenCalled();
    });

    it('should return null and increment cacheMisses on cache miss', async () => {
        const testKey = 'test_key';
        redisClient.get.mockResolvedValueOnce(null);

        const result = await cacheService.get(testKey);

        expect(redisClient.get).toHaveBeenCalledWith(testKey);
        expect(result).toBeNull();
        expect(metricsService.cacheHits.add).not.toHaveBeenCalled();
        expect(metricsService.cacheMisses.add).toHaveBeenCalledWith(1);
    });

    it('should increment cacheMisses on error and return null', async () => {
        const testKey = 'test_key';
        const mockError = 'Redis error';
        redisClient.get.mockRejectedValueOnce(new Error(mockError));

        const result = await cacheService.get(testKey);

        expect(redisClient.get).toHaveBeenCalledWith(testKey);
        expect(result).toBeNull();
        expect(metricsService.cacheHits.add).not.toHaveBeenCalled();
        expect(metricsService.cacheMisses.add).toHaveBeenCalledWith(1);
    });

    it('should set data in the cache and increment cacheSetSuccesses', async () => {
        const testKey = 'test_key';
        const mockResult = { test: 'value' };
        const ttl = 10;
        redisClient.set.mockResolvedValueOnce('OK');

        await cacheService.set(testKey, mockResult, ttl);

        expect(redisClient.set).toHaveBeenCalledWith(
            testKey,
            JSON.stringify(mockResult),
            'EX',
            ttl,
        );
        expect(metricsService.cacheSetSuccesses.add).toHaveBeenCalledWith(1);
        expect(metricsService.cacheSetFailures.add).not.toHaveBeenCalled();
    });

    it('should increment cacheSetFailures on error during set', async () => {
        const testKey = 'test_key';
        const mockValue = { test: 'value' };
        const ttl = 10;
        const mockError = 'Redis error';
        redisClient.set.mockRejectedValueOnce(new Error(mockError));

        await cacheService.set(testKey, mockValue, ttl);

        expect(redisClient.set).toHaveBeenCalledWith(
            testKey,
            JSON.stringify(mockValue),
            'EX',
            ttl,
        );
        expect(metricsService.cacheSetFailures.add).toHaveBeenCalledWith(1);
        expect(metricsService.cacheSetSuccesses.add).not.toHaveBeenCalled();
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
