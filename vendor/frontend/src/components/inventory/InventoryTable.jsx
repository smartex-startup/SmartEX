import React from "react";
import { useInventory } from "../../context/InventoryContext.jsx";
import InventoryTableSkeleton from "./InventoryTableSkeleton.jsx";

const InventoryTable = () => {
    const { inventory, loading } = useInventory();

    // Ensure inventory is always an array
    const inventoryItems = Array.isArray(inventory) ? inventory : [];

    // Status badge component
    const StatusBadge = ({ status }) => {
        let badgeClass = "";
        let text = "";

        switch (status) {
            case "out_of_stock":
                badgeClass = "bg-red-100 text-red-800";
                text = "Out of Stock";
                break;
            case "low_stock":
                badgeClass = "bg-yellow-100 text-yellow-800";
                text = "Low Stock";
                break;
            case "available":
                badgeClass = "bg-green-100 text-green-800";
                text = "Available";
                break;
            case "discontinued":
                badgeClass = "bg-gray-100 text-gray-800";
                text = "Discontinued";
                break;
            default:
                badgeClass = "bg-gray-100 text-gray-800";
                text = "Unknown";
        }

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
            >
                {text}
            </span>
        );
    };

    // Expiry badge component
    const ExpiryBadge = ({ batches }) => {
        if (!batches || !Array.isArray(batches) || batches.length === 0)
            return null;

        // Find the batch with the nearest expiry that's not expired
        const activeBatches = batches.filter((batch) => batch.quantity > 0);
        if (activeBatches.length === 0) return null;

        const nearestBatch = activeBatches
            .filter((batch) => batch.expiryDate)
            .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))[0];

        if (!nearestBatch) return null;

        const expiryDate = new Date(nearestBatch.expiryDate);
        const today = new Date();
        const daysToExpiry = Math.ceil(
            (expiryDate - today) / (1000 * 60 * 60 * 24)
        );

        let badgeClass = "";
        let text = "";

        if (daysToExpiry < 0) {
            badgeClass = "bg-red-100 text-red-800";
            text = "Expired";
        } else if (daysToExpiry <= 7) {
            badgeClass = "bg-red-100 text-red-800";
            text = `${daysToExpiry} days`;
        } else if (daysToExpiry <= 30) {
            badgeClass = "bg-yellow-100 text-yellow-800";
            text = `${daysToExpiry} days`;
        } else {
            badgeClass = "bg-green-100 text-green-800";
            text = `${daysToExpiry} days`;
        }

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
            >
                {text}
            </span>
        );
    };

    // Price display component
    const PriceDisplay = ({ pricing }) => {
        if (!pricing) return <span className="text-sm text-gray-500">-</span>;

        const hasDiscount =
            pricing.discountedPrice &&
            pricing.discountedPrice < pricing.finalPrice;

        return (
            <div className="space-y-1">
                <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                        ₹{pricing.finalPrice?.toLocaleString("en-IN") || "0"}
                    </span>
                </div>
                {hasDiscount && (
                    <div className="text-sm text-gray-500">
                        Was: ₹
                        {pricing.originalPrice?.toLocaleString("en-IN") || "0"}
                    </div>
                )}
            </div>
        );
    };

    // Show loading skeleton
    if (loading) {
        return <InventoryTableSkeleton />;
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50">
                {/* Product */}
                <div className="col-span-4">
                    <span className="text-sm font-medium text-gray-700">
                        Product
                    </span>
                </div>

                {/* Category */}
                <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-700">
                        Category
                    </span>
                </div>

                {/* Price */}
                <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-700">
                        Price
                    </span>
                </div>

                {/* Stock */}
                <div className="col-span-1">
                    <span className="text-sm font-medium text-gray-700">
                        Stock
                    </span>
                </div>

                {/* Status */}
                <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-700">
                        Status
                    </span>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                    <span className="text-sm font-medium text-gray-700">
                        Actions
                    </span>
                </div>
            </div>

            {/* Table Body */}
            <div className="min-h-[400px]">
                {inventoryItems.length === 0 ? (
                    // Empty state
                    <div className="p-12 text-center">
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
                            No inventory items found
                        </h3>
                        <p className="text-gray-500 mb-6">
                            No items match your current filters. Try adjusting
                            your search or filters.
                        </p>
                    </div>
                ) : (
                    inventoryItems.map((item) => (
                        <div
                            key={item._id}
                            className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            {/* Product Info */}
                            <div className="col-span-4 flex items-center space-x-3">
                                <div className="shrink-0">
                                    {item.product?.images?.[0]?.url ? (
                                        <img
                                            src={item.product.images[0].url}
                                            alt={
                                                item.product.images[0]
                                                    .altText ||
                                                item.product.name
                                            }
                                            className="w-12 h-12 rounded object-cover"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                            <svg
                                                className="w-6 h-6 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-gray-900 truncate">
                                        {item.product?.name ||
                                            "Unknown Product"}
                                    </h3>
                                    <p className="text-sm text-gray-500 truncate">
                                        {item.product?.brand || "Unknown Brand"}
                                    </p>
                                </div>
                            </div>

                            {/* Category */}
                            <div className="col-span-2 flex items-center">
                                <span className="text-sm text-gray-600">
                                    {item.product?.category || "-"}
                                </span>
                            </div>

                            {/* Price */}
                            <div className="col-span-2 flex items-center">
                                <PriceDisplay pricing={item.pricing} />
                            </div>

                            {/* Stock */}
                            <div className="col-span-1 flex items-center">
                                <div className="text-sm font-medium text-gray-900">
                                    {item.inventory?.currentStock || 0}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="col-span-2 flex items-center space-y-1">
                                <div className="space-y-1">
                                    <StatusBadge
                                        status={
                                            item.availability
                                                ?.availabilityStatus
                                        }
                                    />
                                    <ExpiryBadge
                                        batches={item.expiryTracking?.batches}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 flex items-center">
                                <div className="flex items-center space-x-1">
                                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
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
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                        </svg>
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
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
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default InventoryTable;
