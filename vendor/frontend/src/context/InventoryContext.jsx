import React, { createContext, useContext, useState, useCallback } from "react";
import * as inventoryAPI from "../api/inventory.api.js";
import logger from "../utils/logger.util.js";

// Create context
const InventoryContext = createContext();

// Inventory provider component
export const InventoryProvider = ({ children }) => {
    const [inventory, setInventory] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [nearExpiryItems, setNearExpiryItems] = useState([]);
    const [expiredItems, setExpiredItems] = useState([]);
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch inventory
    const fetchInventory = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await inventoryAPI.getInventory();

            setInventory(response.data || []);
            setSummary(response.meta?.summary || null);
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch inventory";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch low stock items
    const fetchLowStock = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await inventoryAPI.getLowStock();

            setLowStockItems(response.data || []);
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch low stock items";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch near expiry items
    const fetchNearExpiry = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await inventoryAPI.getNearExpiry();

            setNearExpiryItems(response.data || []);
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch near expiry items";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Add product to inventory
    const addProduct = useCallback(async (productData) => {
        try {
            setError(null);

            const response = await inventoryAPI.addProduct(productData);

            setInventory((prev) => [...prev, response.data]);
            setError(null);
            return { success: true };
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to add product";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    // Update product in inventory
    const updateProduct = useCallback(async (productId, updateData) => {
        try {
            setError(null);

            const response = await inventoryAPI.updateProduct(
                productId,
                updateData
            );

            setInventory((prev) =>
                prev.map((item) =>
                    item._id === response.data._id ? response.data : item
                )
            );
            setError(null);
            return { success: true };
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to update product";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    // Remove product from inventory
    const removeProduct = useCallback(async (productId) => {
        try {
            setError(null);

            await inventoryAPI.removeProduct(productId);

            setInventory((prev) =>
                prev.filter((item) => item._id !== productId)
            );
            setError(null);
            return { success: true };
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to remove product";
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
        inventory,
        lowStockItems,
        nearExpiryItems,
        expiredItems,
        summary,
        isLoading,
        error,
        fetchInventory,
        fetchLowStock,
        fetchNearExpiry,
        addProduct,
        updateProduct,
        removeProduct,
        clearError,
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
