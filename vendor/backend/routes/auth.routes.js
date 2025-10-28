import express from "express";
import {
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
} from "../controllers/auth.controller.js";
import { auth, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/login", login);

// Protected routes (vendor only)
router.post("/logout", auth, requireRole("vendor"), logout);
router.get("/profile", auth, requireRole("vendor"), getProfile);
router.put("/profile", auth, requireRole("vendor"), updateProfile);
router.put("/change-password", auth, requireRole("vendor"), changePassword);

export default router;
