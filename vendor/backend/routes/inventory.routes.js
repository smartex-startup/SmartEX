import express from "express";
import {
    getInventory,
    addProduct,
    updateProduct,
    removeProduct,
    getProduct,
    getVendorProductByMasterProductId,
    updateStock,
    getLowStock,
    batchUpdate,
    getNearExpiry,
    getExpired,
    updateBatches,
} from "../controllers/inventory.controller.js";
import { auth, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require vendor authentication
router.get("/", auth, requireRole("vendor"), getInventory);
router.post("/add", auth, requireRole("vendor"), addProduct);

// Stock management routes (before /:id to avoid conflicts)
router.put("/stock/:id", auth, requireRole("vendor"), updateStock);
router.get("/low-stock", auth, requireRole("vendor"), getLowStock);
router.post("/batch-update", auth, requireRole("vendor"), batchUpdate);

// Expiry management routes
router.get("/near-expiry", auth, requireRole("vendor"), getNearExpiry);
router.get("/expired", auth, requireRole("vendor"), getExpired);
router.put("/batches/:id", auth, requireRole("vendor"), updateBatches);

// Individual product routes
router.get(
    "/by-product/:masterProductId",
    auth,
    requireRole("vendor"),
    getVendorProductByMasterProductId
);
router.get("/:id", auth, requireRole("vendor"), getProduct);
router.put("/:id", auth, requireRole("vendor"), updateProduct);
router.delete("/:id", auth, requireRole("vendor"), removeProduct);

export default router;
