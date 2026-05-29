export const logger = {
    log: (message: string, ...optionalParams: any[]) => {
        if (__DEV__) {
            globalThis.console?.log(`[LOG] ${message}`, ...optionalParams);
        }
    },
    
    error: (message: string, error: any) => {
        if (__DEV__) {
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
