import apiClient from "../utils/axios.js";
import logger from "../utils/logger.util.js";

// Vendor login
export const login = async (credentials) => {
    try {
        logger.info("Attempting vendor login...");
        const response = await apiClient.post("/auth/login", credentials);
        logger.info("Login successful");
        return response.data;
    } catch (error) {
        logger.error(
            "Login failed:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Vendor logout
export const logout = async () => {
    try {
        logger.info("Logging out vendor...");
        const response = await apiClient.post("/auth/logout");
        logger.info("Logout successful");
        return response.data;
    } catch (error) {
        logger.error(
            "Logout failed:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Get current vendor profile
export const getProfile = async () => {
    try {
        logger.info("Fetching vendor profile...");
        const response = await apiClient.get("/auth/profile");
        logger.info("Profile fetched successfully");
        return response.data;
    } catch (error) {
        // Don't log 401 errors as errors - they're expected when not logged in
        if (error.response?.status === 401) {
            logger.info("Profile fetch failed: User not authenticated");
        } else {
            logger.error(
                "Failed to fetch profile:",
                error.response?.data?.message || error.message
            );
        }
        throw error;
    }
};

// Update vendor profile
export const updateProfile = async (profileData) => {
    try {
        logger.info("Updating vendor profile...");
        const response = await apiClient.put("/auth/profile", profileData);
        logger.info("Profile updated successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to update profile:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Change password
export const changePassword = async (passwordData) => {
    try {
        logger.info("Changing vendor password...");
        const response = await apiClient.put(
            "/auth/change-password",
            passwordData
        );
        logger.info("Password changed successfully");
        return response.data;
    } catch (error) {
        logger.error(
            "Failed to change password:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Refresh authentication token
export const refreshToken = async () => {
    try {
        logger.info("Refreshing authentication token...");
        const response = await apiClient.post("/auth/refresh");
        logger.info("Token refreshed successfully");
        return response.data;
    } catch (error) {
        // Don't log 401 errors as errors - they're expected when no valid refresh token
        if (error.response?.status === 401) {
            logger.info("Token refresh failed: No valid refresh token");
        } else {
            logger.error(
                "Failed to refresh token:",
                error.response?.data?.message || error.message
            );
        }
        throw error;
    }
};
