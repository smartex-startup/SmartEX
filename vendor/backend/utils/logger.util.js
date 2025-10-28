const logger = {
    info: (message, ...args) => {
        if (process.env.NODE_ENV !== "production") {
            console.log(
                `[INFO] ${new Date().toISOString()} - ${message}`,
                ...args
            );
        }
    },

    error: (message, ...args) => {
        if (process.env.NODE_ENV !== "production") {
            console.error(
                `[ERROR] ${new Date().toISOString()} - ${message}`,
                ...args
            );
        }
    },

    warn: (message, ...args) => {
        if (process.env.NODE_ENV !== "production") {
            console.warn(
                `[WARN] ${new Date().toISOString()} - ${message}`,
                ...args
            );
        }
    },

    debug: (message, ...args) => {
        if (process.env.NODE_ENV !== "production") {
            console.debug(
                `[DEBUG] ${new Date().toISOString()} - ${message}`,
                ...args
            );
        }
    },
};

export default logger;
