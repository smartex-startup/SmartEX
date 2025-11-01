import express from "express";

// Import controllers
import {
    getProducts,
    getProduct,
    searchProducts,
    getProductsByCategory,
    getCategories,
} from "../controllers/product.controller.js";

// Import middleware
import { auth, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require vendor authentication
router.get("/", auth, requireRole("vendor"), getProducts); // Browse all products
router.get("/search", auth, requireRole("vendor"), searchProducts); // Search products
router.get("/categories", auth, requireRole("vendor"), getCategories); // Get all categories
router.get(
    "/category/:categoryId",
    auth,
    requireRole("vendor"),
    getProductsByCategory
); // Filter by category
router.get("/:id", auth, requireRole("vendor"), getProduct); // Get single product details

export default router;
