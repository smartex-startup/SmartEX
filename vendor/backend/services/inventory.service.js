import VendorProduct from "../models/vendorProduct.model.js";
import Product from "../models/product.model.js";
import Vendor from "../models/vendor.model.js";
import logger from "../utils/logger.util.js";
import { updateAllBatchesExpiry } from "../utils/expiryCalculator.util.js";

// Helper function to calculate inventory summary efficiently
const calculateInventorySummary = async (vendorId) => {
    const summaryPipeline = [
        { $match: { vendor: vendorId, isActive: { $ne: false } } },
        {
            $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                totalValue: {
                    $sum: {
                        $multiply: [
                            { $ifNull: ["$pricing.finalPrice", 0] },
                            { $ifNull: ["$inventory.currentStock", 0] },
                        ],
                    },
                },
                lowStockItems: {
                    $sum: {
                        $cond: [
                            {
                                $lte: [
                                    "$inventory.currentStock",
                                    "$inventory.minStockLevel",
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                outOfStockItems: {
                    $sum: {
                        $cond: [{ $eq: ["$inventory.currentStock", 0] }, 1, 0],
                    },
                },
            },
        },
    ];

    const [summaryResult] = await VendorProduct.aggregate(summaryPipeline);
    return (
        summaryResult || {
            totalProducts: 0,
            totalValue: 0,
            lowStockItems: 0,
            outOfStockItems: 0,
        }
    );
};

// Fetch vendor inventory with filtering and pagination
const fetchVendorInventory = async (userId, filters = {}) => {
    try {
        // First get the vendor from user
        const vendor = await Vendor.findOne({ userId });
        if (!vendor) {
            throw new Error("Vendor not found");
        }

        // Build MongoDB query
        let query = {
            vendor: vendor._id,
            isActive: { $ne: false }, // Only include active products by default
        };

        // Status filter
        if (filters.status) {
            query["availability.availabilityStatus"] = filters.status;
        }

        // Price filters
        if (filters.minPrice !== null || filters.maxPrice !== null) {
            query["pricing.finalPrice"] = {};
            if (filters.minPrice !== null) {
                query["pricing.finalPrice"].$gte = filters.minPrice;
            }
            if (filters.maxPrice !== null) {
                query["pricing.finalPrice"].$lte = filters.maxPrice;
            }
        }

        // Expiry status filter
        if (filters.expiryStatus) {
            switch (filters.expiryStatus) {
                case "expired":
                    query["expiryTracking.batches"] = {
                        $elemMatch: { isExpired: true },
                    };
                    break;
                case "near_expiry":
                    query["expiryTracking.batches"] = {
                        $elemMatch: { isNearExpiry: true },
                    };
                    break;
                case "fresh":
                    query["$and"] = [
                        {
                            "expiryTracking.batches": {
                                $not: { $elemMatch: { isExpired: true } },
                            },
                        },
                        {
                            "expiryTracking.batches": {
                                $not: { $elemMatch: { isNearExpiry: true } },
                            },
                        },
                    ];
                    break;
            }
        }

        logger.info("MongoDB query:", JSON.stringify(query, null, 2));

        // Start building the aggregation pipeline
        let pipeline = [
            { $match: query },
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $lookup: {
                    from: "categories",
                    localField: "product.category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    // Complete product information (matching Product model schema)
                    product: {
                        _id: "$product._id",
                        name: "$product.name",
                        // description: "$product.description",
                        brand: "$product.brand",
                        basePrice: "$product.basePrice",
                        images: "$product.images",
                        // specifications: "$product.specifications",
                        // barcodes: "$product.barcodes",
                        // hsn: "$product.hsn",
                        // tags: "$product.tags",
                        isActive: "$product.isActive",
                        // requiresPrescription: "$product.requiresPrescription",
                        // variants: "$product.variants",
                    },
                    // Complete category information (matching Category model schema)
                    category: {
                        _id: "$category._id",
                        name: "$category.name",
                        slug: "$category.slug",
                        // description: "$category.description",
                        // image: "$category.image",
                        // icon: "$category.icon",
                        parentCategory: "$category.parentCategory",
                        isActive: "$category.isActive",
                        // sortOrder: "$category.sortOrder",
                        // metaData: "$category.metaData",
                    },
                    // All pricing fields (matching model schema)
                    pricing: {
                        costPrice: 1,
                        sellingPrice: 1,
                        discountPercentage: 1,
                        finalPrice: 1,
                        margin: 1,
                    },
                    // Complete inventory information
                    inventory: {
                        currentStock: 1,
                        minStockLevel: 1,
                        maxStockLevel: 1,
                        reservedStock: 1,
                        availableStock: 1,
                    },
                    // Availability information (matching model schema)
                    availability: {
                        isAvailable: 1,
                        isOutOfStock: 1,
                        estimatedRestockDate: 1,
                        availabilityStatus: 1,
                    },
                    // Calculated expiry status
                    expiryStatus: {
                        $cond: {
                            if: { $ne: ["$expiryTracking.hasExpiry", true] },
                            then: "no_expiry",
                            else: {
                                $cond: {
                                    if: {
                                        $gt: [
                                            {
                                                $size: {
                                                    $filter: {
                                                        input: "$expiryTracking.batches",
                                                        cond: {
                                                            $eq: [
                                                                "$$this.isExpired",
                                                                true,
                                                            ],
                                                        },
                                                    },
                                                },
                                            },
                                            0,
                                        ],
                                    },
                                    then: "expired",
                                    else: {
                                        $cond: {
                                            if: {
                                                $gt: [
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$expiryTracking.batches",
                                                                cond: {
                                                                    $eq: [
                                                                        "$$this.isNearExpiry",
                                                                        true,
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                    0,
                                                ],
                                            },
                                            then: "near_expiry",
                                            else: "fresh",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    // Basic expiry info (without heavy batch details)
                    expiryInfo: {
                        hasExpiry: "$expiryTracking.hasExpiry",
                        totalBatches: {
                            $size: { $ifNull: ["$expiryTracking.batches", []] },
                        },
                        nextExpiryDate: {
                            $min: {
                                $map: {
                                    input: "$expiryTracking.batches",
                                    as: "batch",
                                    in: "$$batch.expiryDate",
                                },
                            },
                        },
                    },
                    // Settings (matching model schema)
                    // settings: {
                    //     autoRestock: 1,
                    //     autoDiscountNearExpiry: 1,
                    //     hideWhenOutOfStock: 1,
                    //     maxOrderQuantity: 1,
                    //     minOrderQuantity: 1,
                    // },
                    // Top-level fields
                    isActive: 1,
                    // Timestamps
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ];

        // Add search filter if provided
        if (filters.search) {
            pipeline.push({
                $match: {
                    $or: [
                        {
                            "product.name": {
                                $regex: filters.search,
                                $options: "i",
                            },
                        },
                        {
                            "product.brand": {
                                $regex: filters.search,
                                $options: "i",
                            },
                        },
                        {
                            "category.name": {
                                $regex: filters.search,
                                $options: "i",
                            },
                        },
                    ],
                },
            });
        }

        // Add category filter if provided
        if (filters.category) {
            pipeline.push({
                $match: {
                    "product.category": filters.category,
                },
            });
        }

        // Add sorting
        let sortField = "product.name";
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case "name":
                case "product.name":
                    sortField = "product.name";
                    break;
                case "brand":
                case "product.brand":
                    sortField = "product.brand";
                    break;
                case "price":
                case "pricing.finalPrice":
                    sortField = "pricing.finalPrice";
                    break;
                case "stock":
                case "inventory.currentStock":
                    sortField = "inventory.currentStock";
                    break;
                case "updated":
                case "updatedAt":
                    sortField = "updatedAt";
                    break;
                case "category":
                    sortField = "category.name";
                    break;
                default:
                    sortField = "product.name";
            }
        }

        const sortOrder = filters.sortOrder === "desc" ? -1 : 1;
        pipeline.push({ $sort: { [sortField]: sortOrder } });

        // Get total count before pagination
        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await VendorProduct.aggregate(countPipeline);
        const totalItems = countResult.length > 0 ? countResult[0].total : 0;

        // Add pagination
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        // Execute the main query
        const products = await VendorProduct.aggregate(pipeline);

        // Calculate summary efficiently
        const summary = await calculateInventorySummary(vendor._id);

        const totalPages = Math.ceil(totalItems / limit);

        logger.info(
            `Inventory fetched for vendor: ${vendor.businessName} - ${products.length} items on page ${page} of ${totalPages}`
        );

        return {
            products,
            summary,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error) {
        logger.error(
            `Fetch inventory error for user ${userId}:`,
            error.message
        );
        throw error;
    }
};

// Add product to vendor inventory
const addProductToInventory = async (userId, productData) => {
    try {
        const { productId, pricing, inventory, expiryTracking, settings } =
            productData;

        // Get vendor from user
        const vendor = await Vendor.findOne({ userId });
        if (!vendor) {
            throw new Error("Vendor not found");
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error("Product not found");
        }

        // Check if vendor already has this product
        const existingProduct = await VendorProduct.findOne({
            vendor: vendor._id,
            product: productId,
        });

        if (existingProduct) {
            throw new Error("Product already exists in your inventory");
        }

        // Create vendor product with values (pre-save middleware will calculate dependent fields)
        const vendorProduct = await VendorProduct.create({
            vendor: vendor._id,
            product: productId,
            pricing: {
                costPrice: pricing?.costPrice || 0,
                sellingPrice: pricing?.sellingPrice || 0,
                discountPercentage: pricing?.discountPercentage || 0,
                finalPrice: pricing?.sellingPrice || 0, // Will be recalculated by pre-save
                margin: 0, // Will be recalculated by pre-save
            },
            inventory: {
                currentStock: inventory?.currentStock || 0,
                minStockLevel: inventory?.minStockLevel || 5,
                maxStockLevel: inventory?.maxStockLevel || 100,
                reservedStock: inventory?.reservedStock || 0,
                availableStock: 0, // Will be recalculated by pre-save
            },
            expiryTracking: expiryTracking || {
                hasExpiry: false,
                batches: [],
            },
            settings: settings || {
                isActive: true,
                isVisible: true,
            },
        });

        await vendorProduct.populate("product", "name brand category images");

        logger.info(
            `Product added to inventory: ${product.name} by vendor ${vendor.businessName}`
        );

        return vendorProduct;
    } catch (error) {
        logger.error(`Add product error for user ${userId}:`, error.message);
        throw error;
    }
};

// Update product inventory
const updateProductInventory = async (vendorProductId, userId, updateData) => {
    try {
        // Get vendor from user
        const vendor = await Vendor.findOne({ userId });
        if (!vendor) {
            throw new Error("Vendor not found");
        }

        // Find the vendor product first
        const vendorProduct = await VendorProduct.findOne({
            _id: vendorProductId,
            vendor: vendor._id,
        });

        if (!vendorProduct) {
            throw new Error("Product not found in your inventory");
        }

        // Apply updates using object merging (supports both nested objects and individual fields)
        Object.keys(updateData).forEach((key) => {
            if (key === "pricing" && typeof updateData[key] === "object") {
                // Merge pricing object
                vendorProduct.pricing = {
                    ...vendorProduct.pricing,
                    ...updateData[key],
                };
            } else if (
                key === "inventory" &&
                typeof updateData[key] === "object"
            ) {
                // Merge inventory object
                vendorProduct.inventory = {
                    ...vendorProduct.inventory,
                    ...updateData[key],
                };
            } else if (
                key === "expiryTracking" &&
                typeof updateData[key] === "object"
            ) {
                // Merge expiryTracking object
                vendorProduct.expiryTracking = {
                    ...vendorProduct.expiryTracking,
                    ...updateData[key],
                };
            } else if (
                key === "settings" &&
                typeof updateData[key] === "object"
            ) {
                // Merge settings object
                vendorProduct.settings = {
                    ...vendorProduct.settings,
                    ...updateData[key],
                };
            } else {
                // Handle top-level field updates
                vendorProduct[key] = updateData[key];
            }
        });

        // Save the document to trigger pre-save middleware
        const savedProduct = await vendorProduct.save();

        // Populate and return
        await savedProduct.populate("product", "name brand category images");

        logger.info(
            `Product updated: ${savedProduct.product.name} by vendor ${vendor.businessName}`
        );

        return savedProduct;
    } catch (error) {
        logger.error(`Update product error for user ${userId}:`, error.message);
        throw error;
    }
};

// Remove product from inventory
const removeFromInventory = async (vendorProductId, userId) => {
    try {
        // Get vendor from user
        const vendor = await Vendor.findOne({ userId });
        if (!vendor) {
            throw new Error("Vendor not found");
        }

        const vendorProduct = await VendorProduct.findOneAndUpdate(
            { _id: vendorProductId, vendor: vendor._id },
            {
                "settings.isActive": false,
                "settings.isVisible": false,
            },
            { new: true }
        );

        if (!vendorProduct) {
            throw new Error("Product not found in your inventory");
        }

        logger.info(
            `Product removed from inventory: ${vendorProductId} by vendor ${vendor.businessName}`
        );

        return vendorProduct;
    } catch (error) {
        logger.error(`Remove product error for user ${userId}:`, error.message);
        throw error;
    }
};

// Fetch single product from inventory
const fetchSingleProduct = async (vendorProductId, userId) => {
    try {
        // Get vendor from user
        const vendor = await Vendor.findOne({ userId });
        if (!vendor) {
            throw new Error("Vendor not found");
        }

        const vendorProduct = await VendorProduct.findOne({
            _id: vendorProductId,
            vendor: vendor._id,
        })
            .populate("product", "name brand category images description")
            .populate("vendor", "businessName storeDetails");

        if (!vendorProduct) {
            throw new Error("Product not found in your inventory");
        }

        logger.info(`Product fetched: ${vendorProduct.product.name}`);

        return vendorProduct;
    } catch (error) {
        logger.error(
            `Fetch single product error for user ${userId}:`,
            error.message
        );
        throw error;
    }
};

// Update stock levels for a product
const updateStockLevels = async (vendorProductId, userId, stockData) => {
    try {
        // Get vendor from user
        const vendor = await Vendor.findOne({ userId });
        if (!vendor) {
            throw new Error("Vendor not found");
        }

        // Find the vendor product
        const vendorProduct = await VendorProduct.findOne({
            _id: vendorProductId,
            vendor: vendor._id,
        });

        if (!vendorProduct) {
            throw new Error("Product not found in your inventory");
        }

        const { currentStock, minStockLevel, maxStockLevel, reservedStock } =
            stockData;

        // Update only the provided stock fields
        if (currentStock !== undefined)
            vendorProduct.inventory.currentStock = currentStock;
        if (minStockLevel !== undefined)
            vendorProduct.inventory.minStockLevel = minStockLevel;
        if (maxStockLevel !== undefined)
            vendorProduct.inventory.maxStockLevel = maxStockLevel;
        if (reservedStock !== undefined)
            vendorProduct.inventory.reservedStock = reservedStock;

        // Save to trigger pre-save middleware
        const savedProduct = await vendorProduct.save();

        // Populate and return
        await savedProduct.populate("product", "name brand category images");

        logger.info(
            `Stock updated for product: ${savedProduct.product.name} by vendor ${vendor.businessName}`
        );

        return savedProduct;
    } catch (error) {
        logger.error(`Update stock error for user ${userId}:`, error.message);
        throw error;
    }
};

// Fetch low stock items for vendor
const fetchLowStockItems = async (userId) => {
    try {
        // Get vendor from user
        const vendor = await Vendor.findOne({ userId });
        if (!vendor) {
            throw new Error("Vendor not found");
        }

        // Find products where current stock <= min stock level
        const lowStockItems = await VendorProduct.find({
            vendor: vendor._id,
            $expr: {
                $lte: ["$inventory.currentStock", "$inventory.minStockLevel"],
            },
            isActive: true,
        })
            .populate("product", "name brand category images")
            .sort({ "inventory.currentStock": 1 }); // Sort by lowest stock first

        // Calculate alerts summary
        const summary = {
            totalLowStockItems: lowStockItems.length,
            outOfStockItems: lowStockItems.filter(
                (item) => item.inventory.currentStock === 0
            ).length,
            criticalStockItems: lowStockItems.filter(
                (item) =>
                    item.inventory.currentStock > 0 &&
                    item.inventory.currentStock <=
                        item.inventory.minStockLevel * 0.5
            ).length,
        };

        logger.info(
            `Low stock items fetched for vendor: ${vendor.businessName} - ${lowStockItems.length} items`
        );

        return {
            items: lowStockItems,
            summary,
        };
    } catch (error) {
        logger.error(
            `Fetch low stock error for user ${userId}:`,
            error.message
        );
        throw error;
    }
};

// Process batch update for multiple products
const processBatchUpdate = async (userId, batchData) => {
    try {
        // Get vendor from user
        const vendor = await Vendor.findOne({ userId });
        if (!vendor) {
            throw new Error("Vendor not found");
        }

        const { updates } = batchData; // Array of { productId, updateData }

        if (!Array.isArray(updates) || updates.length === 0) {
            throw new Error("Updates array is required and must not be empty");
        }

        const results = [];
        let successCount = 0;
        let errorCount = 0;

        for (const update of updates) {
            try {
                const { productId, updateData } = update;

                if (!productId) {
                    results.push({
                        productId: null,
                        success: false,
                        error: "Product ID is required",
                    });
                    errorCount++;
                    continue;
                }

                // Find the vendor product
                const vendorProduct = await VendorProduct.findOne({
                    _id: productId,
                    vendor: vendor._id,
                });

                if (!vendorProduct) {
                    results.push({
                        productId,
                        success: false,
                        error: "Product not found in your inventory",
                    });
                    errorCount++;
                    continue;
                }

                // Apply updates using object merging (supports nested objects)
                Object.keys(updateData).forEach((key) => {
                    if (
                        key === "pricing" &&
                        typeof updateData[key] === "object"
                    ) {
                        // Merge pricing object
                        vendorProduct.pricing = {
                            ...vendorProduct.pricing,
                            ...updateData[key],
                        };
                    } else if (
                        key === "inventory" &&
                        typeof updateData[key] === "object"
                    ) {
                        // Merge inventory object
                        vendorProduct.inventory = {
                            ...vendorProduct.inventory,
                            ...updateData[key],
                        };
                    } else if (
                        key === "expiryTracking" &&
                        typeof updateData[key] === "object"
                    ) {
                        // Merge expiryTracking object
                        vendorProduct.expiryTracking = {
                            ...vendorProduct.expiryTracking,
                            ...updateData[key],
                        };
                    } else if (
                        key === "settings" &&
                        typeof updateData[key] === "object"
                    ) {
                        // Merge settings object
                        vendorProduct.settings = {
                            ...vendorProduct.settings,
                            ...updateData[key],
                        };
                    } else {
                        // Handle top-level field updates
                        vendorProduct[key] = updateData[key];
                    }
                });

                // Save to trigger pre-save middleware
                const savedProduct = await vendorProduct.save();

                // Populate for response
                await savedProduct.populate("product", "name brand");

                results.push({
                    productId,
                    success: true,
                    data: {
                        name: savedProduct.product.name,
                        brand: savedProduct.product.brand,
                        currentStock: savedProduct.inventory.currentStock,
                        sellingPrice: savedProduct.pricing.sellingPrice,
                        finalPrice: savedProduct.pricing.finalPrice,
                        margin: savedProduct.pricing.margin,
                    },
                });
                successCount++;
            } catch (error) {
                results.push({
                    productId: update.productId || null,
                    success: false,
                    error: error.message,
                });
                errorCount++;
            }
        }

        logger.info(
            `Batch update completed for vendor ${vendor.businessName}: ${successCount} success, ${errorCount} errors`
        );

        return {
            results,
            summary: {
                total: updates.length,
                successful: successCount,
                failed: errorCount,
            },
        };
    } catch (error) {
        logger.error(`Batch update error for user ${userId}:`, error.message);
        throw error;
    }
};

// Fetch near-expiry products for vendor
const fetchNearExpiryProducts = async (userId) => {
    try {
        // Get vendor from user
        const vendor = await Vendor.findOne({ userId });
        if (!vendor) {
            throw new Error("Vendor not found");
        }

        // Find products with near-expiry batches
        const nearExpiryProducts = await VendorProduct.find({
            vendor: vendor._id,
            "expiryTracking.hasExpiry": true,
            "expiryTracking.batches": {
                $elemMatch: {
                    isNearExpiry: true,
                    remainingQuantity: { $gt: 0 },
                },
            },
            isActive: true,
        })
            .populate("product", "name brand category images")
            .sort({ "expiryTracking.batches.daysToExpiry": 1 }); // Sort by most urgent first

        // Calculate summary
        let totalNearExpiryProducts = 0;
        let totalNearExpiryStock = 0;
        let totalDiscountValue = 0;

        const processedProducts = nearExpiryProducts
            .map((vendorProduct) => {
                const nearExpiryBatches =
                    vendorProduct.expiryTracking.batches.filter(
                        (batch) =>
                            batch.isNearExpiry && batch.remainingQuantity > 0
                    );

                if (nearExpiryBatches.length > 0) {
                    totalNearExpiryProducts++;

                    const batchStockTotal = nearExpiryBatches.reduce(
                        (sum, batch) => sum + batch.remainingQuantity,
                        0
                    );
                    totalNearExpiryStock += batchStockTotal;

                    // Calculate discount value
                    const originalValue =
                        batchStockTotal * vendorProduct.pricing.finalPrice;
                    const maxDiscount = Math.max(
                        ...nearExpiryBatches.map(
                            (b) => b.nearExpiryDiscount || 0
                        )
                    );
                    const discountValue = originalValue * (maxDiscount / 100);
                    totalDiscountValue += discountValue;

                    return {
                        _id: vendorProduct._id,
                        product: vendorProduct.product,
                        pricing: vendorProduct.pricing,
                        nearExpiryBatches: nearExpiryBatches.map((batch) => ({
                            batchNumber: batch.batchNumber,
                            expiryDate: batch.expiryDate,
                            daysToExpiry: batch.daysToExpiry,
                            quantity: batch.remainingQuantity,
                            nearExpiryDiscount: batch.nearExpiryDiscount,
                            discountedPrice:
                                vendorProduct.pricing.finalPrice *
                                (1 - batch.nearExpiryDiscount / 100),
                        })),
                        totalNearExpiryStock: batchStockTotal,
                        discountValue,
                    };
                }
                return null;
            })
            .filter(Boolean);

        logger.info(
            `Near-expiry products fetched for vendor: ${vendor.businessName} - ${totalNearExpiryProducts} products`
        );

        return {
            products: processedProducts,
            summary: {
                totalNearExpiryProducts,
                totalNearExpiryStock,
                totalDiscountValue: Math.round(totalDiscountValue * 100) / 100,
                averageDiscount:
                    processedProducts.length > 0
                        ? Math.round(
                              (totalDiscountValue /
                                  (totalNearExpiryStock *
                                      (processedProducts[0]?.pricing
                                          ?.finalPrice || 0))) *
                                  100
                          )
                        : 0,
            },
        };
    } catch (error) {
        logger.error(
            `Fetch near-expiry products error for user ${userId}:`,
            error.message
        );
        throw error;
    }
};

// Fetch expired products for vendor
const fetchExpiredProducts = async (userId) => {
    try {
        // Get vendor from user
        const vendor = await Vendor.findOne({ userId });
        if (!vendor) {
            throw new Error("Vendor not found");
        }

        // Find products with expired batches
        const expiredProducts = await VendorProduct.find({
            vendor: vendor._id,
            "expiryTracking.hasExpiry": true,
            "expiryTracking.batches": {
                $elemMatch: {
                    isExpired: true,
                    remainingQuantity: { $gt: 0 },
                },
            },
            isActive: true,
        })
            .populate("product", "name brand category images")
            .sort({ "expiryTracking.batches.expiryDate": 1 }); // Sort by oldest expiry first

        // Calculate summary
        let totalExpiredProducts = 0;
        let totalExpiredStock = 0;
        let totalLossValue = 0;

        const processedProducts = expiredProducts
            .map((vendorProduct) => {
                const expiredBatches =
                    vendorProduct.expiryTracking.batches.filter(
                        (batch) =>
                            batch.isExpired && batch.remainingQuantity > 0
                    );

                if (expiredBatches.length > 0) {
                    totalExpiredProducts++;

                    const batchStockTotal = expiredBatches.reduce(
                        (sum, batch) => sum + batch.remainingQuantity,
                        0
                    );
                    totalExpiredStock += batchStockTotal;

                    // Calculate loss value (at cost price)
                    const lossValue =
                        batchStockTotal * vendorProduct.pricing.costPrice;
                    totalLossValue += lossValue;

                    return {
                        _id: vendorProduct._id,
                        product: vendorProduct.product,
                        pricing: vendorProduct.pricing,
                        expiredBatches: expiredBatches.map((batch) => ({
                            batchNumber: batch.batchNumber,
                            expiryDate: batch.expiryDate,
                            daysExpired: Math.abs(batch.daysToExpiry),
                            quantity: batch.remainingQuantity,
                        })),
                        totalExpiredStock: batchStockTotal,
                        lossValue,
                    };
                }
                return null;
            })
            .filter(Boolean);

        logger.info(
            `Expired products fetched for vendor: ${vendor.businessName} - ${totalExpiredProducts} products`
        );

        return {
            products: processedProducts,
            summary: {
                totalExpiredProducts,
                totalExpiredStock,
                totalLossValue: Math.round(totalLossValue * 100) / 100,
            },
        };
    } catch (error) {
        logger.error(
            `Fetch expired products error for user ${userId}:`,
            error.message
        );
        throw error;
    }
};

// Update product batches
const updateProductBatches = async (vendorProductId, userId, updateData) => {
    try {
        // Get vendor from user
        const vendor = await Vendor.findOne({ userId });
        if (!vendor) {
            throw new Error("Vendor not found");
        }

        // Find the vendor product
        const vendorProduct = await VendorProduct.findOne({
            _id: vendorProductId,
            vendor: vendor._id,
        });

        if (!vendorProduct) {
            throw new Error("Product not found in your inventory");
        }

        // Update expiry tracking if provided
        if (updateData.expiryTracking) {
            if (updateData.expiryTracking.hasExpiry !== undefined) {
                vendorProduct.expiryTracking.hasExpiry =
                    updateData.expiryTracking.hasExpiry;
            }

            if (updateData.expiryTracking.batches) {
                const newBatches = updateData.expiryTracking.batches;

                // Handle batch updates intelligently
                if (updateData.replaceAllBatches === true) {
                    // Option 1: Replace all batches (explicit choice)
                    vendorProduct.expiryTracking.batches = newBatches;
                    logger.info(
                        `Replaced all batches for product ${vendorProductId}`
                    );
                } else {
                    // Option 2: Add/Update batches (default behavior)
                    const existingBatches =
                        vendorProduct.expiryTracking.batches || [];

                    newBatches.forEach((newBatch) => {
                        // Find existing batch with same batchNumber
                        const existingIndex = existingBatches.findIndex(
                            (batch) =>
                                batch.batchNumber === newBatch.batchNumber
                        );

                        if (existingIndex !== -1) {
                            // Update existing batch
                            existingBatches[existingIndex] = {
                                ...existingBatches[existingIndex].toObject(),
                                ...newBatch,
                            };
                            logger.info(
                                `Updated existing batch ${newBatch.batchNumber}`
                            );
                        } else {
                            // Add new batch
                            existingBatches.push(newBatch);
                            logger.info(
                                `Added new batch ${newBatch.batchNumber}`
                            );
                        }
                    });

                    vendorProduct.expiryTracking.batches = existingBatches;
                }

                // Recalculate inventory totals based on batches
                if (
                    vendorProduct.expiryTracking.hasExpiry &&
                    vendorProduct.expiryTracking.batches.length > 0
                ) {
                    const totalBatchQuantity =
                        vendorProduct.expiryTracking.batches.reduce(
                            (sum, batch) => sum + (batch.quantity || 0),
                            0
                        );

                    // Update currentStock to match total batch quantities
                    vendorProduct.inventory.currentStock = totalBatchQuantity;

                    logger.info(
                        `Updated currentStock to ${totalBatchQuantity} based on batch totals`
                    );
                }
            }
        }

        // Save to trigger pre-save middleware (which will calculate expiry fields and availableStock)
        const savedProduct = await vendorProduct.save();

        // Populate and return
        await savedProduct.populate("product", "name brand category images");

        logger.info(
            `Product batches updated: ${savedProduct.product.name} by vendor ${vendor.businessName}`
        );

        return savedProduct;
    } catch (error) {
        logger.error(
            `Update product batches error for user ${userId}:`,
            error.message
        );
        throw error;
    }
};

export {
    fetchVendorInventory,
    addProductToInventory,
    updateProductInventory,
    removeFromInventory,
    fetchSingleProduct,
    updateStockLevels,
    fetchLowStockItems,
    processBatchUpdate,
    fetchNearExpiryProducts,
    fetchExpiredProducts,
    updateProductBatches,
};
