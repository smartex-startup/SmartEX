import React from "react";
import { FaBox, FaEdit, FaEye, FaImage } from "react-icons/fa";
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
                badgeClass = "bg-red-50 text-danger-dark";
                text = "Out of Stock";
                break;
            case "low_stock":
                badgeClass = "bg-yellow-50 text-accent-dark";
                text = "Low Stock";
                break;
            case "available":
                badgeClass = "bg-green-50 text-secondary-dark";
                text = "Available";
                break;
            case "discontinued":
                badgeClass = "bg-gray-50 text-text-tertiary";
                text = "Discontinued";
                break;
            default:
                badgeClass = "bg-gray-50 text-text-tertiary";
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
            badgeClass = "bg-red-50 text-danger-dark";
            text = "Expired";
        } else if (daysToExpiry <= 7) {
            badgeClass = "bg-red-50 text-danger-dark";
            text = `${daysToExpiry} days`;
        } else if (daysToExpiry <= 30) {
            badgeClass = "bg-yellow-50 text-accent-dark";
            text = `${daysToExpiry} days`;
        } else {
            badgeClass = "bg-green-50 text-secondary-dark";
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
        if (!pricing)
            return <span className="text-sm text-text-tertiary">-</span>;

        const hasDiscount =
            pricing.discountedPrice &&
            pricing.discountedPrice < pricing.finalPrice;

        return (
            <div className="space-y-1">
                <div className="flex items-center space-x-2">
                    <span className="font-medium text-text-primary">
                        ₹{pricing.finalPrice?.toLocaleString("en-IN") || "0"}
                    </span>
                </div>
                {hasDiscount && (
                    <div className="text-sm text-text-tertiary">
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
                    <span className="text-sm font-medium text-text-secondary">
                        Product
                    </span>
                </div>

                {/* Category */}
                <div className="col-span-2">
                    <span className="text-sm font-medium text-text-secondary">
                        Category
                    </span>
                </div>

                {/* Price */}
                <div className="col-span-2">
                    <span className="text-sm font-medium text-text-secondary">
                        Price
                    </span>
                </div>

                {/* Stock */}
                <div className="col-span-1">
                    <span className="text-sm font-medium text-text-secondary">
                        Stock
                    </span>
                </div>

                {/* Status */}
                <div className="col-span-2">
                    <span className="text-sm font-medium text-text-secondary">
                        Status
                    </span>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                    <span className="text-sm font-medium text-text-secondary">
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
                            <FaBox className="w-12 h-12 text-text-quaternary" />
                        </div>
                        <h3 className="text-lg font-medium text-text-primary mb-2">
                            No inventory items found
                        </h3>
                        <p className="text-text-tertiary mb-6">
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
                                            <FaImage className="w-6 h-6 text-text-quaternary" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-text-primary truncate">
                                        {item.product?.name ||
                                            "Unknown Product"}
                                    </h3>
                                    <p className="text-sm text-text-tertiary truncate">
                                        {item.product?.brand || "Unknown Brand"}
                                    </p>
                                </div>
                            </div>

                            {/* Category */}
                            <div className="col-span-2 flex items-center">
                                <span className="text-sm text-text-secondary">
                                    {item.product?.category || "-"}
                                </span>
                            </div>

                            {/* Price */}
                            <div className="col-span-2 flex items-center">
                                <PriceDisplay pricing={item.pricing} />
                            </div>

                            {/* Stock */}
                            <div className="col-span-1 flex items-center">
                                <div className="text-sm font-medium text-text-primary">
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
                                    <button className="p-1 text-text-quaternary hover:text-primary transition-colors">
                                        <FaEdit className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 text-text-quaternary hover:text-primary transition-colors">
                                        <FaEye className="w-4 h-4" />
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
