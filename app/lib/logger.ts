import { isProduction } from './noaa/config';

const isDevelopment = !isProduction();

export const logger = {
    debug: (...args: unknown[]) => {
        if (isDevelopment) console.log(...args);
    },
    info: (...args: unknown[]) => {
        if (isDevelopment) console.log(...args);
    },
    warn: (...args: unknown[]) => {
        console.warn(...args);
    },
    error: (...args: unknown[]) => {
        console.error(...args);
    },
};
