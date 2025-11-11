import React, { createContext, useContext, useState, useCallback } from "react";
import * as inventoryAPI from "../api/inventory.api.js";
import logger from "../utils/logger.util.js";

// Create context
const InventoryContext = createContext();

// Inventory provider component
export const InventoryProvider = ({ children }) => {
    // Main inventory data
    const [inventory, setInventory] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [nearExpiryItems, setNearExpiryItems] = useState([]);
    const [expiredItems, setExpiredItems] = useState([]);

    // Summary data
    const [summary, setSummary] = useState({
        totalProducts: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
    });

    // Pagination
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
    });

    // Filters
    const [filters, setFilters] = useState({
        search: "",
        category: "",
        status: "",
        minPrice: "",
        maxPrice: "",
        expiryStatus: "",
        sortBy: "product.name",
        sortOrder: "asc",
    });

    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load inventory with filters and pagination
    const loadInventory = useCallback(
        async (page = 1) => {
            setLoading(true);
            setError(null);

            try {
                // Prepare query parameters
                const queryParams = {
                    ...filters,
                    page,
                    limit: pagination.limit,
                };

                // Remove empty values
                const cleanParams = Object.fromEntries(
                    Object.entries(queryParams).filter(
                        ([_, value]) =>
                            value !== "" &&
                            value !== null &&
                            value !== undefined
                    )
                );

                logger.info("Loading inventory with params:", cleanParams);

                const response = await inventoryAPI.getInventory(cleanParams);

                if (response?.success && response?.data) {
                    const {
                        products,
                        summary: summaryData,
                        pagination: paginationData,
                    } = response.data;

                    setInventory(products || []);
                    setSummary(
                        summaryData || {
                            totalProducts: 0,
                            totalValue: 0,
                            lowStockItems: 0,
                            outOfStockItems: 0,
                        }
                    );
                    setPagination(
                        paginationData || {
                            currentPage: 1,
                            totalPages: 0,
                            totalItems: 0,
                            limit: 10,
                            hasNextPage: false,
                            hasPrevPage: false,
                        }
                    );

                    logger.info(
                        `Successfully loaded ${
                            products?.length || 0
                        } inventory items`
                    );
                } else {
                    throw new Error(
                        response?.message || "Failed to load inventory"
                    );
                }
            } catch (err) {
                logger.error("Error loading inventory:", err);
                setError(err.message || "Failed to load inventory");
                setInventory([]);
            } finally {
                setLoading(false);
            }
        },
        [filters, pagination.limit]
    );

    // Load low stock items
    const loadLowStock = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await inventoryAPI.getLowStock();
            setLowStockItems(response.data.products || []);
            logger.info("Successfully loaded low stock items");
        } catch (err) {
            logger.error("Error loading low stock items:", err);
            setError("Failed to load low stock items");
            setLowStockItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load near expiry items
    const loadNearExpiry = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await inventoryAPI.getNearExpiry();
            setNearExpiryItems(response.data.products || []);
            logger.info("Successfully loaded near expiry items");
        } catch (err) {
            logger.error("Error loading near expiry items:", err);
            setError("Failed to load near expiry items");
            setNearExpiryItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load expired items
    const loadExpired = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await inventoryAPI.getExpired();
            setExpiredItems(response.data.products || []);
            logger.info("Successfully loaded expired items");
        } catch (err) {
            logger.error("Error loading expired items:", err);
            setError("Failed to load expired items");
            setExpiredItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Add new product
    const addProduct = useCallback(async (productData) => {
        try {
            setError(null);
            const response = await inventoryAPI.addProduct(productData);

            setInventory((prev) => [...prev, response.data]);
            logger.info("Product added successfully");

            return { success: true, data: response.data };
        } catch (err) {
            logger.error("Error adding product:", err);
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Failed to add product";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    // Update existing product
    const updateProduct = useCallback(async (productId, updateData) => {
        try {
            setError(null);
            const response = await inventoryAPI.updateProduct(
                productId,
                updateData
            );

            setInventory((prev) =>
                prev.map((item) =>
                    item._id === productId ? response.data : item
                )
            );
            logger.info("Product updated successfully");

            return { success: true, data: response.data };
        } catch (err) {
            logger.error("Error updating product:", err);
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Failed to update product";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    // Remove product
    const removeProduct = useCallback(async (productId) => {
        try {
            setError(null);
            await inventoryAPI.removeProduct(productId);

            setInventory((prev) =>
                prev.filter((item) => item._id !== productId)
            );
            logger.info("Product removed successfully");

            return { success: true };
        } catch (err) {
            logger.error("Error removing product:", err);
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Failed to remove product";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    // Apply filters
    const applyFilters = useCallback(
        async (newFilters) => {
            logger.info("Applying filters:", newFilters);
            setFilters((prev) => ({ ...prev, ...newFilters }));
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
            await loadInventory(1);
        },
        [loadInventory]
    );

    // Clear filters
    const clearFilters = useCallback(async () => {
        logger.info("Clearing filters");
        setFilters({
            search: "",
            category: "",
            status: "",
            minPrice: "",
            maxPrice: "",
            expiryStatus: "",
            sortBy: "product.name",
            sortOrder: "asc",
        });
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        await loadInventory(1);
    }, [loadInventory]);

    // Change page
    const changePage = useCallback(
        (page) => {
            if (page >= 1 && page <= pagination.totalPages) {
                setPagination((prev) => ({ ...prev, currentPage: page }));
                loadInventory(page);
            }
        },
        [pagination.totalPages, loadInventory]
    );

    // Change items per page
    const changeLimit = useCallback(
        (limit) => {
            setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
            loadInventory(1);
        },
        [loadInventory]
    );

    // === UTILITY FUNCTIONS ===

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Refresh current data
    const refresh = useCallback(() => {
        loadInventory(pagination.currentPage);
    }, [loadInventory, pagination.currentPage]);

    // === CONTEXT VALUE ===
    const value = {
        // Data
        inventory,
        lowStockItems,
        nearExpiryItems,
        expiredItems,
        summary,
        pagination,
        filters,

        // State
        loading,
        error,

        // Main operations
        loadInventory,
        loadLowStock,
        loadNearExpiry,
        loadExpired,

        // Product operations
        addProduct,
        updateProduct,
        removeProduct,

        // Filter & pagination
        applyFilters,
        clearFilters,
        changePage,
        changeLimit,

        // Utilities
        clearError,
        refresh,
    };

    return (
        <InventoryContext.Provider value={value}>
            {children}
        </InventoryContext.Provider>
    );
};

// Custom hook to use inventory context
export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error(
            "useInventory must be used within an InventoryProvider"
        );
    }
    return context;
};

export default InventoryContext;
