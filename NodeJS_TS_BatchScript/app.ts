import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import getConfig from './config';
import ApiService from './services/ApiService';
import ModuleFactory from './modules/ModuleFactory';

async function main() {
    const argv = yargs(hideBin(process.argv))
        .option('module', { describe: 'Module name to execute', demandOption: true, type: 'string' })
        .option('file', { describe: 'Input file containing usernames', demandOption: true, type: 'string' })
        .option('output', { describe: 'Output file for results', demandOption: true, type: 'string' })
        .option('env', { describe: 'Environment (dev, staging, prod)', demandOption: true, type: 'string' })
        .argv;

    const environmentConfig = getConfig(argv.env as string);
    const apiService = new ApiService(environmentConfig);

    try {
        const module = ModuleFactory.getModule(argv.module as string, argv.file as string, argv.output as string, apiService);
        await module.processUsers();
        console.log(`Processing completed. Results saved to ${argv.output}`);
    } catch (error) {
        console.error(error.message);
    }
}

main();
