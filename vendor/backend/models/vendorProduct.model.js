import mongoose from "mongoose";

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

// Pre-save middleware to calculate derived fields
vendorProductSchema.pre("save", function (next) {
    // Calculate final price
    const discount =
        (this.pricing.sellingPrice * this.pricing.discountPercentage) / 100;
    this.pricing.finalPrice = this.pricing.sellingPrice - discount;

    // Calculate margin
    this.pricing.margin = this.pricing.sellingPrice - this.pricing.costPrice;

    // Calculate available stock
    this.inventory.availableStock =
        this.inventory.currentStock - this.inventory.reservedStock;

    // Update availability status
    if (this.inventory.currentStock <= 0) {
        this.availability.isOutOfStock = true;
        this.availability.availabilityStatus = "out_of_stock";
        this.availability.isAvailable = false;
    } else if (this.inventory.currentStock <= this.inventory.minStockLevel) {
        this.availability.availabilityStatus = "low_stock";
        this.availability.isOutOfStock = false;
        this.availability.isAvailable = true;
    } else {
        this.availability.isOutOfStock = false;
        this.availability.availabilityStatus = "available";
        this.availability.isAvailable = true;
    }

    // Update batch remaining quantities
    if (this.expiryTracking.batches && this.expiryTracking.batches.length > 0) {
        this.expiryTracking.batches.forEach((batch) => {
            batch.remainingQuantity = batch.quantity - batch.soldQuantity;

            // Check if batch is expired
            const today = new Date();
            if (batch.expiryDate && batch.expiryDate < today) {
                batch.isExpired = true;
            }

            // Calculate days to expiry
            if (batch.expiryDate) {
                const timeDiff = batch.expiryDate.getTime() - today.getTime();
                batch.daysToExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
            }
        });
    }

    next();
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

export default mongoose.model("VendorProduct", vendorProductSchema);
