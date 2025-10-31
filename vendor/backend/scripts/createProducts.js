import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import logger from "../utils/logger.util.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info("MongoDB Connected for seeding products");
    } catch (error) {
        logger.error("Database connection error:", error.message);
        process.exit(1);
    }
};

// Sample categories and products
const categoriesData = [
    {
        name: "Dairy & Eggs",
        slug: "dairy-eggs",
        description: "Fresh dairy products and eggs",
        isActive: true,
    },
    {
        name: "Fruits & Vegetables",
        slug: "fruits-vegetables",
        description: "Fresh fruits and vegetables",
        isActive: true,
    },
    {
        name: "Packaged Foods",
        slug: "packaged-foods",
        description: "Packaged and processed foods",
        isActive: true,
    },
];

const productsData = [
    {
        name: "Amul Fresh Milk",
        brand: "Amul",
        description: "Fresh full cream milk 1 liter pack",
        basePrice: 60,
        images: [
            {
                url: "https://example.com/amul-milk.jpg",
                altText: "Amul Fresh Milk 1L",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 1000,
                unit: "ml",
            },
            dimensions: {
                length: 10,
                width: 6,
                height: 20,
                unit: "cm",
            },
            ingredients: "Fresh Cow Milk",
            nutritionalInfo: {
                calories: 150,
                protein: 8,
                fat: 8,
                carbohydrates: 12,
            },
        },
        isActive: true,
    },
    {
        name: "Fresh Bananas",
        brand: "Local Farm",
        description: "Fresh ripe bananas per dozen",
        basePrice: 50,
        images: [
            {
                url: "https://example.com/bananas.jpg",
                altText: "Fresh Bananas",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 1000,
                unit: "g",
            },
            ingredients: "Fresh Bananas",
            nutritionalInfo: {
                calories: 105,
                protein: 1,
                fat: 0.3,
                carbohydrates: 27,
            },
        },
        isActive: true,
    },
    {
        name: "Maggi Noodles",
        brand: "Maggi",
        description: "Instant noodles masala flavor 70g pack",
        basePrice: 15,
        images: [
            {
                url: "https://example.com/maggi.jpg",
                altText: "Maggi Instant Noodles",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 70,
                unit: "g",
            },
            dimensions: {
                length: 15,
                width: 10,
                height: 3,
                unit: "cm",
            },
            ingredients: "Wheat Flour, Palm Oil, Salt, Spices",
            nutritionalInfo: {
                calories: 310,
                protein: 9,
                fat: 12,
                carbohydrates: 46,
            },
        },
        isActive: true,
    },
    {
        name: "Britannia Bread",
        brand: "Britannia",
        description: "Fresh white bread loaf 400g",
        basePrice: 25,
        images: [
            {
                url: "https://example.com/bread.jpg",
                altText: "Britannia White Bread",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 400,
                unit: "g",
            },
            ingredients: "Wheat Flour, Water, Sugar, Salt, Yeast",
            nutritionalInfo: {
                calories: 265,
                protein: 9,
                fat: 3,
                carbohydrates: 50,
            },
        },
        isActive: true,
    },
];

// Create products function
const createProducts = async () => {
    try {
        logger.info("Starting product creation...");

        // Create categories first
        const categories = [];
        for (const categoryData of categoriesData) {
            let category = await Category.findOne({ name: categoryData.name });
            if (!category) {
                category = await Category.create(categoryData);
                logger.info(`Created category: ${category.name}`);
            }
            categories.push(category);
        }

        // Create products
        for (let i = 0; i < productsData.length; i++) {
            const productData = productsData[i];

            // Check if product already exists
            const existingProduct = await Product.findOne({
                name: productData.name,
                brand: productData.brand,
            });

            if (existingProduct) {
                logger.info(
                    `Product ${productData.name} already exists, skipping...`
                );
                continue;
            }

            // Assign category
            productData.category =
                categories[Math.min(i, categories.length - 1)]._id;

            const product = await Product.create(productData);
            logger.info(`Created product: ${product.name} by ${product.brand}`);
        }

        logger.info("All products created successfully!");
        logger.info("Available Products:");

        const allProducts = await Product.find().populate("category", "name");
        allProducts.forEach((product) => {
            logger.info(
                `- ${product.name} (${product.brand}) - Category: ${product.category.name}`
            );
        });
    } catch (error) {
        logger.error("Error creating products:", error.message);
    } finally {
        mongoose.connection.close();
        logger.info("Database connection closed");
    }
};

// Run the script
const run = async () => {
    await connectDB();
    await createProducts();
};

run();
