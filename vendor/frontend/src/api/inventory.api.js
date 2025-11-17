import apiClient from "../utils/axios.js";
import logger from "../utils/logger.util.js";

// Get vendor inventory with pagination and filtering
export const getInventory = async (params = {}) => {
    try {
        logger.info("Fetching vendor inventory...", params);

        const queryParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
            if (
                params[key] !== null &&
                params[key] !== undefined &&
                params[key] !== ""
            ) {
                queryParams.append(key, params[key]);
            }
        });

        const queryString = queryParams.toString();
        const url = queryString ? `/inventory?${queryString}` : "/inventory";

        const response = await apiClient.get(url);
        logger.info("Inventory fetched successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to fetch inventory:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Get single product from inventory
export const getProduct = async (productId) => {
    try {
        logger.info(`Fetching product: ${productId}...`);
        const response = await apiClient.get(`/inventory/${productId}`);
        logger.info("Product fetched successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to fetch product:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Check if vendor has this master product in their inventory
export const getVendorProductByMasterProductId = async (masterProductId) => {
    try {
        logger.info(
            `Checking if vendor has master product: ${masterProductId}...`
        );
        const response = await apiClient.get(
            `/inventory/by-product/${masterProductId}`
        );
        logger.info("Vendor product check completed");
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            // Product not found in vendor inventory - this is expected for new products
            logger.info("Product not found in vendor inventory - new product");
            return { success: false, data: null };
        }
        logger.error(
            "Failed to check vendor product:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Add product to inventory
export const addProduct = async (productData) => {
    try {
        logger.info("Adding product to inventory...");
        const response = await apiClient.post("/inventory/add", productData);
        logger.info("Product added successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to add product:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Update product in inventory
export const updateProduct = async (productId, updateData) => {
    try {
        logger.info(`Updating product: ${productId}...`);
        const response = await apiClient.put(
            `/inventory/${productId}`,
            updateData
        );
        logger.info("Product updated successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to update product:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Remove product from inventory
export const removeProduct = async (productId) => {
    try {
        logger.info(`Removing product: ${productId}...`);
        const response = await apiClient.delete(`/inventory/${productId}`);
        logger.info("Product removed successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to remove product:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Update stock levels
export const updateStock = async (productId, stockData) => {
    try {
        logger.info(`Updating stock for product: ${productId}...`);
        const response = await apiClient.put(
            `/inventory/stock/${productId}`,
            stockData
        );
        logger.info("Stock updated successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to update stock:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Get low stock items
export const getLowStock = async () => {
    try {
        logger.info("Fetching low stock items...");
        const response = await apiClient.get("/inventory/low-stock");
        logger.info("Low stock items fetched successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to fetch low stock items:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Batch update multiple products
export const batchUpdate = async (batchData) => {
    try {
        logger.info("Performing batch update...");
        const response = await apiClient.patch(
            "/inventory/batch-update",
            batchData
        );
        logger.info("Batch update completed successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to perform batch update:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Get near-expiry products
export const getNearExpiry = async () => {
    try {
        logger.info("Fetching near-expiry products...");
        const response = await apiClient.get("/inventory/near-expiry");
        logger.info("Near-expiry products fetched successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to fetch near-expiry products:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Get expired products
export const getExpired = async () => {
    try {
        logger.info("Fetching expired products...");
        const response = await apiClient.get("/inventory/expired");
        logger.info("Expired products fetched successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to fetch expired products:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Update product batches
export const updateBatches = async (productId, batchData) => {
    try {
        logger.info(`Updating batches for product: ${productId}...`);
        const response = await apiClient.patch(
            `/inventory/batches/${productId}`,
            batchData
        );
        logger.info("Product batches updated successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to update product batches:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};
