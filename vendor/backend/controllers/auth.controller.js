import {
    authenticateVendor,
    fetchVendorProfile,
    updateVendorData,
    updatePassword,
    setTokenCookie,
    clearTokenCookie,
} from "../services/auth.service.js";
import apiResponse from "../utils/response.util.js";
import logger from "../utils/logger.util.js";

// Login vendor
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return apiResponse.badRequest(
                res,
                "Please provide email and password"
            );
        }

        // Login through service
        const result = await authenticateVendor(email, password);

        // Set cookie
        setTokenCookie(req, res, result.token);

        return apiResponse.success(res, "Login successful", result.user);
    } catch (error) {
        logger.error("Login controller error:", error.message);

        if (
            error.message.includes("Invalid credentials") ||
            error.message.includes("Access denied") ||
            error.message.includes("deactivated")
        ) {
            return apiResponse.unauthorized(res, error.message);
        }

        return apiResponse.serverError(res, "Login failed");
    }
};

// Logout vendor
const logout = async (req, res) => {
    try {
        clearTokenCookie(res);
        return apiResponse.success(res, "Logout successful", null);
    } catch (error) {
        logger.error("Logout controller error:", error.message);
        return apiResponse.serverError(res, "Logout failed");
    }
};

// Get vendor profile
const getProfile = async (req, res) => {
    try {
        const profile = await fetchVendorProfile(req.user.id);
        return apiResponse.success(
            res,
            "Profile retrieved successfully",
            profile
        );
    } catch (error) {
        logger.error("Get profile controller error:", error.message);

        if (error.message.includes("not found")) {
            return apiResponse.notFound(res, error.message);
        }

        return apiResponse.serverError(res, "Failed to retrieve profile");
    }
};

// Update vendor profile
const updateProfile = async (req, res) => {
    try {
        const updatedUser = await updateVendorData(req.user.id, req.body);
        return apiResponse.success(
            res,
            "Profile updated successfully",
            updatedUser
        );
    } catch (error) {
        logger.error("Update profile controller error:", error.message);

        if (error.message.includes("not found")) {
            return apiResponse.notFound(res, error.message);
        }

        if (error.message.includes("No valid fields")) {
            return apiResponse.badRequest(res, error.message);
        }

        if (error.name === "ValidationError") {
            return apiResponse.badRequest(res, error.message);
        }

        return apiResponse.serverError(res, "Failed to update profile");
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return apiResponse.badRequest(
                res,
                "Please provide current and new password"
            );
        }

        if (newPassword.length < 6) {
            return apiResponse.badRequest(
                res,
                "New password must be at least 6 characters"
            );
        }

        // Change password through service
        const result = await updatePassword(
            req.user.id,
            currentPassword,
            newPassword
        );

        // Set new cookie
        setTokenCookie(res, result.token);

        return apiResponse.success(res, "Password changed successfully", null);
    } catch (error) {
        logger.error("Change password controller error:", error.message);

        if (error.message.includes("Current password is incorrect")) {
            return apiResponse.badRequest(res, error.message);
        }

        if (error.message.includes("not found")) {
            return apiResponse.notFound(res, error.message);
        }

        return apiResponse.serverError(res, "Failed to change password");
    }
};

export { login, logout, getProfile, updateProfile, changePassword };
