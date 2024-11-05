import fs from 'fs-extra';
import ApiService from '../services/ApiService';

abstract class BaseModule {
    protected inputFile: string;
    protected outputFile: string;
    protected apiService: ApiService;
    protected batchSize = 20;

    constructor(inputFile: string, outputFile: string, apiService: ApiService) {
        this.inputFile = inputFile;
        this.outputFile = outputFile;
        this.apiService = apiService;
    }

    async readInputFile(): Promise<string[]> {
        const data = await fs.readFile(this.inputFile, 'utf8');
        return data.split('\n').filter(line => line.trim() !== '');
    }

    async writeToOutputFile(results: string[]): Promise<void> {
        await fs.writeFile(this.outputFile, results.join('\n'));
    }

    async processUsers(): Promise<void> {
        const usernames = await this.readInputFile();
        const results: string[] = [];

        for (let i = 0; i < usernames.length; i += this.batchSize) {
            const batch = usernames.slice(i, i + this.batchSize);
            for (const username of batch) {
                const payload = this.createPayload(username);
                const response = await this.apiService.post(payload);
                results.push(response || `Failed to process ${username}`);
            }
        }

        await this.writeToOutputFile(results);
    }

    abstract createPayload(username: string): string;
}

export default BaseModule;
