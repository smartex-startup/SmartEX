import {
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
} from "../services/inventory.service.js";
import apiResponse from "../utils/response.util.js";
import logger from "../utils/logger.util.js";

// Get inventory
const getInventory = async (req, res) => {
    try {
        const inventory = await fetchVendorInventory(req.user.id);
        return apiResponse.success(
            res,
            "Inventory retrieved successfully",
            inventory
        );
    } catch (error) {
        logger.error("Get inventory controller error:", error.message);

        if (error.message.includes("not found")) {
            return apiResponse.notFound(res, error.message);
        }

        return apiResponse.serverError(res, "Failed to retrieve inventory");
    }
};

// Add product to inventory
const addProduct = async (req, res) => {
    try {
        const newProduct = await addProductToInventory(req.user.id, req.body);
        return apiResponse.created(
            res,
            "Product added to inventory successfully",
            newProduct
        );
    } catch (error) {
        logger.error("Add product controller error:", error.message);

        if (error.message.includes("not found")) {
            return apiResponse.notFound(res, error.message);
        }

        if (error.message.includes("already exists")) {
            return apiResponse.conflict(res, error.message);
        }

        if (error.name === "ValidationError") {
            return apiResponse.badRequest(res, error.message);
        }

        return apiResponse.serverError(res, "Failed to add product");
    }
};

// Update product inventory
const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await updateProductInventory(
            req.params.id,
            req.user.id,
            req.body
        );
        return apiResponse.success(
            res,
            "Product updated successfully",
            updatedProduct
        );
    } catch (error) {
        logger.error("Update product controller error:", error.message);

        if (error.message.includes("not found")) {
            return apiResponse.notFound(res, error.message);
        }

        if (error.name === "ValidationError") {
            return apiResponse.badRequest(res, error.message);
        }

        return apiResponse.serverError(res, "Failed to update product");
    }
};

// Remove product from inventory
const removeProduct = async (req, res) => {
    try {
        await removeFromInventory(req.params.id, req.user.id);
        return apiResponse.success(
            res,
            "Product removed from inventory successfully",
            null
        );
    } catch (error) {
        logger.error("Remove product controller error:", error.message);

        if (error.message.includes("not found")) {
            return apiResponse.notFound(res, error.message);
        }

        return apiResponse.serverError(res, "Failed to remove product");
    }
};

// Get single product from inventory
const getProduct = async (req, res) => {
    try {
        const product = await fetchSingleProduct(req.params.id, req.user.id);
        return apiResponse.success(
            res,
            "Product retrieved successfully",
            product
        );
    } catch (error) {
        logger.error("Get product controller error:", error.message);

        if (error.message.includes("not found")) {
            return apiResponse.notFound(res, error.message);
        }

        return apiResponse.serverError(res, "Failed to retrieve product");
    }
};

// Update stock levels for a product
const updateStock = async (req, res) => {
    try {
        const updatedProduct = await updateStockLevels(
            req.params.id,
            req.user.id,
            req.body
        );
        return apiResponse.success(
            res,
            "Stock updated successfully",
            updatedProduct
        );
    } catch (error) {
        logger.error("Update stock controller error:", error.message);

        if (error.message.includes("not found")) {
            return apiResponse.notFound(res, error.message);
        }

        if (error.name === "ValidationError") {
            return apiResponse.badRequest(res, error.message);
        }

        return apiResponse.serverError(res, "Failed to update stock");
    }
};

// Get low stock items
const getLowStock = async (req, res) => {
    try {
        const lowStockItems = await fetchLowStockItems(req.user.id);
        return apiResponse.success(
            res,
            "Low stock items retrieved successfully",
            lowStockItems
        );
    } catch (error) {
        logger.error("Get low stock controller error:", error.message);

        if (error.message.includes("not found")) {
            return apiResponse.notFound(res, error.message);
        }

        return apiResponse.serverError(
            res,
            "Failed to retrieve low stock items"
        );
    }
};

// Batch update multiple products
const batchUpdate = async (req, res) => {
    try {
        const results = await processBatchUpdate(req.user.id, req.body);
        return apiResponse.success(res, "Batch update completed", results);
    } catch (error) {
        logger.error("Batch update controller error:", error.message);

        if (error.message.includes("not found")) {
            return apiResponse.notFound(res, error.message);
        }

        if (error.name === "ValidationError") {
            return apiResponse.badRequest(res, error.message);
        }

        return apiResponse.serverError(res, "Failed to process batch update");
    }
};

// Get near-expiry products
const getNearExpiry = async (req, res) => {
    try {
        const nearExpiryData = await fetchNearExpiryProducts(req.user.id);
        return apiResponse.success(
            res,
            "Near-expiry products retrieved successfully",
            nearExpiryData
        );
    } catch (error) {
        logger.error("Get near-expiry controller error:", error.message);

        if (error.message.includes("not found")) {
            return apiResponse.notFound(res, error.message);
        }

        return apiResponse.serverError(
            res,
            "Failed to retrieve near-expiry products"
        );
    }
};

// Get expired products
const getExpired = async (req, res) => {
    try {
        const expiredData = await fetchExpiredProducts(req.user.id);
        return apiResponse.success(
            res,
            "Expired products retrieved successfully",
            expiredData
        );
    } catch (error) {
        logger.error("Get expired controller error:", error.message);

        if (error.message.includes("not found")) {
            return apiResponse.notFound(res, error.message);
        }

        return apiResponse.serverError(
            res,
            "Failed to retrieve expired products"
        );
    }
};

// Update product batches
const updateBatches = async (req, res) => {
    try {
        const updatedProduct = await updateProductBatches(
            req.params.id,
            req.user.id,
            req.body
        );
        return apiResponse.success(
            res,
            "Product batches updated successfully",
            updatedProduct
        );
    } catch (error) {
        logger.error("Update batches controller error:", error.message);

        if (error.message.includes("not found")) {
            return apiResponse.notFound(res, error.message);
        }

        if (error.name === "ValidationError") {
            return apiResponse.badRequest(res, error.message);
        }

        return apiResponse.serverError(res, "Failed to update product batches");
    }
};

export {
    getInventory,
    addProduct,
    updateProduct,
    removeProduct,
    getProduct,
    updateStock,
    getLowStock,
    batchUpdate,
    getNearExpiry,
    getExpired,
    updateBatches,
};
