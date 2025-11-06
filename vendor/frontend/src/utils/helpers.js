/**
 * Utility functions for components in SmartEX Vendor Portal
 */

// Format currency values
export const formatCurrency = (amount, currency = "₹") => {
    if (typeof amount !== "number") return `${currency}0`;
    return `${currency}${amount.toLocaleString("en-IN")}`;
};

// Format dates
export const formatDate = (date, options = {}) => {
    if (!date) return "-";

    const defaultOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        ...options,
    };

    return new Date(date).toLocaleDateString("en-IN", defaultOptions);
};

// Format relative time (e.g., "2 days ago")
export const formatRelativeTime = (date) => {
    if (!date) return "-";

    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now - targetDate) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    if (diffInSeconds < 2592000)
        return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDate(date);
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

// Get status color class
export const getStatusColor = (status) => {
    const statusColors = {
        active: "text-green-600 bg-green-100",
        inactive: "text-gray-600 bg-gray-100",
        low_stock: "text-amber-600 bg-amber-100",
        out_of_stock: "text-red-600 bg-red-100",
        expired: "text-red-600 bg-red-100",
        near_expiry: "text-orange-600 bg-orange-100",
    };

    return statusColors[status] || "text-gray-600 bg-gray-100";
};

// Debounce function for search inputs
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Validate email format
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Generate random ID
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
};

// Format file size
export const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
