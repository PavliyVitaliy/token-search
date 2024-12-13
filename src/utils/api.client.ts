import axios, { AxiosError } from 'axios';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ApiClient {
    private readonly logger = new Logger(ApiClient.name);
    private readonly dexscreenerBaseUrl = process.env.DEXSCREENER_API_URL;

    // Search for pairs matching query (rate-limit 300 requests per minute)
    // https://docs.dexscreener.com/api/reference
    async fetchTokens(query: string): Promise<any[]> {
        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                this.logger.log(`Attempting API request. Attempt #${attempt + 1}`);
                const response = await axios.get(this.dexscreenerBaseUrl, { params: { q: query } });
                this.logger.log(`API request successful for query: ${query}`);
                return response.data;
            } catch (error) {
                const axiosError = error as AxiosError;
                if (axiosError.response && axiosError.response.status === 400) {
                    this.logger.error(`Bad request for query "${query}": ${axiosError.message}`);
                    return [];
                }
                attempt++;
                this.logger.error(
                    `API request failed for query: ${query}. Attempt #${attempt}. Error: ${axiosError.message}`,
                );
                if (attempt >= maxRetries) throw new Error('Failed to fetch tokens after retries');
                await this.delay(2 ** attempt * 100);
            }
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
