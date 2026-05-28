<<<<<<< HEAD
export const logger = {
    log: (message: string, ...optionalParams: any[]) => {
        if (__DEV__) {
            globalThis.console?.log(`[LOG] ${message}`, ...optionalParams);
=======
import { Platform } from 'react-native';

export const logger = {
    log: (message: string, ...optionalParams: any[]) => {
        if (__DEV__) {
        console.log(`[LOG] ${message}`, ...optionalParams);
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
        }
    },
    
    error: (message: string, error: any) => {
        if (__DEV__) {
<<<<<<< HEAD
            globalThis.console?.error(`[ERROR] ${message}`, error);
        } else {
            // Conectar ferramenta de monitormento
        }
    },

    warn: (message: string, ...optionalParams: any[]) => {
        if (__DEV__) {
            globalThis.console?.warn(`[WARN] ${message}`, ...optionalParams);
        }
    }
};
=======
        console.error(`[ERROR] ${message}`, error);
        } else {
        // Conectar ferramenta de monitormento
        }
    }
};
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
