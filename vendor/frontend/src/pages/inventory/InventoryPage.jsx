import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FaExclamationTriangle,
    FaClock,
    FaPlus,
    FaExclamationCircle,
    FaBox,
} from "react-icons/fa";
import { useInventory } from "../../context/InventoryContext.jsx";
import SearchAndFilters from "../../components/inventory/SearchAndFilters.jsx";
import InventoryTable from "../../components/inventory/InventoryTable.jsx";
import InventorySummary from "../../components/inventory/InventorySummary.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import logger from "../../utils/logger.util.js";

const InventoryPage = () => {
    const {
        inventory,
        pagination,
        summary,
        loading,
        error,
        loadInventory,
        filters,
    } = useInventory();

    // Load inventory when component mounts
    useEffect(() => {
        logger.info("InventoryPage: Initial inventory load...");
        loadInventory(1);
    }, [loadInventory]); // Only depend on loadInventory function

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">
                        All Inventory
                    </h1>
                    <p className="text-text-tertiary mt-1">
                        Manage your inventory products
                        {pagination.totalItems > 0 && (
                            <>
                                {" "}
                                ({pagination.totalItems.toLocaleString(
                                    "en-IN"
                                )}{" "}
                                products)
                            </>
                        )}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    {/* Quick Action Buttons */}
                    <Link
                        to="/inventory/low-stock"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 text-text-secondary"
                    >
                        <FaExclamationTriangle className="w-4 h-4" />
                        <span>Low Stock</span>
                    </Link>

                    <Link
                        to="/inventory/near-expiry"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 text-text-secondary"
                    >
                        <FaClock className="w-4 h-4" />
                        <span>Near Expiry</span>
                    </Link>

                    <Link
                        to="/inventory/add"
                        className="bg-primary text-text-inverse px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center space-x-2"
                    >
                        <FaPlus className="w-4 h-4" />
                        <span>Add to Inventory</span>
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <InventorySummary />

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <FaExclamationCircle className="w-5 h-5 text-danger mr-2" />
                        <div>
                            <h3 className="text-sm font-medium text-danger-dark">
                                Error loading inventory
                            </h3>
                            <p className="text-sm text-danger mt-1">{error}</p>
                        </div>
                        <button
                            onClick={() => loadInventory()}
                            className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 text-danger-dark text-sm rounded transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <SearchAndFilters />

            {/* Inventory Table */}
            <InventoryTable />

            {/* Pagination */}
            <Pagination />
        </div>
    );
};

export default InventoryPage;
