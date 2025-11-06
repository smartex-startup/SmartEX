/**
 * Logger utility for SmartEX Vendor Frontend
 * Logs only in development mode (similar to backend pattern)
 */

const isDevelopment = import.meta.env.DEV;

const logger = {
    info: (message, ...args) => {
        if (isDevelopment) {
            console.log(
                `[INFO] ${new Date().toISOString()} - ${message}`,
                ...args
            );
        }
    },

    error: (message, ...args) => {
        if (isDevelopment) {
            console.error(
                `[ERROR] ${new Date().toISOString()} - ${message}`,
                ...args
            );
        }
    },

    warn: (message, ...args) => {
        if (isDevelopment) {
            console.warn(
                `[WARN] ${new Date().toISOString()} - ${message}`,
                ...args
            );
        }
    },

    debug: (message, ...args) => {
        if (isDevelopment) {
            console.debug(
                `[DEBUG] ${new Date().toISOString()} - ${message}`,
                ...args
            );
        }
    },
};

export default logger;
