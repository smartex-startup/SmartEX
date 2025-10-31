import VendorProduct from "../models/vendorProduct.model.js";
import Product from "../models/product.model.js";
import Vendor from "../models/vendor.model.js";
import logger from "../utils/logger.util.js";

// Fetch vendor inventory
const fetchVendorInventory = async (userId) => {
    try {
        // First get the vendor from user
        const vendor = await Vendor.findOne({ userId });
        if (!vendor) {
            throw new Error("Vendor not found");
        }

        const inventory = await VendorProduct.find({ vendor: vendor._id })
            .populate("product", "name brand category images")
            .populate("vendor", "businessName")
            .sort({ updatedAt: -1 });

        // Calculate summary
        const summary = {
            totalProducts: inventory.length,
            totalValue: inventory.reduce((total, item) => {
                return (
                    total +
                    (item.pricing?.sellingPrice || 0) *
                        (item.inventory?.currentStock || 0)
                );
            }, 0),
            lowStockItems: inventory.filter(
                (item) =>
                    item.inventory?.currentStock <=
                    item.inventory?.minStockLevel
            ).length,
            outOfStockItems: inventory.filter(
                (item) => item.inventory?.currentStock === 0
            ).length,
        };

        logger.info(`Inventory fetched for vendor: ${vendor.businessName}`);

        return {
            products: inventory,
            summary,
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

export {
    fetchVendorInventory,
    addProductToInventory,
    updateProductInventory,
    removeFromInventory,
    fetchSingleProduct,
    updateStockLevels,
    fetchLowStockItems,
    processBatchUpdate,
};
