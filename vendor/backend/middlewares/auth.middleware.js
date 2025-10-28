import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import apiResponse from "../utils/response.util.js";
import logger from "../utils/logger.util.js";

// Simple auth middleware - checks for token in cookies
const auth = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.token;

        if (!token) {
            return apiResponse.unauthorized(
                res,
                "Please login to access this route"
            );
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return apiResponse.unauthorized(res, "User not found");
        }

        // Check if user is active
        if (!user.isActive) {
            return apiResponse.forbidden(res, "Account is deactivated");
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        logger.error("Auth middleware error:", error.message);
        return apiResponse.unauthorized(res, "Invalid token");
    }
};

// Simple role check middleware
const requireRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return apiResponse.forbidden(
                res,
                `Access denied. ${role} role required`
            );
        }
        next();
    };
};

export { auth, requireRole };
