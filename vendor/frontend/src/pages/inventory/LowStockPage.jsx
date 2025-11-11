import React, { useEffect } from "react";
import {
    FaChevronRight,
    FaExclamationTriangle,
    FaExclamationCircle,
    FaInfoCircle,
    FaCheckCircle,
} from "react-icons/fa";
import { useInventory } from "../../context/InventoryContext.jsx";

const LowStockPage = () => {
    const { lowStockItems, loading, error, loadLowStock } = useInventory();

    // Load low stock items when component mounts
    useEffect(() => {
        loadLowStock();
    }, [loadLowStock]);

    // Calculate stock level categories - ensure lowStockItems is an array
    const lowStockArray = Array.isArray(lowStockItems) ? lowStockItems : [];
    const criticalItems = lowStockArray.filter(
        (item) => item.inventory?.currentStock <= 5
    );
    const lowItems = lowStockArray.filter(
        (item) =>
            item.inventory?.currentStock > 5 &&
            item.inventory?.currentStock <= 10
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <nav className="flex items-center space-x-2 text-sm text-text-tertiary mb-4">
                    <span>Inventory</span>
                    <FaChevronRight className="w-4 h-4" />
                    <span className="text-text-primary">Low Stock</span>
                </nav>
                <h1 className="text-2xl font-semibold text-text-primary">
                    Low Stock Alerts
                </h1>
                <p className="text-text-tertiary mt-1">
                    Products that are running low and need restocking (
                    {lowStockArray.length} items)
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <FaExclamationCircle className="w-5 h-5 text-danger mr-2" />
                        <div>
                            <h3 className="text-sm font-medium text-danger-dark">
                                Error loading low stock items
                            </h3>
                            <p className="text-sm text-danger mt-1">{error}</p>
                        </div>
                        <button
                            onClick={() => loadLowStock()}
                            className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 text-danger-dark text-sm rounded transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Alert Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-2xl font-semibold text-text-primary">
                                {loading ? "..." : criticalItems.length}
                            </p>
                            <p className="text-text-secondary">Critical (≤5)</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <FaExclamationCircle className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-2xl font-semibold text-text-primary">
                                {loading ? "..." : lowItems.length}
                            </p>
                            <p className="text-text-secondary">Low (6-10)</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <FaInfoCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-2xl font-semibold text-text-primary">
                                {loading ? "..." : lowStockArray.length}
                            </p>
                            <p className="text-text-secondary">Total Items</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow">
                {loading ? (
                    <div className="p-6">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-16 bg-gray-200 rounded"
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : lowStockArray.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Current Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Min Stock Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {lowStockArray.map((item) => (
                                    <tr
                                        key={item._id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-text-primary">
                                                        {item.product?.name}
                                                    </div>
                                                    <div className="text-sm text-text-tertiary">
                                                        {item.product?.brand}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    item.inventory
                                                        ?.currentStock <= 5
                                                        ? "bg-red-50 text-danger-dark"
                                                        : "bg-yellow-50 text-accent-dark"
                                                }`}
                                            >
                                                {item.inventory?.currentStock ||
                                                    0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                            {item.inventory?.minStockLevel ||
                                                10}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    item.inventory
                                                        ?.currentStock <= 5
                                                        ? "bg-red-50 text-danger-dark"
                                                        : "bg-yellow-50 text-accent-dark"
                                                }`}
                                            >
                                                {item.inventory?.currentStock <=
                                                5
                                                    ? "Critical"
                                                    : "Low Stock"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-primary hover:text-primary-dark">
                                                Restock
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="text-center py-12">
                            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FaCheckCircle className="w-12 h-12 text-text-quaternary" />
                            </div>
                            <h3 className="text-lg font-medium text-text-primary mb-2">
                                No Low Stock Items
                            </h3>
                            <p className="text-text-tertiary">
                                Great! All your products are well stocked.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LowStockPage;
