import { TokensController } from "./tokens.controller";
import { TokensService } from "./tokens.service";


jest.mock('./tokens.service');

describe('TokensController', () => {
    let tokensController: TokensController;
    let tokensService: jest.Mocked<TokensService>;

    beforeEach(() => {
        tokensService = new TokensService({} as any, {} as any) as jest.Mocked<TokensService>;
        tokensController = new TokensController(tokensService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return tokens from the service', async () => {
        const testQuery = 'test-query';
        const mockResult = 'TokenFromService';
        tokensService.searchTokens.mockResolvedValue([{ name: mockResult }]);

        const result = await tokensController.searchTokens({ query: testQuery });

        expect(tokensService.searchTokens).toHaveBeenCalledWith({ query: testQuery });
        expect(result).toEqual([{ name: mockResult }]);
    });

    it('should throw an exception if the service throws an error', async () => {
        const testQuery = 'test-query';
        const mockError = 'Service Error';
        tokensService.searchTokens.mockRejectedValue(new Error(mockError));

        await expect(tokensController.searchTokens({ query: testQuery })).rejects.toThrow(mockError);
    });
});
