import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import logger from "../utils/logger.util.js";

// Fetch all products with pagination and sorting
const fetchProducts = async (options = {}) => {
    try {
        const {
            page = 1,
            limit = 20,
            sortBy = "name",
            sortOrder = "asc",
        } = options;

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

        // Only fetch active products that are approved
        const query = { isActive: true };

        const [products, totalProducts] = await Promise.all([
            Product.find(query)
                .populate("category", "name slug")
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query),
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        logger.info(
            `Retrieved ${products.length} products (page ${page}/${totalPages})`
        );

        return {
            products,
            pagination: {
                currentPage: page,
                totalPages,
                totalProducts,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error) {
        logger.error("Fetch products error:", error.message);
        throw error;
    }
};

// Fetch single product by ID
const fetchSingleProduct = async (productId) => {
    try {
        const product = await Product.findOne({
            _id: productId,
            isActive: true,
        }).populate("category", "name slug description");

        if (!product) {
            throw new Error("Product not found");
        }

        logger.info(`Retrieved product: ${product.name}`);
        return product;
    } catch (error) {
        logger.error("Fetch single product error:", error.message);
        throw error;
    }
};

// Search products by query
const searchProductCatalog = async (options = {}) => {
    try {
        const { query, category, page = 1, limit = 20 } = options;

        const skip = (page - 1) * limit;

        // Build search query
        const searchQuery = {
            isActive: true,
            $or: [
                { name: { $regex: query, $options: "i" } },
                { brand: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
            ],
        };

        // Add category filter if provided
        if (category) {
            searchQuery.category = category;
        }

        const [products, totalProducts] = await Promise.all([
            Product.find(searchQuery)
                .populate("category", "name slug")
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(searchQuery),
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        logger.info(`Search "${query}" found ${totalProducts} products`);

        return {
            products,
            searchQuery: query,
            pagination: {
                currentPage: page,
                totalPages,
                totalProducts,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error) {
        logger.error("Search products error:", error.message);
        throw error;
    }
};

// Fetch products by category
const fetchProductsByCategory = async (categoryId, options = {}) => {
    try {
        const {
            page = 1,
            limit = 20,
            sortBy = "name",
            sortOrder = "asc",
        } = options;

        // Check if category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new Error("Category not found");
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

        const query = {
            category: categoryId,
            isActive: true,
        };

        const [products, totalProducts] = await Promise.all([
            Product.find(query)
                .populate("category", "name slug")
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query),
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        logger.info(
            `Retrieved ${products.length} products for category: ${category.name}`
        );

        return {
            products,
            category: {
                id: category._id,
                name: category.name,
                slug: category.slug,
            },
            pagination: {
                currentPage: page,
                totalPages,
                totalProducts,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error) {
        logger.error("Fetch products by category error:", error.message);
        throw error;
    }
};

// Fetch all categories
const fetchAllCategories = async () => {
    try {
        const categories = await Category.find({ isActive: true })
            .select("name slug description")
            .sort({ name: 1 })
            .lean();

        logger.info(`Retrieved ${categories.length} categories`);
        return categories;
    } catch (error) {
        logger.error("Fetch categories error:", error.message);
        throw error;
    }
};

export {
    fetchProducts,
    fetchSingleProduct,
    searchProductCatalog,
    fetchProductsByCategory,
    fetchAllCategories,
};
