import {
    fetchProducts,
    fetchSingleProduct,
    searchProductCatalog,
    fetchProductsByCategory,
    fetchAllCategories,
} from "../services/product.service.js";
import apiResponse from "../utils/response.util.js";
import logger from "../utils/logger.util.js";

// Get all products (for vendor to browse and add to inventory)
const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            sortBy = "name",
            sortOrder = "asc",
        } = req.query;

        logger.info(`Fetching products for vendor ${req.user.id}`);

        const result = await fetchProducts({
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            sortOrder,
        });

        return apiResponse.success(
            res,
            "Products retrieved successfully",
            result
        );
    } catch (error) {
        logger.error("Get products controller error:", error.message);
        return apiResponse.serverError(res, "Failed to retrieve products");
    }
};

// Get single product details
const getProduct = async (req, res) => {
    try {
        const { id } = req.params;

        logger.info(`Fetching product ${id} for vendor ${req.user.id}`);

        const product = await fetchSingleProduct(id);

        return apiResponse.success(
            res,
            "Product retrieved successfully",
            product
        );
    } catch (error) {
        logger.error("Get product controller error:", error.message);

        if (error.message === "Product not found") {
            return apiResponse.notFound(res, "Product not found");
        }

        return apiResponse.serverError(res, "Failed to retrieve product");
    }
};

// Search products by name, brand, or description
const searchProducts = async (req, res) => {
    try {
        const { q, category, page = 1, limit = 20 } = req.query;

        if (!q || q.trim().length < 2) {
            return apiResponse.badRequest(
                res,
                "Search query must be at least 2 characters"
            );
        }

        logger.info(
            `Searching products with query "${q}" for vendor ${req.user.id}`
        );

        const result = await searchProductCatalog({
            query: q.trim(),
            category,
            page: parseInt(page),
            limit: parseInt(limit),
        });

        return apiResponse.success(
            res,
            "Search results retrieved successfully",
            result
        );
    } catch (error) {
        logger.error("Search products controller error:", error.message);
        return apiResponse.serverError(res, "Failed to search products");
    }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const {
            page = 1,
            limit = 20,
            sortBy = "name",
            sortOrder = "asc",
        } = req.query;

        logger.info(
            `Fetching products for category ${categoryId} for vendor ${req.user.id}`
        );

        const result = await fetchProductsByCategory(categoryId, {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            sortOrder,
        });

        return apiResponse.success(
            res,
            "Category products retrieved successfully",
            result
        );
    } catch (error) {
        logger.error(
            "Get products by category controller error:",
            error.message
        );

        if (error.message === "Category not found") {
            return apiResponse.notFound(res, "Category not found");
        }

        return apiResponse.serverError(
            res,
            "Failed to retrieve category products"
        );
    }
};

// Get all categories (for filtering)
const getCategories = async (req, res) => {
    try {
        logger.info(`Fetching categories for vendor ${req.user.id}`);

        const categories = await fetchAllCategories();

        return apiResponse.success(
            res,
            "Categories retrieved successfully",
            categories
        );
    } catch (error) {
        logger.error("Get categories controller error:", error.message);
        return apiResponse.serverError(res, "Failed to retrieve categories");
    }
};

export {
    getProducts,
    getProduct,
    searchProducts,
    getProductsByCategory,
    getCategories,
};
