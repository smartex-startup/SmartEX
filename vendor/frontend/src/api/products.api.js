import apiClient from "../utils/axios.js";
import logger from "../utils/logger.util.js";

// Get all products with pagination
export const getProducts = async (params = {}) => {
    try {
        logger.info("Fetching products...");
        const queryParams = new URLSearchParams(params).toString();
        const response = await apiClient.get(
            `/products${queryParams ? `?${queryParams}` : ""}`
        );
        logger.info("Products fetched successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to fetch products:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Get single product details
export const getProduct = async (productId) => {
    try {
        logger.info(`Fetching product: ${productId}...`);
        const response = await apiClient.get(`/products/${productId}`);
        logger.info("Product details fetched successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to fetch product details:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Search products
export const searchProducts = async (query, params = {}) => {
    try {
        logger.info(`Searching products with query: ${query}...`);
        const searchParams = new URLSearchParams({
            q: query,
            ...params,
        }).toString();
        const response = await apiClient.get(
            `/products/search?${searchParams}`
        );
        logger.info("Product search completed successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to search products:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Get all categories
export const getCategories = async () => {
    try {
        logger.info("Fetching product categories...");
        const response = await apiClient.get("/products/categories");
        logger.info("Categories fetched successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to fetch categories:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Get products by category
export const getProductsByCategory = async (categoryId, params = {}) => {
    try {
        logger.info(`Fetching products for category: ${categoryId}...`);
        const queryParams = new URLSearchParams(params).toString();
        const response = await apiClient.get(
            `/products/category/${categoryId}${
                queryParams ? `?${queryParams}` : ""
            }`
        );
        logger.info("Category products fetched successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to fetch category products:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};
