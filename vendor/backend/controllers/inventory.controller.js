import VendorProduct from "../models/vendorProduct.model.js";
import Product from "../models/product.model.js";
import apiResponse from "../utils/response.util.js";
import logger from "../utils/logger.util.js";

/**
 * @desc    Get vendor inventory
 * @route   GET /api/inventory
 * @access  Private (Vendor)
 */
const getVendorInventory = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;

        const query = { vendor: req.vendor._id };

        if (status) {
            query["availability.availabilityStatus"] = status;
        }

        let vendorProducts = await VendorProduct.find(query)
            .populate("product", "name brand category images")
            .populate("product.category", "name")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ updatedAt: -1 });

        // Filter by search if provided
        if (search) {
            vendorProducts = vendorProducts.filter(
                (vp) =>
                    vp.product.name
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                    vp.product.brand
                        .toLowerCase()
                        .includes(search.toLowerCase())
            );
        }

        const total = await VendorProduct.countDocuments(query);

        return apiResponse.success(
            res,
            "Inventory retrieved successfully",
            vendorProducts,
            {
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            }
        );
    } catch (error) {
        logger.error("Get vendor inventory error:", error.message);
        next(error);
    }
};

/**
 * @desc    Add product to inventory
 * @route   POST /api/inventory/add-product
 * @access  Private (Vendor)
 */
const addProductToInventory = async (req, res, next) => {
    try {
        const { productId, pricing, inventory, expiryTracking, settings } =
            req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return apiResponse.notFound(res, "Product not found");
        }

        // Check if vendor already has this product
        const existingVendorProduct = await VendorProduct.findOne({
            vendor: req.vendor._id,
            product: productId,
        });

        if (existingVendorProduct) {
            return apiResponse.conflict(
                res,
                "Product already exists in your inventory"
            );
        }

        // Create vendor product
        const vendorProduct = await VendorProduct.create({
            vendor: req.vendor._id,
            product: productId,
            pricing,
            inventory,
            expiryTracking,
            settings,
        });

        await vendorProduct.populate("product", "name brand category");

        logger.info(
            `Product added to inventory: ${product.name} by vendor ${req.vendor.businessName}`
        );

        return apiResponse.created(
            res,
            "Product added to inventory successfully",
            vendorProduct
        );
    } catch (error) {
        logger.error("Add product to inventory error:", error.message);
        next(error);
    }
};

/**
 * @desc    Update product inventory
 * @route   PUT /api/inventory/product/:productId
 * @access  Private (Vendor)
 */
const updateProductInventory = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const updateData = req.body;

        const vendorProduct = await VendorProduct.findOneAndUpdate(
            { vendor: req.vendor._id, product: productId },
            updateData,
            { new: true, runValidators: true }
        ).populate("product", "name brand category");

        if (!vendorProduct) {
            return apiResponse.notFound(
                res,
                "Product not found in your inventory"
            );
        }

        logger.info(
            `Inventory updated for product: ${vendorProduct.product.name}`
        );

        return apiResponse.success(
            res,
            "Inventory updated successfully",
            vendorProduct
        );
    } catch (error) {
        logger.error("Update product inventory error:", error.message);
        next(error);
    }
};

/**
 * @desc    Remove product from inventory
 * @route   DELETE /api/inventory/product/:productId
 * @access  Private (Vendor)
 */
const removeProductFromInventory = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const vendorProduct = await VendorProduct.findOneAndUpdate(
            { vendor: req.vendor._id, product: productId },
            { isActive: false },
            { new: true }
        );

        if (!vendorProduct) {
            return apiResponse.notFound(
                res,
                "Product not found in your inventory"
            );
        }

        logger.info(
            `Product removed from inventory: ${productId} by vendor ${req.vendor.businessName}`
        );

        return apiResponse.success(
            res,
            "Product removed from inventory successfully"
        );
    } catch (error) {
        logger.error("Remove product from inventory error:", error.message);
        next(error);
    }
};

/**
 * @desc    Add stock for a product
 * @route   POST /api/inventory/add-stock
 * @access  Private (Vendor)
 */
