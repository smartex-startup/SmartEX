/**
 * Standardized API Response Utility
 * Provides consistent response structure across all endpoints
 */

const sendResponse = (
    res,
    statusCode,
    success,
    message,
    data = null,
    meta = null
) => {
    const response = {
        success,
        statusCode,
        message,
        data,
        meta,
        timestamp: new Date().toISOString(),
    };

    // Remove null values
    Object.keys(response).forEach((key) => {
        if (response[key] === null) {
            delete response[key];
        }
    });

    return res.status(statusCode).json(response);
};

const apiResponse = {
    // Success responses
    success: (res, message = "Success", data = null, meta = null) => {
        return sendResponse(res, 200, true, message, data, meta);
    },

    created: (res, message = "Created successfully", data = null) => {
        return sendResponse(res, 201, true, message, data);
    },

    // Error responses
    badRequest: (res, message = "Bad request") => {
        return sendResponse(res, 400, false, message);
    },

    unauthorized: (res, message = "Unauthorized") => {
        return sendResponse(res, 401, false, message);
    },

    forbidden: (res, message = "Forbidden") => {
        return sendResponse(res, 403, false, message);
    },

    notFound: (res, message = "Not found") => {
        return sendResponse(res, 404, false, message);
    },

    conflict: (res, message = "Conflict") => {
        return sendResponse(res, 409, false, message);
    },

    validationError: (res, message = "Validation failed", errors = null) => {
        return sendResponse(res, 422, false, message, errors);
    },

    serverError: (res, message = "Internal server error") => {
        return sendResponse(res, 500, false, message);
    },
};

export default apiResponse;
