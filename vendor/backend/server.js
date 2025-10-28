import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

// Import utilities and middleware
import logger from "./utils/logger.util.js";
import errorHandler from "./middlewares/error.middleware.js";
import connectDB from "./config/db.config.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
    next();
});

// Health check route
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "SmartEX Vendor Backend is running!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);

// Global error handler (must be last middleware)
app.use(errorHandler);

// Default route for undefined endpoints (must be after all other routes)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
    });
});

// Graceful shutdown handlers
process.on("SIGTERM", () => {
    logger.info("SIGTERM received. Shutting down gracefully...");
    process.exit(0);
});

process.on("SIGINT", () => {
    logger.info("SIGINT received. Shutting down gracefully...");
    process.exit(0);
});

// Unhandled promise rejection handler
process.on("unhandledRejection", (err) => {
    logger.error("Unhandled Promise Rejection:", err.message);
    process.exit(1);
});

// Uncaught exception handler
process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err.message);
    process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    logger.info(`SmartEX Vendor Backend running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Export app for testing
export default app;
