import BaseModule from './BaseModule';
import GetUserInfo from './GetUserInfo';
import ApiService from '../services/ApiService';

class ModuleFactory {
    static getModule(moduleName: string, inputFile: string, outputFile: string, apiService: ApiService): BaseModule {
        if (moduleName === 'GetUserInfo') {
            return new GetUserInfo(inputFile, outputFile, apiService);
        } else {
            throw new Error(`Module ${moduleName} not recognized.`);
        }
    }
}

export default ModuleFactory;
