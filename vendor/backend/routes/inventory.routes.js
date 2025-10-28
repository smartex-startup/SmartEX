import express from "express";

// Import controllers
import {
    getVendorInventory,
    addProductToInventory,
    updateProductInventory,
    removeProductFromInventory,
    addStock,
    updateBatch,
    getNearExpiryProducts,
    getOutOfStockProducts,
    bulkUpdateInventory,
} from "../controllers/inventory.controller.js";

// Import middleware
import { auth, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All inventory routes require vendor authentication
router.use(auth, requireRole("vendor"));

// Inventory management routes
router.get("/", getVendorInventory);
router.post("/add-product", addProductToInventory);
router.put("/product/:productId", updateProductInventory);
router.delete("/product/:productId", removeProductFromInventory);

// Stock management
router.post("/add-stock", addStock);
router.put("/batch/:batchId", updateBatch);

// Inventory insights
router.get("/near-expiry", getNearExpiryProducts);
router.get("/out-of-stock", getOutOfStockProducts);

// Bulk operations
router.post("/bulk-update", bulkUpdateInventory);

export default router;
