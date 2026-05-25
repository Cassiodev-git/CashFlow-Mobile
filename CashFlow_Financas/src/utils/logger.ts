import { Platform } from 'react-native';

export const logger = {
    log: (message: string, ...optionalParams: any[]) => {
        if (__DEV__) {
        console.log(`[LOG] ${message}`, ...optionalParams);
        }
    },
    
    error: (message: string, error: any) => {
        if (__DEV__) {
        console.error(`[ERROR] ${message}`, error);
        } else {
        // Conectar ferramenta de monitormento
        }
    }
};