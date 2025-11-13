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
        name: "Packaged Foods",
        slug: "packaged-foods",
        description: "Packaged and processed foods",
        isActive: true,
    },
    {
        name: "Fruits & Vegetables",
        slug: "fruits-vegetables",
        description: "Fresh fruits and vegetables",
        isActive: true,
    },
    {
        name: "Beverages",
        slug: "beverages",
        description: "Soft drinks, juices, and beverages",
        isActive: true,
    },
    {
        name: "Snacks & Confectionery",
        slug: "snacks-confectionery",
        description: "Chips, chocolates, and snacks",
        isActive: true,
    },
    {
        name: "Personal Care",
        slug: "personal-care",
        description: "Personal hygiene and care products",
        isActive: true,
    },
    {
        name: "Household Items",
        slug: "household-items",
        description: "Cleaning supplies and household essentials",
        isActive: true,
    },
    {
        name: "Electronics",
        slug: "electronics",
        description: "Electronic accessories and gadgets",
        isActive: true,
    },
];

const productsData = [
    // Dairy & Eggs

    {
        name: "Farm Fresh Eggs",
        description: "Free range eggs pack of 12",
        brand: "Mother Dairy",
        category: "dairy-eggs",
        basePrice: 80,
        images: [
            {
                url: "https://example.com/eggs.jpg",
                altText: "Farm Fresh Eggs",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 12,
                unit: "pieces",
            },
            nutritionalInfo: {
                calories: 70,
                protein: 6,
                fat: 5,
            },
            allergens: ["eggs"],
        },
        barcodes: [
            {
                code: "8901030002345",
                type: "EAN",
            },
        ],
        hsn: "0407",
        tags: ["eggs", "fresh", "free-range"],
        seo: {
            keywords: ["eggs", "fresh", "organic"],
        },
    },

    // Fruits & Vegetables
    {
        name: "Red Apples",
        description: "Fresh red apples from Kashmir",
        brand: "Fresh Valley",
        category: "fruits-vegetables",
        basePrice: 120,
        images: [
            {
                url: "https://example.com/red-apples.jpg",
                altText: "Red Apples",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 1,
                unit: "kg",
            },
            ingredients: "Fresh Red Apples",
            nutritionalInfo: {
                calories: 52,
                carbohydrates: 14,
                fiber: 2,
            },
            storageInstructions: "Store in refrigerator for best freshness",
        },
        barcodes: [
            {
                code: "8901030003456",
                type: "EAN",
            },
        ],
        hsn: "0808",
        tags: ["apples", "fresh", "fruit", "kashmir"],
        seo: {
            keywords: ["apples", "fruit", "fresh"],
        },
    },
    {
        name: "Organic Carrots",
        description: "Fresh organic carrots 500g pack",
        brand: "Green Harvest",
        category: "fruits-vegetables",
        basePrice: 40,
        images: [
            {
                url: "https://example.com/carrots.jpg",
                altText: "Organic Carrots",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 500,
                unit: "g",
            },
            nutritionalInfo: {
                calories: 41,
                carbohydrates: 10,
                fiber: 3,
            },
        },
        barcodes: [
            {
                code: "8901030004567",
                type: "EAN",
            },
        ],
        hsn: "0706",
        tags: ["carrots", "organic", "vegetables"],
        seo: {
            keywords: ["carrots", "organic", "vegetables"],
        },
    },

    // Beverages
    {
        name: "Coca Cola",
        description: "Refreshing cola drink 1 liter bottle",
        brand: "Coca Cola",
        category: "beverages",
        basePrice: 45,
        images: [
            {
                url: "https://example.com/coke.jpg",
                altText: "Coca Cola 1L",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 1,
                unit: "l",
            },
            dimensions: {
                length: 8,
                width: 8,
                height: 25,
                unit: "cm",
            },
            nutritionalInfo: {
                calories: 140,
                carbohydrates: 39,
                sugar: 39,
                sodium: 45,
            },
        },
        barcodes: [
            {
                code: "8901030005678",
                type: "EAN",
            },
        ],
        hsn: "2202",
        tags: ["cola", "soft-drink", "beverage"],
        seo: {
            keywords: ["cola", "drink", "coca-cola"],
        },
    },
    {
        name: "Mineral Water",
        description: "Pure mineral water 1 liter bottle",
        brand: "Bisleri",
        category: "beverages",
        basePrice: 20,
        images: [
            {
                url: "https://example.com/water.jpg",
                altText: "Bisleri Water",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 1,
                unit: "l",
            },
            ingredients: "Pure Mineral Water",
        },
        barcodes: [
            {
                code: "8901030006789",
                type: "EAN",
            },
        ],
        hsn: "2201",
        tags: ["water", "mineral", "pure"],
        seo: {
            keywords: ["water", "mineral", "bisleri"],
        },
    },

    // Snacks & Confectionery
    {
        name: "Lay's Classic Chips",
        description: "Crispy potato chips classic flavor",
        brand: "Lay's",
        category: "snacks-confectionery",
        basePrice: 20,
        images: [
            {
                url: "https://example.com/lays.jpg",
                altText: "Lay's Chips",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 50,
                unit: "g",
            },
            nutritionalInfo: {
                calories: 536,
                protein: 6,
                carbohydrates: 50,
                fat: 35,
            },
            ingredients: "Potato, Vegetable Oil, Salt",
            allergens: [],
        },
        barcodes: [
            {
                code: "8901030007890",
                type: "EAN",
            },
        ],
        hsn: "2005",
        tags: ["chips", "snacks", "potato"],
        seo: {
            keywords: ["chips", "snacks", "lays"],
        },
    },
    {
        name: "Oreo Cookies",
        description: "Chocolate sandwich cookies original flavor",
        brand: "Oreo",
        category: "snacks-confectionery",
        basePrice: 30,
        images: [
            {
                url: "https://example.com/oreo.jpg",
                altText: "Oreo Cookies",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 120,
                unit: "g",
            },
            nutritionalInfo: {
                calories: 480,
                protein: 6,
                carbohydrates: 72,
                fat: 19,
                sugar: 33,
            },
            allergens: ["gluten", "dairy", "soy"],
        },
        barcodes: [
            {
                code: "8901030008901",
                type: "EAN",
            },
        ],
        hsn: "1905",
        tags: ["cookies", "chocolate", "biscuits"],
        seo: {
            keywords: ["cookies", "oreo", "chocolate"],
        },
    },

    // Personal Care
    {
        name: "Head & Shoulders Shampoo",
        description: "Anti-dandruff shampoo 400ml bottle",
        brand: "Head & Shoulders",
        category: "personal-care",
        basePrice: 180,
        images: [
            {
                url: "https://example.com/shampoo.jpg",
                altText: "Head & Shoulders Shampoo",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 400,
                unit: "ml",
            },
            dimensions: {
                length: 6,
                width: 6,
                height: 20,
                unit: "cm",
            },
            storageInstructions: "Store in cool, dry place",
        },
        barcodes: [
            {
                code: "8901030009012",
                type: "EAN",
            },
        ],
        hsn: "3305",
        tags: ["shampoo", "hair-care", "anti-dandruff"],
        seo: {
            keywords: ["shampoo", "hair", "dandruff"],
        },
    },
    {
        name: "Colgate Toothpaste",
        description: "Total advanced health toothpaste 150g",
        brand: "Colgate",
        category: "personal-care",
        basePrice: 85,
        images: [
            {
                url: "https://example.com/colgate.jpg",
                altText: "Colgate Toothpaste",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 150,
                unit: "g",
            },
            storageInstructions: "Keep away from children under 6 years",
        },
        barcodes: [
            {
                code: "8901030010123",
                type: "EAN",
            },
        ],
        hsn: "3306",
        tags: ["toothpaste", "dental", "hygiene"],
        seo: {
            keywords: ["toothpaste", "dental", "colgate"],
        },
    },

    // Household Items
    {
        name: "Surf Excel Detergent",
        description: "Matic front load washing powder 1kg",
        brand: "Surf Excel",
        category: "household-items",
        basePrice: 220,
        images: [
            {
                url: "https://example.com/surf.jpg",
                altText: "Surf Excel Detergent",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 1,
                unit: "kg",
            },
            storageInstructions: "Store in dry place away from moisture",
        },
        barcodes: [
            {
                code: "8901030011234",
                type: "EAN",
            },
        ],
        hsn: "3402",
        tags: ["detergent", "washing", "powder"],
        seo: {
            keywords: ["detergent", "washing", "surf"],
        },
    },
    {
        name: "Vim Dishwash Gel",
        description: "Lemon dishwash gel 500ml bottle",
        brand: "Vim",
        category: "household-items",
        basePrice: 65,
        images: [
            {
                url: "https://example.com/vim.jpg",
                altText: "Vim Dishwash",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 500,
                unit: "ml",
            },
            storageInstructions: "Keep away from children",
        },
        barcodes: [
            {
                code: "8901030012345",
                type: "EAN",
            },
        ],
        hsn: "3402",
        tags: ["dishwash", "cleaning", "lemon"],
        seo: {
            keywords: ["dishwash", "vim", "cleaning"],
        },
    },

    // Electronics
    {
        name: "Samsung Galaxy Earbuds",
        description: "Wireless bluetooth earbuds with charging case",
        brand: "Samsung",
        category: "electronics",
        basePrice: 8999,
        images: [
            {
                url: "https://example.com/earbuds.jpg",
                altText: "Samsung Earbuds",
                isPrimary: true,
            },
        ],
        specifications: {
            dimensions: {
                length: 5,
                width: 2,
                height: 2,
                unit: "cm",
            },
            storageInstructions: "Store in charging case when not in use",
        },
        barcodes: [
            {
                code: "8901030013456",
                type: "EAN",
            },
        ],
        hsn: "8518",
        tags: ["earbuds", "wireless", "bluetooth", "audio"],
        seo: {
            keywords: ["earbuds", "wireless", "samsung"],
        },
    },
    {
        name: "Power Bank 10000mAh",
        description: "Portable power bank with fast charging",
        brand: "Mi",
        category: "electronics",
        basePrice: 1499,
        images: [
            {
                url: "https://example.com/powerbank.jpg",
                altText: "Mi Power Bank",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 250,
                unit: "g",
            },
            dimensions: {
                length: 15,
                width: 7,
                height: 2,
                unit: "cm",
            },
        },
        barcodes: [
            {
                code: "8901030014567",
                type: "EAN",
            },
        ],
        hsn: "8507",
        tags: ["powerbank", "charging", "portable", "battery"],
        seo: {
            keywords: ["powerbank", "mi", "charging"],
        },
    },

    // Additional Dairy & Eggs Products
    {
        name: "Paneer Cubes",
        description: "Fresh cottage cheese cubes 200g pack",
        brand: "Amul",
        category: "dairy-eggs",
        basePrice: 90,
        images: [
            {
                url: "https://example.com/paneer.jpg",
                altText: "Fresh Paneer",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 200,
                unit: "g",
            },
            nutritionalInfo: {
                calories: 265,
                protein: 18,
                fat: 20,
                carbohydrates: 1,
            },
            allergens: ["dairy"],
            storageInstructions: "Refrigerate and consume within 3 days",
        },
        barcodes: [
            {
                code: "8901030015678",
                type: "EAN",
            },
        ],
        hsn: "0406",
        tags: ["paneer", "cottage cheese", "dairy", "protein"],
        seo: {
            keywords: ["paneer", "cottage cheese", "dairy"],
        },
    },
    {
        name: "Greek Yogurt",
        description: "Thick and creamy Greek yogurt 400g",
        brand: "Epigamia",
        category: "dairy-eggs",
        basePrice: 120,
        images: [
            {
                url: "https://example.com/greek-yogurt.jpg",
                altText: "Greek Yogurt",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 400,
                unit: "g",
            },
            nutritionalInfo: {
                calories: 59,
                protein: 10,
                fat: 0,
                carbohydrates: 4,
            },
            allergens: ["dairy"],
        },
        barcodes: [
            {
                code: "8901030016789",
                type: "EAN",
            },
        ],
        hsn: "0403",
        tags: ["yogurt", "greek", "protein", "healthy"],
        seo: {
            keywords: ["greek yogurt", "protein", "healthy"],
        },
    },
    {
        name: "Butter Salted",
        description: "Premium salted butter 100g pack",
        brand: "Amul",
        category: "dairy-eggs",
        basePrice: 55,
        images: [
            {
                url: "https://example.com/butter.jpg",
                altText: "Amul Butter",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 100,
                unit: "g",
            },
            nutritionalInfo: {
                calories: 717,
                protein: 1,
                fat: 81,
                carbohydrates: 1,
            },
            allergens: ["dairy"],
        },
        barcodes: [
            {
                code: "8901030017890",
                type: "EAN",
            },
        ],
        hsn: "0405",
        tags: ["butter", "salted", "dairy", "cooking"],
        seo: {
            keywords: ["butter", "amul", "salted"],
        },
    },

    // Additional Fruits & Vegetables
    {
        name: "Fresh Tomatoes",
        description: "Ripe red tomatoes 1kg pack",
        brand: "Local Farm",
        category: "fruits-vegetables",
        basePrice: 45,
        images: [
            {
                url: "https://example.com/tomatoes.jpg",
                altText: "Fresh Tomatoes",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 1,
                unit: "kg",
            },
            nutritionalInfo: {
                calories: 18,
                carbohydrates: 4,
                fiber: 1,
            },
        },
        barcodes: [
            {
                code: "8901030019012",
                type: "EAN",
            },
        ],
        hsn: "0702",
        tags: ["tomatoes", "vegetables", "fresh", "red"],
        seo: {
            keywords: ["tomatoes", "vegetables", "fresh"],
        },
    },
    {
        name: "Green Capsicum",
        description: "Fresh green bell peppers 500g pack",
        brand: "Green Harvest",
        category: "fruits-vegetables",
        basePrice: 80,
        images: [
            {
                url: "https://example.com/capsicum.jpg",
                altText: "Green Capsicum",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 500,
                unit: "g",
            },
            nutritionalInfo: {
                calories: 20,
                carbohydrates: 5,
                fiber: 2,
            },
        },
        barcodes: [
            {
                code: "8901030020123",
                type: "EAN",
            },
        ],
        hsn: "0709",
        tags: ["capsicum", "bell pepper", "vegetables", "green"],
        seo: {
            keywords: ["capsicum", "bell pepper", "vegetables"],
        },
    },
    {
        name: "Fresh Oranges",
        description: "Sweet juicy oranges 1kg pack",
        brand: "Citrus Fresh",
        category: "fruits-vegetables",
        basePrice: 100,
        images: [
            {
                url: "https://example.com/oranges.jpg",
                altText: "Fresh Oranges",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 1,
                unit: "kg",
            },
            nutritionalInfo: {
                calories: 47,
                carbohydrates: 12,
                fiber: 2,
                vitamin_c: 53,
            },
        },
        barcodes: [
            {
                code: "8901030021234",
                type: "EAN",
            },
        ],
        hsn: "0805",
        tags: ["oranges", "citrus", "fruit", "vitamin-c"],
        seo: {
            keywords: ["oranges", "citrus", "fresh"],
        },
    },

    // Additional Beverages
    {
        name: "Fresh Orange Juice",
        description: "100% fresh orange juice 1 liter pack",
        brand: "Real",
        category: "beverages",
        basePrice: 85,
        images: [
            {
                url: "https://example.com/orange-juice.jpg",
                altText: "Fresh Orange Juice",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 1,
                unit: "l",
            },
            ingredients: "100% Orange Juice, Vitamin C",
            nutritionalInfo: {
                calories: 112,
                carbohydrates: 26,
                sugar: 21,
            },
        },
        barcodes: [
            {
                code: "8901030022345",
                type: "EAN",
            },
        ],
        hsn: "2009",
        tags: ["juice", "orange", "fresh", "vitamin-c"],
        seo: {
            keywords: ["orange juice", "fresh", "real"],
        },
    },
    {
        name: "Green Tea",
        description: "Premium green tea bags pack of 25",
        brand: "Lipton",
        category: "beverages",
        basePrice: 95,
        images: [
            {
                url: "https://example.com/green-tea.jpg",
                altText: "Lipton Green Tea",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 25,
                unit: "pieces",
            },
            ingredients: "Green Tea Leaves",
        },
        barcodes: [
            {
                code: "8901030023456",
                type: "EAN",
            },
        ],
        hsn: "0902",
        tags: ["tea", "green", "antioxidants", "healthy"],
        seo: {
            keywords: ["green tea", "lipton", "healthy"],
        },
    },
    {
        name: "Energy Drink",
        description: "Red Bull energy drink 250ml can",
        brand: "Red Bull",
        category: "beverages",
        basePrice: 125,
        images: [
            {
                url: "https://example.com/energy-drink.jpg",
                altText: "Red Bull Energy Drink",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 250,
                unit: "ml",
            },
            nutritionalInfo: {
                calories: 110,
                carbohydrates: 27,
                sugar: 27,
                caffeine: 80,
            },
        },
        barcodes: [
            {
                code: "8901030024567",
                type: "EAN",
            },
        ],
        hsn: "2202",
        tags: ["energy drink", "caffeine", "boost"],
        seo: {
            keywords: ["energy drink", "red bull", "caffeine"],
        },
    },

    // Additional Snacks & Confectionery
    {
        name: "Kurkure Masala Munch",
        description: "Spicy masala flavored puffed snacks",
        brand: "Kurkure",
        category: "snacks-confectionery",
        basePrice: 15,
        images: [
            {
                url: "https://example.com/kurkure.jpg",
                altText: "Kurkure Masala",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 85,
                unit: "g",
            },
            nutritionalInfo: {
                calories: 450,
                protein: 8,
                carbohydrates: 58,
                fat: 21,
            },
            ingredients: "Corn, Edible Vegetable Oil, Spices",
        },
        barcodes: [
            {
                code: "8901030025678",
                type: "EAN",
            },
        ],
        hsn: "1905",
        tags: ["snacks", "spicy", "masala", "puffed"],
        seo: {
            keywords: ["kurkure", "masala", "snacks"],
        },
    },
    {
        name: "Dairy Milk Chocolate",
        description: "Smooth milk chocolate bar 38g",
        brand: "Cadbury",
        category: "snacks-confectionery",
        basePrice: 25,
        images: [
            {
                url: "https://example.com/dairy-milk.jpg",
                altText: "Dairy Milk Chocolate",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 38,
                unit: "g",
            },
            nutritionalInfo: {
                calories: 534,
                protein: 7,
                carbohydrates: 57,
                fat: 30,
                sugar: 56,
            },
            allergens: ["dairy", "nuts"],
        },
        barcodes: [
            {
                code: "8901030026789",
                type: "EAN",
            },
        ],
        hsn: "1806",
        tags: ["chocolate", "milk", "sweet", "cadbury"],
        seo: {
            keywords: ["chocolate", "dairy milk", "cadbury"],
        },
    },
    {
        name: "Parle-G Biscuits",
        description: "Glucose biscuits family pack 200g",
        brand: "Parle",
        category: "snacks-confectionery",
        basePrice: 20,
        images: [
            {
                url: "https://example.com/parle-g.jpg",
                altText: "Parle-G Biscuits",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 200,
                unit: "g",
            },
            nutritionalInfo: {
                calories: 454,
                protein: 8,
                carbohydrates: 76,
                fat: 13,
            },
            allergens: ["gluten", "dairy"],
        },
        barcodes: [
            {
                code: "8901030028901",
                type: "EAN",
            },
        ],
        hsn: "1905",
        tags: ["biscuits", "glucose", "family pack"],
        seo: {
            keywords: ["parle-g", "biscuits", "glucose"],
        },
    },

    // Additional Personal Care
    {
        name: "Dove Beauty Soap",
        description: "Moisturizing beauty bar with 1/4 moisturizing cream",
        brand: "Dove",
        category: "personal-care",
        basePrice: 40,
        images: [
            {
                url: "https://example.com/dove-soap.jpg",
                altText: "Dove Beauty Soap",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 75,
                unit: "g",
            },
        },
        barcodes: [
            {
                code: "8901030029012",
                type: "EAN",
            },
        ],
        hsn: "3401",
        tags: ["soap", "beauty", "moisturizing"],
        seo: {
            keywords: ["soap", "dove", "beauty"],
        },
    },
    {
        name: "Johnson's Baby Powder",
        description: "Gentle baby powder with talc 200g",
        brand: "Johnson's",
        category: "personal-care",
        basePrice: 120,
        images: [
            {
                url: "https://example.com/baby-powder.jpg",
                altText: "Johnson's Baby Powder",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 200,
                unit: "g",
            },
            storageInstructions: "Keep away from eyes and respiratory tract",
        },
        barcodes: [
            {
                code: "8901030030123",
                type: "EAN",
            },
        ],
        hsn: "3304",
        tags: ["powder", "baby", "gentle", "talc"],
        seo: {
            keywords: ["baby powder", "johnson's", "gentle"],
        },
    },
    {
        name: "Nivea Face Cream",
        description: "Daily moisturizing face cream 50ml",
        brand: "Nivea",
        category: "personal-care",
        basePrice: 180,
        images: [
            {
                url: "https://example.com/nivea-cream.jpg",
                altText: "Nivea Face Cream",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 50,
                unit: "ml",
            },
            storageInstructions: "Store in cool, dry place",
        },
        barcodes: [
            {
                code: "8901030031234",
                type: "EAN",
            },
        ],
        hsn: "3304",
        tags: ["face cream", "moisturizing", "skincare"],
        seo: {
            keywords: ["nivea", "face cream", "moisturizing"],
        },
    },

    // Additional Household Items
    {
        name: "Lizol Floor Cleaner",
        description: "Disinfectant floor cleaner citrus 500ml",
        brand: "Lizol",
        category: "household-items",
        basePrice: 80,
        images: [
            {
                url: "https://example.com/lizol.jpg",
                altText: "Lizol Floor Cleaner",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 500,
                unit: "ml",
            },
            storageInstructions: "Keep away from children and food",
        },
        barcodes: [
            {
                code: "8901030032345",
                type: "EAN",
            },
        ],
        hsn: "3402",
        tags: ["floor cleaner", "disinfectant", "citrus"],
        seo: {
            keywords: ["floor cleaner", "lizol", "disinfectant"],
        },
    },
    {
        name: "Colin Glass Cleaner",
        description: "Streak-free glass cleaner 500ml spray",
        brand: "Colin",
        category: "household-items",
        basePrice: 90,
        images: [
            {
                url: "https://example.com/colin.jpg",
                altText: "Colin Glass Cleaner",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 500,
                unit: "ml",
            },
        },
        barcodes: [
            {
                code: "8901030033456",
                type: "EAN",
            },
        ],
        hsn: "3402",
        tags: ["glass cleaner", "spray", "streak-free"],
        seo: {
            keywords: ["glass cleaner", "colin", "spray"],
        },
    },
    {
        name: "Harpic Toilet Cleaner",
        description: "Powerful toilet cleaner 500ml",
        brand: "Harpic",
        category: "household-items",
        basePrice: 85,
        images: [
            {
                url: "https://example.com/harpic.jpg",
                altText: "Harpic Toilet Cleaner",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 500,
                unit: "ml",
            },
            storageInstructions: "Keep away from children",
        },
        barcodes: [
            {
                code: "8901030034567",
                type: "EAN",
            },
        ],
        hsn: "3402",
        tags: ["toilet cleaner", "disinfectant", "powerful"],
        seo: {
            keywords: ["toilet cleaner", "harpic", "disinfectant"],
        },
    },

    // Additional Electronics
    {
        name: "USB Data Cable",
        description: "Type-C to Type-A USB cable 1.5 meter",
        brand: "Boat",
        category: "electronics",
        basePrice: 299,
        images: [
            {
                url: "https://example.com/usb-cable.jpg",
                altText: "USB Cable",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 50,
                unit: "g",
            },
            dimensions: {
                length: 150,
                width: 1,
                height: 1,
                unit: "cm",
            },
        },
        barcodes: [
            {
                code: "8901030035678",
                type: "EAN",
            },
        ],
        hsn: "8544",
        tags: ["cable", "usb", "type-c", "charging"],
        seo: {
            keywords: ["usb cable", "type-c", "boat"],
        },
    },
    {
        name: "Bluetooth Speaker",
        description: "Portable wireless speaker with bass boost",
        brand: "JBL",
        category: "electronics",
        basePrice: 2999,
        images: [
            {
                url: "https://example.com/speaker.jpg",
                altText: "JBL Speaker",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 400,
                unit: "g",
            },
            dimensions: {
                length: 12,
                width: 8,
                height: 5,
                unit: "cm",
            },
        },
        barcodes: [
            {
                code: "8901030036789",
                type: "EAN",
            },
        ],
        hsn: "8518",
        tags: ["speaker", "bluetooth", "portable", "bass"],
        seo: {
            keywords: ["bluetooth speaker", "jbl", "portable"],
        },
    },
    {
        name: "Phone Charger",
        description: "Fast charging adapter 25W with cable",
        brand: "Samsung",
        category: "electronics",
        basePrice: 799,
        images: [
            {
                url: "https://example.com/charger.jpg",
                altText: "Phone Charger",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 120,
                unit: "g",
            },
            dimensions: {
                length: 8,
                width: 5,
                height: 3,
                unit: "cm",
            },
        },
        barcodes: [
            {
                code: "8901030037890",
                type: "EAN",
            },
        ],
        hsn: "8504",
        tags: ["charger", "fast charging", "adapter"],
        seo: {
            keywords: ["phone charger", "samsung", "fast"],
        },
    },

    // Additional Mixed Categories
    {
        name: "Basmati Rice",
        description: "Premium long grain basmati rice 1kg",
        brand: "India Gate",
        category: "packaged-foods",
        basePrice: 180,
        images: [
            {
                url: "https://example.com/basmati-rice.jpg",
                altText: "Basmati Rice",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 1,
                unit: "kg",
            },
            nutritionalInfo: {
                calories: 345,
                protein: 8,
                carbohydrates: 78,
                fat: 1,
            },
        },
        barcodes: [
            {
                code: "8901030038901",
                type: "EAN",
            },
        ],
        hsn: "1006",
        tags: ["rice", "basmati", "long grain", "premium"],
        seo: {
            keywords: ["basmati rice", "india gate", "premium"],
        },
    },
    {
        name: "Toor Dal",
        description: "Yellow pigeon peas 1kg pack",
        brand: "Fortune",
        category: "packaged-foods",
        basePrice: 140,
        images: [
            {
                url: "https://example.com/toor-dal.jpg",
                altText: "Toor Dal",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 1,
                unit: "kg",
            },
            nutritionalInfo: {
                calories: 335,
                protein: 22,
                carbohydrates: 62,
                fat: 2,
            },
        },
        barcodes: [
            {
                code: "8901030039012",
                type: "EAN",
            },
        ],
        hsn: "0713",
        tags: ["dal", "toor", "pulses", "protein"],
        seo: {
            keywords: ["toor dal", "pulses", "fortune"],
        },
    },
    {
        name: "Sunflower Oil",
        description: "Refined sunflower cooking oil 1 liter",
        brand: "Fortune",
        category: "packaged-foods",
        basePrice: 120,
        images: [
            {
                url: "https://example.com/sunflower-oil.jpg",
                altText: "Sunflower Oil",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 1,
                unit: "l",
            },
            nutritionalInfo: {
                calories: 884,
                fat: 100,
            },
        },
        barcodes: [
            {
                code: "8901030040123",
                type: "EAN",
            },
        ],
        hsn: "1512",
        tags: ["oil", "sunflower", "cooking", "refined"],
        seo: {
            keywords: ["sunflower oil", "cooking oil", "fortune"],
        },
    },
    {
        name: "Atta Wheat Flour",
        description: "Whole wheat flour 5kg pack",
        brand: "Aashirvaad",
        category: "packaged-foods",
        basePrice: 280,
        images: [
            {
                url: "https://example.com/atta.jpg",
                altText: "Atta Wheat Flour",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 5,
                unit: "kg",
            },
            nutritionalInfo: {
                calories: 346,
                protein: 12,
                carbohydrates: 72,
                fat: 2,
                fiber: 11,
            },
            allergens: ["gluten"],
        },
        barcodes: [
            {
                code: "8901030041234",
                type: "EAN",
            },
        ],
        hsn: "1101",
        tags: ["atta", "wheat flour", "whole wheat", "flour"],
        seo: {
            keywords: ["atta", "wheat flour", "aashirvaad"],
        },
    },
    {
        name: "Sugar White",
        description: "Refined white sugar 1kg pack",
        brand: "Madhur",
        category: "packaged-foods",
        basePrice: 45,
        images: [
            {
                url: "https://example.com/sugar.jpg",
                altText: "White Sugar",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 1,
                unit: "kg",
            },
            nutritionalInfo: {
                calories: 387,
                carbohydrates: 100,
                sugar: 100,
            },
        },
        barcodes: [
            {
                code: "8901030042345",
                type: "EAN",
            },
        ],
        hsn: "1701",
        tags: ["sugar", "white", "refined", "sweetener"],
        seo: {
            keywords: ["white sugar", "refined", "madhur"],
        },
    },
    {
        name: "Salt Iodized",
        description: "Iodized table salt 1kg pack",
        brand: "Tata Salt",
        category: "packaged-foods",
        basePrice: 22,
        images: [
            {
                url: "https://example.com/salt.jpg",
                altText: "Iodized Salt",
                isPrimary: true,
            },
        ],
        specifications: {
            weight: {
                value: 1,
                unit: "kg",
            },
            ingredients: "Sodium Chloride, Potassium Iodate",
        },
        barcodes: [
            {
                code: "8901030043456",
                type: "EAN",
            },
        ],
        hsn: "2501",
        tags: ["salt", "iodized", "table salt"],
        seo: {
            keywords: ["iodized salt", "tata salt", "table salt"],
        },
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

            // Find the correct category based on product's category slug
            const category = categories.find(
                (cat) => cat.slug === productData.category
            );
            if (!category) {
                logger.error(
                    `Category not found for product ${productData.name}: ${productData.category}`
                );
                continue;
            }

            // Assign category ID
            productData.category = category._id;

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