const addStock = async (req, res, next) => {
    try {
        const { productId, quantity, batch } = req.body;

        const vendorProduct = await VendorProduct.findOne({
            vendor: req.vendor._id,
            product: productId,
        });

        if (!vendorProduct) {
            return apiResponse.notFound(
                res,
                "Product not found in your inventory"
            );
        }

        // Add to current stock
        vendorProduct.inventory.currentStock += quantity;

        // Add batch if expiry tracking is enabled
        if (vendorProduct.expiryTracking.hasExpiry && batch) {
            vendorProduct.expiryTracking.batches.push({
                ...batch,
                quantity,
            });
        }

        await vendorProduct.save();

        logger.info(`Stock added: ${quantity} units for product ${productId}`);

        return apiResponse.success(
            res,
            "Stock added successfully",
            vendorProduct
        );
    } catch (error) {
        logger.error("Add stock error:", error.message);
        next(error);
    }
};

/**
 * @desc    Update batch information
 * @route   PUT /api/inventory/batch/:batchId
 * @access  Private (Vendor)
 */
const updateBatch = async (req, res, next) => {
    try {
        const { batchId } = req.params;
        const updateData = req.body;

        const vendorProduct = await VendorProduct.findOne({
            vendor: req.vendor._id,
            "expiryTracking.batches._id": batchId,
        });

        if (!vendorProduct) {
            return apiResponse.notFound(res, "Batch not found");
        }

        // Update the specific batch
        const batch = vendorProduct.expiryTracking.batches.id(batchId);
        Object.assign(batch, updateData);

        await vendorProduct.save();

        logger.info(`Batch updated: ${batchId}`);

        return apiResponse.success(res, "Batch updated successfully", batch);
    } catch (error) {
        logger.error("Update batch error:", error.message);
        next(error);
    }
};

/**
 * @desc    Get near expiry products
 * @route   GET /api/inventory/near-expiry
 * @access  Private (Vendor)
 */
const getNearExpiryProducts = async (req, res, next) => {
    try {
        const nearExpiryProducts = await VendorProduct.find({
            vendor: req.vendor._id,
            "expiryTracking.batches.isNearExpiry": true,
            "expiryTracking.batches.remainingQuantity": { $gt: 0 },
        }).populate("product", "name brand images");

        return apiResponse.success(
            res,
            "Near expiry products retrieved successfully",
            nearExpiryProducts
        );
    } catch (error) {
        logger.error("Get near expiry products error:", error.message);
        next(error);
    }
};

/**
 * @desc    Get out of stock products
 * @route   GET /api/inventory/out-of-stock
 * @access  Private (Vendor)
 */
const getOutOfStockProducts = async (req, res, next) => {
    try {
        const outOfStockProducts = await VendorProduct.find({
            vendor: req.vendor._id,
            "availability.isOutOfStock": true,
        }).populate("product", "name brand images");

        return apiResponse.success(
            res,
            "Out of stock products retrieved successfully",
            outOfStockProducts
        );
    } catch (error) {
        logger.error("Get out of stock products error:", error.message);
        next(error);
    }
};

/**
 * @desc    Bulk update inventory
 * @route   POST /api/inventory/bulk-update
 * @access  Private (Vendor)
 */
const bulkUpdateInventory = async (req, res, next) => {
    try {
        const { updates } = req.body; // Array of { productId, updateData }

        if (!Array.isArray(updates) || updates.length === 0) {
            return apiResponse.badRequest(res, "Updates array is required");
        }

        const results = [];

        for (const update of updates) {
            try {
                const vendorProduct = await VendorProduct.findOneAndUpdate(
                    { vendor: req.vendor._id, product: update.productId },
                    update.updateData,
                    { new: true, runValidators: true }
                );

                if (vendorProduct) {
                    results.push({
                        productId: update.productId,
                        success: true,
                        data: vendorProduct,
                    });
                } else {
                    results.push({
                        productId: update.productId,
                        success: false,
                        error: "Product not found",
                    });
                }
            } catch (error) {
                results.push({
                    productId: update.productId,
                    success: false,
                    error: error.message,
                });
            }
        }

        logger.info(
            `Bulk inventory update completed: ${results.length} items processed`
        );

        return apiResponse.success(res, "Bulk update completed", results);
    } catch (error) {
        logger.error("Bulk update inventory error:", error.message);
        next(error);
    }
};

export {
    getVendorInventory,
    addProductToInventory,
    updateProductInventory,
    removeProductFromInventory,
    addStock,
    updateBatch,
    getNearExpiryProducts,
    getOutOfStockProducts,
    bulkUpdateInventory,
};
