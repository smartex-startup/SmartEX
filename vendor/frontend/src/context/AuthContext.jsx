import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import * as authAPI from "../api/auth.api.js";
import logger from "../utils/logger.util.js";

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [vendor, setVendor] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check authentication status on app load
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Check if vendor is authenticated
    const checkAuthStatus = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await authAPI.getProfile();

            setVendor(response.data);
            setIsAuthenticated(true);
            setError(null);
        } catch (error) {
            // Silent handling for expected 401 errors (not logged in)
            if (error.response?.status === 401) {
                logger.info(
                    "User not authenticated - this is expected on initial load"
                );
            } else {
                // Log unexpected auth errors
                logger.error("Unexpected auth check error:", error.message);
            }
            setVendor(null);
            setIsAuthenticated(false);
            setError(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Login function
    const login = useCallback(async (credentials) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await authAPI.login(credentials);

            setVendor(response.data.vendor);
            setIsAuthenticated(true);
            setError(null);
            return { success: true };
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Login failed. Please try again.";
            setError(errorMessage);
            setIsAuthenticated(false);
            setVendor(null);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            logger.error("Logout error:", error.message);
        } finally {
            setVendor(null);
            setIsAuthenticated(false);
            setError(null);
            setIsLoading(false);
        }
    }, []);

    // Update profile function
    const updateProfile = useCallback(
        async (profileData) => {
            try {
                setError(null);

                const response = await authAPI.updateProfile(profileData);

                setVendor({ ...vendor, ...response.data });
                setError(null);
                return { success: true };
            } catch (error) {
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Profile update failed. Please try again.";
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        },
        [vendor]
    );

    // Change password function
    const changePassword = useCallback(async (passwordData) => {
        try {
            setError(null);

            await authAPI.changePassword(passwordData);

            return { success: true };
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Password change failed. Please try again.";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    // Clear error function
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Context value
    const value = {
        vendor,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        updateProfile,
        changePassword,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;
