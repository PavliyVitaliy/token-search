import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { SearchTokensDto } from './dto/search-tokens.dto';
import { TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
    constructor(private readonly tokensService: TokensService) {}

    @Get('search')
    async searchTokens(@Query() searchTokensDto: SearchTokensDto) {
        try {
            return await this.tokensService.searchTokens(searchTokensDto);
        } catch (error) {
            throw new HttpException(
                `Failed to process search request: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
