import { ApiProperty } from "@nestjs/swagger";
import { IsString } from 'class-validator';

export class SearchTokensDto {
    @ApiProperty({description: 'Query text'})
    @IsString()
    readonly query: string;
}
