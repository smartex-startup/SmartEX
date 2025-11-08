import axios from "axios";
import logger from "./logger.util.js";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api";

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: true, // Include cookies in requests
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Log requests in development
        logger.info(
            `API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
    },
    (error) => {
        logger.error("Request Error:", error);
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        // Log successful responses in development
        logger.info(
            `API Response: ${response.config.method?.toUpperCase()} ${
                response.config.url
            }`,
            response.data
        );
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Don't log expected 401 errors for auth check endpoints
        const isAuthCheck = originalRequest.url?.includes("/auth/profile");
        const is401 = error.response?.status === 401;

        if (is401 && isAuthCheck) {
            // Silent handling for expected auth failures during profile check
            logger.info(
                `Expected auth failure on ${originalRequest.url} - User not logged in`
            );
        } else {
            // Log unexpected API errors
            logger.error(
                `API Error: ${error.config?.method?.toUpperCase()} ${
                    error.config?.url
                }`,
                error.response?.data
            );
        }

        // Handle 401 errors (Unauthorized) - redirect to login for session-based auth
        if (error.response?.status === 401 && !isAuthCheck) {
            // For session-based auth, just redirect to login on 401
            handleLogout();
        }

        // Handle other error status codes (but not expected auth failures)
        if (!(is401 && isAuthCheck)) {
            handleGlobalError(error);
        }

        return Promise.reject(error);
    }
);

// Global error handler
const handleGlobalError = (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    switch (status) {
        case 400:
            logger.error("Bad Request:", message);
            showErrorToast("Invalid request. Please check your input.");
            break;
        case 403:
            logger.error("Forbidden:", message);
            showErrorToast("You don't have permission to perform this action.");
            break;
        case 404:
            logger.error("Not Found:", message);
            showErrorToast("The requested resource was not found.");
            break;
        case 429:
            logger.error("Too Many Requests:", message);
            showErrorToast("Too many requests. Please try again later.");
            break;
        case 500:
        case 502:
        case 503:
        case 504:
            logger.error("Server Error:", message);
            showErrorToast("Server error. Please try again later.");
            break;
        default:
            if (!navigator.onLine) {
                showErrorToast(
                    "No internet connection. Please check your network."
                );
            } else {
                logger.error("Network Error:", message);
                showErrorToast("Network error. Please try again.");
            }
    }
};

// Logout handler
const handleLogout = () => {
    // Clear any auth state/localStorage if needed
    localStorage.removeItem("vendor");

    // Redirect to login page
    if (window.location.pathname !== "/login") {
        window.location.href = "/login";
    }
};

// Simple error toast function (can be replaced with a proper toast library)
const showErrorToast = (message) => {
    // For now, just console error and alert
    // In production, replace with proper toast notification
    logger.error("Error Toast:", message);

    // You can replace this with a proper toast library like react-hot-toast
    if (import.meta.env.DEV) {
        console.error(`Error: ${message}`);
    }
};

export default apiClient;
