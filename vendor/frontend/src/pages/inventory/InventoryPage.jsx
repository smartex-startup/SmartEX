import React, { useEffect } from "react";
import { Link } from "react-router-dom";
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
                    <h1 className="text-2xl font-semibold text-gray-900">
                        All Inventory
                    </h1>
                    <p className="text-gray-600 mt-1">
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
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 text-gray-600"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                        <span>Low Stock</span>
                    </Link>

                    <Link
                        to="/inventory/near-expiry"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 text-gray-600"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>Near Expiry</span>
                    </Link>

                    <Link
                        to="/inventory/add"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
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
                        <svg
                            className="w-5 h-5 text-red-400 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div>
                            <h3 className="text-sm font-medium text-red-800">
                                Error loading inventory
                            </h3>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        </div>
                        <button
                            onClick={() => loadInventory()}
                            className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-sm rounded transition-colors"
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

            {/* Empty State for No Results */}
            {!loading && (!inventory || inventory.length === 0) && !error && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No products found
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {pagination.totalItems === 0
                            ? "Get started by adding products from the catalog to your inventory."
                            : "No products match your current filters. Try adjusting your search or filters."}
                    </p>
                    {pagination.totalItems === 0 && (
                        <Link
                            to="/inventory/add"
                            className="inline-flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            Add Your First Product
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
