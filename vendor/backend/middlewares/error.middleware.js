import logger from "../utils/logger.util.js";
import apiResponse from "../utils/response.util.js";

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    logger.error(`Error: ${err.message}`, {
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
    });

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        const message = "Resource not found";
        return apiResponse.notFound(res, message);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = "Duplicate field value entered";
        return apiResponse.conflict(res, message);
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((val) => val.message);
        return apiResponse.validationError(res, "Validation Error", message);
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        const message = "Invalid token";
        return apiResponse.unauthorized(res, message);
    }

    if (err.name === "TokenExpiredError") {
        const message = "Token expired";
        return apiResponse.unauthorized(res, message);
    }

    // Default server error
    return apiResponse.serverError(res, error.message || "Server Error");
};

export default errorHandler;
