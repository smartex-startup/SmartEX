import express from "express";

// Import controllers
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductsByCategory,
} from "../controllers/product.controller.js";

// Import middleware
import { auth, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);

// Protected routes (Admin only for product management)
router.post("/", auth, requireRole("admin"), createProduct);
router.put("/:id", auth, requireRole("admin"), updateProduct);
router.delete("/:id", auth, requireRole("admin"), deleteProduct);

export default router;
