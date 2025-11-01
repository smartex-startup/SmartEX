import cron from "node-cron";
import VendorProduct from "../models/vendorProduct.model.js";
import logger from "../utils/logger.util.js";
import { updateBatchExpiryFields } from "../utils/expiryCalculator.util.js";

/**
 * Daily expiry checker - runs every day at 12:01 AM
 * Updates all vendor products' expiry status automatically
 */

const runDailyExpiryCheck = async () => {
    try {
        logger.info("🕛 Starting daily expiry check...");

        // Get all products with expiry tracking enabled
        const productsWithExpiry = await VendorProduct.find({
            "expiryTracking.hasExpiry": true,
            "expiryTracking.batches.0": { $exists: true }, // Has at least one batch
            isActive: true,
        });

        let updatedProductsCount = 0;
        let totalBatchesProcessed = 0;
        let nearExpiryFound = 0;
        let expiredFound = 0;

        // Process each product
        for (const product of productsWithExpiry) {
            let productUpdated = false;

            // Update each batch in the product
            product.expiryTracking.batches.forEach((batch, index) => {
                if (batch.expiryDate) {
                    const previousStatus = {
                        isNearExpiry: batch.isNearExpiry,
                        isExpired: batch.isExpired,
                        nearExpiryDiscount: batch.nearExpiryDiscount,
                    };

                    // Update batch using utility function
                    const updatedBatch = updateBatchExpiryFields(batch);

                    // Apply updates to the batch
                    batch.daysToExpiry = updatedBatch.daysToExpiry;
                    batch.isExpired = updatedBatch.isExpired;
                    batch.isNearExpiry = updatedBatch.isNearExpiry;
                    batch.nearExpiryDiscount = updatedBatch.nearExpiryDiscount;

                    totalBatchesProcessed++;

                    // Check if status changed
                    if (
                        batch.isNearExpiry !== previousStatus.isNearExpiry ||
                        batch.isExpired !== previousStatus.isExpired ||
                        batch.nearExpiryDiscount !==
                            previousStatus.nearExpiryDiscount
                    ) {
                        productUpdated = true;
                    }

                    // Count near-expiry and expired batches
                    if (batch.isNearExpiry && batch.remainingQuantity > 0) {
                        nearExpiryFound++;
                    }
                    if (batch.isExpired && batch.remainingQuantity > 0) {
                        expiredFound++;
                    }
                }
            });

            // Save product if any batch was updated
            if (productUpdated) {
                await product.save(); // This will trigger pre-save middleware
                updatedProductsCount++;

                logger.info(
                    `Updated expiry status for product: ${product._id}`
                );
            }
        }

        // Log summary
        logger.info(`✅ Daily expiry check completed successfully:`);
        logger.info(`   📦 Products processed: ${productsWithExpiry.length}`);
        logger.info(`   🔄 Products updated: ${updatedProductsCount}`);
        logger.info(`   📊 Total batches processed: ${totalBatchesProcessed}`);
        logger.info(`   ⚠️  Near-expiry batches found: ${nearExpiryFound}`);
        logger.info(`   ❌ Expired batches found: ${expiredFound}`);

        return {
            success: true,
            summary: {
                productsProcessed: productsWithExpiry.length,
                productsUpdated: updatedProductsCount,
                batchesProcessed: totalBatchesProcessed,
                nearExpiryBatches: nearExpiryFound,
                expiredBatches: expiredFound,
            },
        };
    } catch (error) {
        logger.error("❌ Daily expiry check failed:", error.message);
        logger.error("Error details:", error);

        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Manual trigger for expiry check (useful for testing)
 */
const triggerManualExpiryCheck = async () => {
    logger.info("🔧 Manual expiry check triggered");
    return await runDailyExpiryCheck();
};

// Schedule the cron job - runs every day at 12:01 AM
cron.schedule(
    "1 0 * * *",
    async () => {
        await runDailyExpiryCheck();
    },
    {
        scheduled: true,
        timezone: "Asia/Kolkata", // Adjust timezone as needed
    }
);

// Log that the cron job is scheduled
logger.info("📅 Daily expiry checker scheduled: runs at 12:01 AM every day");

export { triggerManualExpiryCheck, runDailyExpiryCheck };
