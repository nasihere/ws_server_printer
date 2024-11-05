import { EnvironmentConfig } from './types';

const environments: { [key: string]: EnvironmentConfig } = {
    dev: { apiUrl: 'https://dev.example.com/xmlrequest.com', timeout: 5000 },
    staging: { apiUrl: 'https://staging.example.com/xmlrequest.com', timeout: 10000 },
    prod: { apiUrl: 'https://prod.example.com/xmlrequest.com', timeout: 15000 }
};

export default function getConfig(env: string): EnvironmentConfig {
    return environments[env] || environments.prod;
}
