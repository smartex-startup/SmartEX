import Product from "../models/product.model.js";
import apiResponse from "../utils/response.util.js";
import logger from "../utils/logger.util.js";

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, category, brand, search } = req.query;

        const query = { isActive: true, isApproved: true };

        if (category) query.category = category;
        if (brand) query.brand = brand;
        if (search) {
            query.$text = { $search: search };
        }

        const products = await Product.find(query)
            .populate("category", "name slug")
            .populate("subCategory", "name slug")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(query);

        return apiResponse.success(
            res,
            "Products retrieved successfully",
            products,
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
        logger.error("Get all products error:", error.message);
        next(error);
    }
};

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("category", "name slug")
            .populate("subCategory", "name slug");

        if (!product) {
            return apiResponse.notFound(res, "Product not found");
        }

        return apiResponse.success(
            res,
            "Product retrieved successfully",
            product
        );
    } catch (error) {
        logger.error("Get product by ID error:", error.message);
        next(error);
    }
};

/**
 * @desc    Create product
 * @route   POST /api/products
 * @access  Private (Admin)
 */
const createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);

        logger.info(`Product created: ${product.name}`);

        return apiResponse.created(
            res,
            "Product created successfully",
            product
        );
    } catch (error) {
        logger.error("Create product error:", error.message);
        next(error);
    }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private (Admin)
 */
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return apiResponse.notFound(res, "Product not found");
        }

        logger.info(`Product updated: ${product.name}`);

        return apiResponse.success(
            res,
            "Product updated successfully",
            product
        );
    } catch (error) {
        logger.error("Update product error:", error.message);
        next(error);
    }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin)
 */
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return apiResponse.notFound(res, "Product not found");
        }

        logger.info(`Product deleted: ${product.name}`);

        return apiResponse.success(res, "Product deleted successfully");
    } catch (error) {
        logger.error("Delete product error:", error.message);
        next(error);
    }
};

/**
 * @desc    Search products
 * @route   GET /api/products/search
 * @access  Public
 */
const searchProducts = async (req, res, next) => {
    try {
        const { q, page = 1, limit = 20 } = req.query;

        if (!q) {
            return apiResponse.badRequest(res, "Search query is required");
        }

        const products = await Product.find({
            $text: { $search: q },
            isActive: true,
            isApproved: true,
        })
            .populate("category", "name slug")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ score: { $meta: "textScore" } });

        return apiResponse.success(
            res,
            "Search results retrieved successfully",
            products
        );
    } catch (error) {
        logger.error("Search products error:", error.message);
        next(error);
    }
};

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:categoryId
 * @access  Public
 */
const getProductsByCategory = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const products = await Product.find({
            $or: [
                { category: req.params.categoryId },
                { subCategory: req.params.categoryId },
            ],
            isActive: true,
            isApproved: true,
        })
            .populate("category", "name slug")
            .populate("subCategory", "name slug")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        return apiResponse.success(
            res,
            "Products retrieved successfully",
            products
        );
    } catch (error) {
        logger.error("Get products by category error:", error.message);
        next(error);
    }
};

export {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductsByCategory,
};
