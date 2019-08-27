'use babel';

import FunctionsProvider from './functions-provider';
import VariablesProvider from './variables-provider';

export default {
    getProvider() {
        return [FunctionsProvider,VariablesProvider];
    }
};
