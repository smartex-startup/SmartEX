import logger from "./logger.util.js";

/**
 * Calculate days between today and expiry date
 * @param {Date|string} expiryDate - The expiry date
 * @returns {number} Days until expiry (negative if expired)
 */
const calculateDaysToExpiry = (expiryDate) => {
    try {
        const today = new Date();
        const expiry = new Date(expiryDate);

        // Set time to start of day for accurate comparison
        today.setHours(0, 0, 0, 0);
        expiry.setHours(0, 0, 0, 0);

        const timeDiff = expiry.getTime() - today.getTime();
        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    } catch (error) {
        logger.error("Error calculating days to expiry:", error.message);
        return 0;
    }
};

/**
 * Check if product is near expiry (7 days or less, but not expired)
 * @param {number} daysToExpiry - Days until expiry
 * @param {number} threshold - Near expiry threshold (default 7 days)
 * @returns {boolean} True if near expiry
 */
const isNearExpiry = (daysToExpiry, threshold = 7) => {
    return daysToExpiry <= threshold && daysToExpiry > 0;
};

/**
 * Auto-calculate discount percentage based on days to expiry
 * @param {number} daysToExpiry - Days until expiry
 * @returns {number} Discount percentage (0-50)
 */
const calculateExpiryDiscount = (daysToExpiry) => {
    // Expired products - maximum discount
    if (daysToExpiry <= 0) return 50;

    // Graduated discount based on urgency
    if (daysToExpiry === 1) return 40; // 1 day left - 40% off
    if (daysToExpiry === 2) return 30; // 2 days left - 30% off
    if (daysToExpiry === 3) return 20; // 3 days left - 20% off
    if (daysToExpiry === 4) return 15; // 4 days left - 15% off
    if (daysToExpiry === 5) return 12; // 5 days left - 12% off
    if (daysToExpiry === 6) return 10; // 6 days left - 10% off
    if (daysToExpiry === 7) return 8; // 7 days left - 8% off

    // More than 7 days - no near expiry discount
    return 0;
};

/**
 * Check if product is expired
 * @param {number} daysToExpiry - Days until expiry
 * @returns {boolean} True if expired
 */
const isExpired = (daysToExpiry) => {
    return daysToExpiry <= 0;
};

/**
 * Update batch with calculated expiry fields
 * @param {Object} batch - Batch object to update
 * @returns {Object} Updated batch with expiry calculations
 */
const updateBatchExpiryFields = (batch) => {
    try {
        if (!batch.expiryDate) {
            return batch;
        }

        const daysToExpiry = calculateDaysToExpiry(batch.expiryDate);

        return {
            ...batch,
            daysToExpiry,
            isExpired: isExpired(daysToExpiry),
            isNearExpiry: isNearExpiry(daysToExpiry),
            nearExpiryDiscount: calculateExpiryDiscount(daysToExpiry),
        };
    } catch (error) {
        logger.error("Error updating batch expiry fields:", error.message);
        return batch;
    }
};

/**
 * Update all batches in a product with expiry calculations
 * @param {Array} batches - Array of batch objects
 * @returns {Array} Updated batches with expiry calculations
 */
const updateAllBatchesExpiry = (batches) => {
    if (!Array.isArray(batches)) {
        return batches;
    }

    return batches.map((batch) => updateBatchExpiryFields(batch));
};

/**
 * Get batches sorted by expiry date (FIFO - First In, First Out)
 * @param {Array} batches - Array of batch objects
 * @returns {Array} Batches sorted by expiry date (earliest first)
 */
const getFIFOOrderedBatches = (batches) => {
    if (!Array.isArray(batches)) {
        return [];
    }

    return [...batches].sort((a, b) => {
        const dateA = new Date(a.expiryDate);
        const dateB = new Date(b.expiryDate);
        return dateA - dateB;
    });
};

/**
 * Calculate the highest near expiry discount from all batches
 * @param {Array} batches - Array of batch objects
 * @returns {number} Highest discount percentage
 */
const getHighestNearExpiryDiscount = (batches) => {
    if (!Array.isArray(batches) || batches.length === 0) {
        return 0;
    }

    return batches.reduce((maxDiscount, batch) => {
        if (batch.isNearExpiry && batch.remainingQuantity > 0) {
            return Math.max(maxDiscount, batch.nearExpiryDiscount || 0);
        }
        return maxDiscount;
    }, 0);
};

export {
    calculateDaysToExpiry,
    isNearExpiry,
    isExpired,
    calculateExpiryDiscount,
    updateBatchExpiryFields,
    updateAllBatchesExpiry,
    getFIFOOrderedBatches,
    getHighestNearExpiryDiscount,
};
