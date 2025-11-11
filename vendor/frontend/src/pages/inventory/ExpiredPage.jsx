import React, { useEffect } from "react";
import {
    FaChevronRight,
    FaExclamationTriangle,
    FaExclamationCircle,
    FaCheckCircle,
} from "react-icons/fa";
import { useInventory } from "../../context/InventoryContext.jsx";

const ExpiredPage = () => {
    const { expiredItems, loading, error, loadExpired } = useInventory();

    // Load expired items when component mounts
    useEffect(() => {
        loadExpired();
    }, [loadExpired]);

    // Ensure expiredItems is an array
    const expiredArray = Array.isArray(expiredItems) ? expiredItems : [];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <nav className="flex items-center space-x-2 text-sm text-text-tertiary mb-4">
                    <span>Inventory</span>
                    <FaChevronRight className="w-4 h-4" />
                    <span className="text-text-primary">Expired</span>
                </nav>
                <h1 className="text-2xl font-semibold text-text-primary">
                    Expired Products
                </h1>
                <p className="text-text-tertiary mt-1">
                    Products that have already expired and need attention (
                    {expiredArray.length} items)
                </p>
            </div>

            {/* Alert Banner */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                    <div className="shrink-0">
                        <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Expired Products Alert
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>
                                Expired products should be removed from your
                                inventory immediately and cannot be sold to
                                customers. Please review and take action on all
                                expired items.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <FaExclamationCircle className="w-5 h-5 text-red-500 mr-2" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800">
                                Error loading expired items
                            </h3>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        </div>
                        <button
                            onClick={() => loadExpired()}
                            className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-sm rounded transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

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
                ) : expiredArray.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Expired Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Days Expired
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Loss Value
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {expiredArray.map((item) => {
                                    // Get the most recently expired batch
                                    const mostRecentBatch =
                                        item.expiredBatches?.reduce(
                                            (most, batch) =>
                                                batch.daysExpired <
                                                most.daysExpired
                                                    ? batch
                                                    : most
                                        );

                                    const expiredDate =
                                        mostRecentBatch?.expiryDate
                                            ? new Date(
                                                  mostRecentBatch.expiryDate
                                              )
                                            : null;

                                    const daysExpired =
                                        mostRecentBatch?.daysExpired || 0;
                                    const lossValue = item.lossValue || 0;

                                    return (
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
                                                            {
                                                                item.product
                                                                    ?.brand
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                                {expiredDate
                                                    ? expiredDate.toLocaleDateString(
                                                          "en-IN"
                                                      )
                                                    : "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-800">
                                                    {daysExpired > 0
                                                        ? `${daysExpired} days ago`
                                                        : "Today"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                                {item.totalExpiredStock || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                                ₹
                                                {lossValue.toLocaleString(
                                                    "en-IN"
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button className="text-red-600 hover:text-red-900">
                                                    Remove Stock
                                                </button>
                                                <button className="text-text-secondary hover:text-text-primary">
                                                    Mark as Loss
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="text-center py-12">
                            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FaCheckCircle className="w-12 h-12 text-green-500" />
                            </div>
                            <h3 className="text-lg font-medium text-text-primary mb-2">
                                No Expired Products
                            </h3>
                            <p className="text-text-tertiary">
                                Great! You don't have any expired products in
                                your inventory.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpiredPage;
