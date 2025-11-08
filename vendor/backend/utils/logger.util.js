/**
 * Get formatted timestamp in IST (Indian Standard Time)
 * @returns {string} Formatted timestamp like "09-Nov-2025 14:30:45 IST"
 */
const getISTTimestamp = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000); // Add 5.5 hours for IST

    const day = String(istTime.getUTCDate()).padStart(2, "0");
    const month = istTime.toLocaleString("en", {
        month: "short",
        timeZone: "UTC",
    });
    const year = istTime.getUTCFullYear();
    const hours = String(istTime.getUTCHours()).padStart(2, "0");
    const minutes = String(istTime.getUTCMinutes()).padStart(2, "0");
    const seconds = String(istTime.getUTCSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds} IST`;
};

const logger = {
    info: (message, ...args) => {
        if (process.env.NODE_ENV !== "production") {
            console.log(`[INFO] ${getISTTimestamp()} - ${message}`, ...args);
        }
    },

    error: (message, ...args) => {
        if (process.env.NODE_ENV !== "production") {
            console.error(`[ERROR] ${getISTTimestamp()} - ${message}`, ...args);
        }
    },

    warn: (message, ...args) => {
        if (process.env.NODE_ENV !== "production") {
            console.warn(`[WARN] ${getISTTimestamp()} - ${message}`, ...args);
        }
    },

    debug: (message, ...args) => {
        if (process.env.NODE_ENV !== "production") {
            console.debug(`[DEBUG] ${getISTTimestamp()} - ${message}`, ...args);
        }
    },
};

export default logger;
