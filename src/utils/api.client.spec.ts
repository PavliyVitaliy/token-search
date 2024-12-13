
import axios from 'axios';
import { ApiClient } from './api.client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiClient', () => {
    let apiClient: ApiClient;

    beforeEach(() => {
        apiClient = new ApiClient();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch tokens successfully', async () => {
        const testQuery = 'test-query';
        const mockResult = 'Token1';
        const mockResponse = { data: [{ name: mockResult }] };
        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await apiClient.fetchTokens(testQuery);

        expect(mockedAxios.get).toHaveBeenCalledWith(
            process.env.DEXSCREENER_API_URL,
            { params: { q: testQuery } }
        );
        expect(result).toEqual([{ name: mockResult }]);
    });

    it('should retry on failure', async () => {
        const testQuery = 'test-query';
        const error = 'Network Error';
        const mockResult = 'Token2';
        mockedAxios.get
        .mockRejectedValueOnce(new Error(error))
        .mockResolvedValueOnce({ data: [{ name: mockResult }] });

        const result = await apiClient.fetchTokens(testQuery);

        expect(mockedAxios.get).toHaveBeenCalledTimes(2);
        expect(result).toEqual([{ name: mockResult }]);
    });

    it('should throw error after maximum retries', async () => {
        const testQuery = 'test-query';
        const mockNetworkError = 'Network Error';
        const mockFetchError = 'Failed to fetch tokens after retries';

        mockedAxios.get.mockRejectedValue(new Error(mockNetworkError));

        await expect(apiClient.fetchTokens(testQuery)).rejects.toThrow(mockFetchError);
        expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    });

    it('should return empty array for HTTP 400 error', async () => {
        const testQuery = 'invalid-query';
        mockedAxios.get.mockRejectedValueOnce({
            response: { status: 400 },
            message: 'Request failed with status code 400',
            isAxiosError: true,
        });
    
        const result = await apiClient.fetchTokens(testQuery);
    
        expect(mockedAxios.get).toHaveBeenCalledWith(
            process.env.DEXSCREENER_API_URL,
            { params: { q: testQuery } }
        );
        expect(result).toEqual([]);
    });
});
