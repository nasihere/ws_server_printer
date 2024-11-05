import axios from 'axios';
import { EnvironmentConfig, ApiResponse } from '../types';

class ApiService {
    private apiUrl: string;
    private timeout: number;

    constructor(config: EnvironmentConfig) {
        this.apiUrl = config.apiUrl;
        this.timeout = config.timeout;
    }

    async post(payload: string): Promise<string | null> {
        try {
            const response = await axios.post<ApiResponse>(this.apiUrl, payload, {
                headers: { 'Content-Type': 'application/xml' },
                timeout: this.timeout
            });
            return response.data.data;
        } catch (error) {
            console.error(`API request failed: ${error.message}`);
            return null;
        }
    }
}

export default ApiService;
