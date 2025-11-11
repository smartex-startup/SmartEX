import React, { useEffect } from "react";
import { useInventory } from "../../context/InventoryContext.jsx";

const NearExpiryPage = () => {
    const { nearExpiryItems, loading, error, loadNearExpiry } = useInventory();

    // Load near expiry items when component mounts
    useEffect(() => {
        loadNearExpiry();
    }, [loadNearExpiry]);

    // Helper function to get days until expiry from nearExpiryBatches
    const getDaysUntilExpiry = (item) => {
        if (
            !item.nearExpiryBatches ||
            !Array.isArray(item.nearExpiryBatches) ||
            item.nearExpiryBatches.length === 0
        ) {
            return null;
        }
        // Get the minimum days to expiry from all batches
        return Math.min(
            ...item.nearExpiryBatches.map((batch) => batch.daysToExpiry || 0)
        );
    };

    // Calculate expiry categories - ensure nearExpiryItems is an array
    const nearExpiryArray = Array.isArray(nearExpiryItems)
        ? nearExpiryItems
        : [];

    const expiresToday = nearExpiryArray.filter((item) => {
        const days = getDaysUntilExpiry(item);
        return days === 0;
    });

    const expiresIn3Days = nearExpiryArray.filter((item) => {
        const days = getDaysUntilExpiry(item);
        return days > 0 && days <= 3;
    });

    const expiresIn7Days = nearExpiryArray.filter((item) => {
        const days = getDaysUntilExpiry(item);
        return days > 3 && days <= 7;
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                    <span>Inventory</span>
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
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                    <span className="text-gray-900">Near Expiry</span>
                </nav>
                <h1 className="text-2xl font-semibold text-gray-900">
                    Near Expiry Products
                </h1>
                <p className="text-gray-600 mt-1">
                    Products that are approaching their expiry date (
                    {nearExpiryArray.length} items)
                </p>
            </div>

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
                                Error loading near expiry items
                            </h3>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        </div>
                        <button
                            onClick={() => loadNearExpiry()}
                            className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-sm rounded transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Expiry Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <svg
                                className="w-6 h-6 text-red-600"
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
                        </div>
                        <div className="ml-4">
                            <p className="text-2xl font-semibold text-gray-900">
                                {loading ? "..." : expiresToday.length}
                            </p>
                            <p className="text-gray-600">Expires Today</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <svg
                                className="w-6 h-6 text-orange-600"
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
                        </div>
                        <div className="ml-4">
                            <p className="text-2xl font-semibold text-gray-900">
                                {loading ? "..." : expiresIn3Days.length}
                            </p>
                            <p className="text-gray-600">In 1-3 Days</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <svg
                                className="w-6 h-6 text-yellow-600"
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
                        </div>
                        <div className="ml-4">
                            <p className="text-2xl font-semibold text-gray-900">
                                {loading ? "..." : expiresIn7Days.length}
                            </p>
                            <p className="text-gray-600">In 4-7 Days</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg
                                className="w-6 h-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-2xl font-semibold text-gray-900">
                                {loading ? "..." : nearExpiryArray.length}
                            </p>
                            <p className="text-gray-600">Total Items</p>
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
                ) : nearExpiryArray.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Expiry Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Days Left
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {nearExpiryArray.map((item) => {
                                    const daysLeft = getDaysUntilExpiry(item);
                                    const isUrgent = daysLeft <= 3;
                                    const isCritical = daysLeft === 0;
                                    const earliestBatch =
                                        item.nearExpiryBatches?.reduce(
                                            (earliest, batch) =>
                                                batch.daysToExpiry <
                                                earliest.daysToExpiry
                                                    ? batch
                                                    : earliest
                                        );

                                    return (
                                        <tr
                                            key={item._id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.product?.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {
                                                                item.product
                                                                    ?.brand
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {earliestBatch?.expiryDate
                                                    ? new Date(
                                                          earliestBatch.expiryDate
                                                      ).toLocaleDateString(
                                                          "en-IN"
                                                      )
                                                    : "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        isCritical
                                                            ? "bg-red-100 text-red-800"
                                                            : isUrgent
                                                            ? "bg-orange-100 text-orange-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                                >
                                                    {daysLeft === 0
                                                        ? "Today"
                                                        : `${daysLeft} days`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.totalNearExpiryStock || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        isCritical
                                                            ? "bg-red-100 text-red-800"
                                                            : isUrgent
                                                            ? "bg-orange-100 text-orange-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                                >
                                                    {isCritical
                                                        ? "Critical"
                                                        : isUrgent
                                                        ? "Urgent"
                                                        : "Moderate"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button className="text-blue-600 hover:text-blue-900 mr-3">
                                                    Mark Down
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    Remove
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
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No Products Near Expiry
                            </h3>
                            <p className="text-gray-500">
                                All your products have sufficient time before
                                expiry.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NearExpiryPage;
