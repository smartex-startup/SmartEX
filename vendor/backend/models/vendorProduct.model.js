import mongoose from "mongoose";
import { updateBatchExpiryFields } from "../utils/expiryCalculator.util.js";

const vendorProductSchema = new mongoose.Schema(
    {
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: [true, "Vendor is required"],
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product is required"],
        },

        pricing: {
            costPrice: {
                type: Number,
                required: [true, "Cost price is required"],
                min: [0, "Cost price cannot be negative"],
            },
            sellingPrice: {
                type: Number,
                required: [true, "Selling price is required"],
                min: [0, "Selling price cannot be negative"],
            },
            discountPercentage: {
                type: Number,
                default: 0,
                min: [0, "Discount cannot be negative"],
                max: [100, "Discount cannot exceed 100%"],
            },
            finalPrice: {
                type: Number,
                required: [true, "Final price is required"],
                min: [0, "Final price cannot be negative"],
            },
            margin: {
                type: Number,
                default: 0,
            },
        },

        inventory: {
            currentStock: {
                type: Number,
                required: [true, "Current stock is required"],
                default: 0,
                min: [0, "Stock cannot be negative"],
            },
            minStockLevel: {
                type: Number,
                default: 5,
                min: [0, "Minimum stock level cannot be negative"],
            },
            maxStockLevel: {
                type: Number,
                default: 100,
                min: [1, "Maximum stock level must be at least 1"],
            },
            reservedStock: {
                type: Number,
                default: 0,
                min: [0, "Reserved stock cannot be negative"],
            },
            availableStock: {
                type: Number,
                default: 0,
            },
        },

        expiryTracking: {
            hasExpiry: {
                type: Boolean,
                default: true,
            },
            batches: [
                {
                    batchNumber: {
                        type: String,
                        required: function () {
                            return this.parent().hasExpiry;
                        },
                    },
                    manufactureDate: {
                        type: Date,
                        required: function () {
                            return this.parent().hasExpiry;
                        },
                    },
                    expiryDate: {
                        type: Date,
                        required: function () {
                            return this.parent().hasExpiry;
                        },
                    },
                    quantity: {
                        type: Number,
                        required: true,
                        min: [0, "Batch quantity cannot be negative"],
                    },
                    isNearExpiry: {
                        type: Boolean,
                        default: false,
                    },
                    nearExpiryDiscount: {
                        type: Number,
                        default: 0,
                        min: [0, "Near expiry discount cannot be negative"],
                        max: [100, "Near expiry discount cannot exceed 100%"],
                    },
                    daysToExpiry: {
                        type: Number,
                        default: 0,
                    },
                    isExpired: {
                        type: Boolean,
                        default: false,
                    },
                    soldQuantity: {
                        type: Number,
                        default: 0,
                        min: [0, "Sold quantity cannot be negative"],
                    },
                    remainingQuantity: {
                        type: Number,
                        default: 0,
                    },
                },
            ],
        },

        availability: {
            isAvailable: {
                type: Boolean,
                default: true,
            },
            isOutOfStock: {
                type: Boolean,
                default: false,
            },
            estimatedRestockDate: {
                type: Date,
            },
            availabilityStatus: {
                type: String,
                enum: [
                    "available",
                    "out_of_stock",
                    "low_stock",
                    "discontinued",
                ],
                default: "available",
            },
        },

        salesMetrics: {
            totalSold: {
                type: Number,
                default: 0,
                min: [0, "Total sold cannot be negative"],
            },
            revenue: {
                type: Number,
                default: 0,
                min: [0, "Revenue cannot be negative"],
            },
            averageRating: {
                type: Number,
                default: 0,
                min: [0, "Rating cannot be negative"],
                max: [5, "Rating cannot exceed 5"],
            },
            totalReviews: {
                type: Number,
                default: 0,
                min: [0, "Total reviews cannot be negative"],
            },
            lastSaleDate: {
                type: Date,
            },
        },

        // Vendor-specific product settings
        settings: {
            autoRestock: {
                type: Boolean,
                default: false,
            },
            autoDiscountNearExpiry: {
                type: Boolean,
                default: true,
            },
            hideWhenOutOfStock: {
                type: Boolean,
                default: false,
            },
            maxOrderQuantity: {
                type: Number,
                default: 10,
                min: [1, "Max order quantity must be at least 1"],
            },
            minOrderQuantity: {
                type: Number,
                default: 1,
                min: [1, "Min order quantity must be at least 1"],
            },
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure one vendor can't have duplicate products
vendorProductSchema.index({ vendor: 1, product: 1 }, { unique: true });

// Indexes for efficient querying
vendorProductSchema.index({ "expiryTracking.batches.expiryDate": 1 });
vendorProductSchema.index({ "availability.isAvailable": 1 });
vendorProductSchema.index({ "inventory.currentStock": 1 });
vendorProductSchema.index({ "pricing.finalPrice": 1 });
vendorProductSchema.index({ "expiryTracking.batches.isNearExpiry": 1 });

// Helper functions for calculations
function calculatePricing() {
    // Calculate discount amount
    const discountAmount =
        (this.pricing.sellingPrice * this.pricing.discountPercentage) / 100;

    // Calculate final price after discount
    this.pricing.finalPrice = Math.max(
        0,
        this.pricing.sellingPrice - discountAmount
    );

    // Calculate margin (profit)
    this.pricing.margin = this.pricing.sellingPrice - this.pricing.costPrice;

    // Calculate margin percentage
    this.pricing.marginPercentage =
        this.pricing.sellingPrice > 0
            ? (this.pricing.margin / this.pricing.sellingPrice) * 100
            : 0;
}

function calculateInventory() {
    // Ensure non-negative values
    this.inventory.currentStock = Math.max(0, this.inventory.currentStock);
    this.inventory.reservedStock = Math.max(0, this.inventory.reservedStock);

    // Calculate available stock
    this.inventory.availableStock = Math.max(
        0,
        this.inventory.currentStock - this.inventory.reservedStock
    );

    // Auto-calculate current stock from batches if expiry tracking is enabled
    if (
        this.expiryTracking.hasExpiry &&
        this.expiryTracking.batches &&
        this.expiryTracking.batches.length > 0
    ) {
        const totalBatchStock = this.expiryTracking.batches.reduce(
            (sum, batch) => {
                return sum + Math.max(0, batch.quantity - batch.soldQuantity);
            },
            0
        );

        // Update current stock to match batch totals
        this.inventory.currentStock = totalBatchStock;
        this.inventory.availableStock = Math.max(
            0,
            this.inventory.currentStock - this.inventory.reservedStock
        );
    }
}

function updateAvailabilityStatus() {
    if (this.inventory.currentStock <= 0) {
        this.availability.isOutOfStock = true;
        this.availability.isAvailable = false;
        this.availability.availabilityStatus = "out_of_stock";
    } else if (this.inventory.currentStock <= this.inventory.minStockLevel) {
        this.availability.isOutOfStock = false;
        this.availability.isAvailable = true;
        this.availability.availabilityStatus = "low_stock";
    } else {
        this.availability.isOutOfStock = false;
        this.availability.isAvailable = true;
        this.availability.availabilityStatus = "available";
    }

    // Hide product if setting is enabled and out of stock
    if (this.settings.hideWhenOutOfStock && this.availability.isOutOfStock) {
        this.isActive = false;
    }
}

function processBatches() {
    if (
        !this.expiryTracking.hasExpiry ||
        !this.expiryTracking.batches ||
        this.expiryTracking.batches.length === 0
    ) {
        return;
    }

    this.expiryTracking.batches.forEach((batch) => {
        // Ensure valid quantities
        batch.quantity = Math.max(0, batch.quantity);
        batch.soldQuantity = Math.max(
            0,
            Math.min(batch.soldQuantity, batch.quantity)
        );

        // Calculate remaining quantity
        batch.remainingQuantity = batch.quantity - batch.soldQuantity;

        // Update expiry fields using utility
        if (batch.expiryDate) {
            const updatedBatch = updateBatchExpiryFields(batch);
            batch.daysToExpiry = updatedBatch.daysToExpiry;
            batch.isExpired = updatedBatch.isExpired;
            batch.isNearExpiry = updatedBatch.isNearExpiry;
            batch.nearExpiryDiscount = updatedBatch.nearExpiryDiscount;
        }
    });

    // Remove expired batches with zero remaining quantity if auto-cleanup is enabled
    if (this.settings.autoCleanupExpired) {
        this.expiryTracking.batches = this.expiryTracking.batches.filter(
            (batch) => !batch.isExpired || batch.remainingQuantity > 0
        );
    }

    // Sort batches by expiry date (earliest first)
    this.expiryTracking.batches.sort((a, b) => {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate) - new Date(b.expiryDate);
    });
}

function validateBusinessRules() {
    // Ensure min stock is not greater than max stock
    if (this.inventory.minStockLevel > this.inventory.maxStockLevel) {
        this.inventory.minStockLevel = this.inventory.maxStockLevel;
    }

    // Ensure min order quantity is not greater than max order quantity
    if (this.settings.minOrderQuantity > this.settings.maxOrderQuantity) {
        this.settings.minOrderQuantity = this.settings.maxOrderQuantity;
    }

    // Ensure reserved stock doesn't exceed current stock
    if (this.inventory.reservedStock > this.inventory.currentStock) {
        this.inventory.reservedStock = this.inventory.currentStock;
    }

    // Ensure selling price is not less than cost price (warning in margin)
    if (this.pricing.sellingPrice < this.pricing.costPrice) {
        this.pricing.hasNegativeMargin = true;
    } else {
        this.pricing.hasNegativeMargin = false;
    }

    // Cap discount percentage at 100%
    this.pricing.discountPercentage = Math.min(
        100,
        Math.max(0, this.pricing.discountPercentage)
    );
}

// Main pre-save middleware
vendorProductSchema.pre("save", function (next) {
    try {
        // Execute all calculation and validation functions
        calculatePricing.call(this);
        processBatches.call(this);
        calculateInventory.call(this);
        updateAvailabilityStatus.call(this);
        validateBusinessRules.call(this);

        next();
    } catch (error) {
        next(error);
    }
});

// Method to get effective price (considering near expiry discounts)
vendorProductSchema.methods.getEffectivePrice = function () {
    if (!this.expiryTracking.hasExpiry) {
        return this.pricing.finalPrice;
    }

    // Find the batch with highest near expiry discount
    let maxDiscount = 0;
    this.expiryTracking.batches.forEach((batch) => {
        if (batch.isNearExpiry && batch.remainingQuantity > 0) {
            maxDiscount = Math.max(maxDiscount, batch.nearExpiryDiscount);
        }
    });

    if (maxDiscount > 0) {
        const additionalDiscount =
            (this.pricing.finalPrice * maxDiscount) / 100;
        return this.pricing.finalPrice - additionalDiscount;
    }

    return this.pricing.finalPrice;
};

// Method to check if product is near expiry
vendorProductSchema.methods.hasNearExpiryStock = function () {
    if (!this.expiryTracking.hasExpiry) {
        return false;
    }

    return this.expiryTracking.batches.some(
        (batch) => batch.isNearExpiry && batch.remainingQuantity > 0
    );
};

// Method to calculate total value of inventory
vendorProductSchema.methods.calculateInventoryValue = function () {
    const costValue = this.inventory.currentStock * this.pricing.costPrice;
    const sellingValue =
        this.inventory.currentStock * this.pricing.sellingPrice;

    return {
        costValue: Math.round(costValue * 100) / 100,
        sellingValue: Math.round(sellingValue * 100) / 100,
        potentialProfit: Math.round((sellingValue - costValue) * 100) / 100,
    };
};

// Method to get profit margin details
vendorProductSchema.methods.getProfitAnalysis = function () {
    const effectivePrice = this.getEffectivePrice();
    const profit = effectivePrice - this.pricing.costPrice;
    const profitPercentage =
        effectivePrice > 0 ? (profit / effectivePrice) * 100 : 0;

    return {
        costPrice: this.pricing.costPrice,
        sellingPrice: this.pricing.sellingPrice,
        effectivePrice: Math.round(effectivePrice * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        profitPercentage: Math.round(profitPercentage * 100) / 100,
        hasNegativeMargin: profit < 0,
        hasNearExpiryDiscount: this.hasNearExpiryStock(),
    };
};

export default mongoose.model("VendorProduct", vendorProductSchema);
