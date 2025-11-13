import React from "react";
import {
    FaCheck,
    FaEdit,
    FaExclamationTriangle,
    FaCalendarAlt,
    FaDollarSign,
    FaBoxes,
    FaCog,
    FaInfoCircle,
    FaShippingFast,
    FaTags,
} from "react-icons/fa";

const AddInventoryReview = ({
    selectedProduct,
    pricingData,
    inventoryData,
    expiryData,
    settingsData,
    onEditSection,
    isSubmitting,
}) => {
    const {
        costPrice = 0,
        sellingPrice = 0,
        discountPercentage = 0,
        finalPrice = 0,
        margin = 0,
    } = pricingData;

    const {
        addStock = 0,
        minStockLevel = 0,
        maxStockLevel = 0,
        reorderPoint = 0,
        currentStock = 0,
    } = inventoryData;

    const { batches = [], enableBatchTracking = false } = expiryData;

    const {
        isVisible = true,
        allowOnlineOrders = true,
        enableLocalDelivery = false,
        deliveryRadius = 0,
        deliveryFee = 0,
        customTags = [],
    } = settingsData;

    // Validation checks
    const validations = {
        hasSelectedProduct: !!selectedProduct,
        hasPricing: costPrice > 0 && sellingPrice > 0,
        hasStock: addStock > 0,
        batchQuantityMatches:
            !enableBatchTracking ||
            batches.reduce((sum, batch) => sum + (batch.quantity || 0), 0) ===
                addStock,
        isProfitable: margin >= 0,
    };

    const canSubmit = Object.values(validations).every((v) => v);

    const newTotalStock = currentStock + addStock;
    const isProfitable = margin > 0;

    const getExpiryStatus = (expiryDate) => {
        if (!expiryDate) return null;

        const today = new Date();
        const expiry = new Date(expiryDate);
        const daysUntilExpiry = Math.ceil(
            (expiry - today) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry < 0) {
            return { status: "expired", color: "text-red-600" };
        } else if (daysUntilExpiry <= 7) {
            return { status: "critical", color: "text-red-600" };
        } else if (daysUntilExpiry <= 30) {
            return { status: "warning", color: "text-yellow-600" };
        } else {
            return { status: "good", color: "text-green-600" };
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                    Review & Confirm
                </h3>
                <p className="text-text-tertiary text-sm">
                    Review all details before adding this product to your
                    inventory
                </p>
            </div>

            {/* Validation Status */}
            <div
                className={`border rounded-lg p-4 ${
                    canSubmit
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                }`}
            >
                <div className="flex items-center mb-3">
                    {canSubmit ? (
                        <>
                            <FaCheck className="w-5 h-5 text-green-600 mr-2" />
                            <h4 className="text-md font-medium text-green-800">
                                Ready to Submit
                            </h4>
                        </>
                    ) : (
                        <>
                            <FaExclamationTriangle className="w-5 h-5 text-red-600 mr-2" />
                            <h4 className="text-md font-medium text-red-800">
                                Please Complete Required Fields
                            </h4>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div
                        className={`flex items-center ${
                            validations.hasSelectedProduct
                                ? "text-green-700"
                                : "text-red-700"
                        }`}
                    >
                        {validations.hasSelectedProduct ? "✅" : "❌"} Product
                        Selected
                    </div>
                    <div
                        className={`flex items-center ${
                            validations.hasPricing
                                ? "text-green-700"
                                : "text-red-700"
                        }`}
                    >
                        {validations.hasPricing ? "✅" : "❌"} Pricing
                        Configured
                    </div>
                    <div
                        className={`flex items-center ${
                            validations.hasStock
                                ? "text-green-700"
                                : "text-red-700"
                        }`}
                    >
                        {validations.hasStock ? "✅" : "❌"} Stock Quantity
                    </div>
                    <div
                        className={`flex items-center ${
                            validations.batchQuantityMatches
                                ? "text-green-700"
                                : "text-red-700"
                        }`}
                    >
                        {validations.batchQuantityMatches ? "✅" : "❌"} Batch
                        Quantities
                    </div>
                </div>

                {!validations.isProfitable && (
                    <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                        ⚠️ Warning: This pricing configuration will result in a
                        loss or break-even
                    </div>
                )}
            </div>

            {/* Product Summary */}
            {selectedProduct && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-md font-medium text-text-primary flex items-center">
                            <FaInfoCircle className="w-4 h-4 mr-2" />
                            Selected Product
                        </h4>
                        <button
                            type="button"
                            onClick={() => onEditSection("product")}
                            className="text-primary hover:text-primary/80 text-sm flex items-center"
                            disabled={isSubmitting}
                        >
                            <FaEdit className="w-3 h-3 mr-1" />
                            Change
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <img
                            src={
                                selectedProduct.image ||
                                "/api/placeholder/60/60"
                            }
                            alt={selectedProduct.name}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                        />
                        <div className="flex-1">
                            <h5 className="font-medium text-text-primary">
                                {selectedProduct.name}
                            </h5>
                            <p className="text-sm text-text-secondary">
                                {selectedProduct.brand}
                            </p>
                            <p className="text-xs text-text-tertiary">
                                {selectedProduct.category} •{" "}
                                {selectedProduct.unit}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Pricing Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-text-primary flex items-center">
                        <FaDollarSign className="w-4 h-4 mr-2" />
                        Pricing
                    </h4>
                    <button
                        type="button"
                        onClick={() => onEditSection("pricing")}
                        className="text-primary hover:text-primary/80 text-sm flex items-center"
                        disabled={isSubmitting}
                    >
                        <FaEdit className="w-3 h-3 mr-1" />
                        Edit
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-text-tertiary">Cost Price</p>
                        <p className="font-medium text-text-primary">
                            ₹{costPrice.toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <p className="text-text-tertiary">Selling Price</p>
                        <p className="font-medium text-text-primary">
                            ₹{sellingPrice.toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <p className="text-text-tertiary">Final Price</p>
                        <p className="font-medium text-text-primary">
                            ₹{finalPrice.toFixed(2)}
                            {discountPercentage > 0 && (
                                <span className="text-xs text-text-quaternary ml-1">
                                    (-{discountPercentage}%)
                                </span>
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-text-tertiary">Margin</p>
                        <p
                            className={`font-medium ${
                                isProfitable ? "text-secondary" : "text-danger"
                            }`}
                        >
                            ₹{margin.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Inventory Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-text-primary flex items-center">
                        <FaBoxes className="w-4 h-4 mr-2" />
                        Inventory
                    </h4>
                    <button
                        type="button"
                        onClick={() => onEditSection("inventory")}
                        className="text-primary hover:text-primary/80 text-sm flex items-center"
                        disabled={isSubmitting}
                    >
                        <FaEdit className="w-3 h-3 mr-1" />
                        Edit
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-text-tertiary">Adding Stock</p>
                        <p className="font-medium text-text-primary">
                            {addStock} {selectedProduct?.unit || "units"}
                        </p>
                    </div>
                    <div>
                        <p className="text-text-tertiary">New Total</p>
                        <p className="font-medium text-text-primary">
                            {newTotalStock} {selectedProduct?.unit || "units"}
                        </p>
                    </div>
                    <div>
                        <p className="text-text-tertiary">Min Level</p>
                        <p className="font-medium text-text-primary">
                            {minStockLevel || "Not set"}
                        </p>
                    </div>
                    <div>
                        <p className="text-text-tertiary">Reorder Point</p>
                        <p className="font-medium text-text-primary">
                            {reorderPoint || "Not set"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Expiry & Batches Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-text-primary flex items-center">
                        <FaCalendarAlt className="w-4 h-4 mr-2" />
                        Expiry & Batches
                    </h4>
                    <button
                        type="button"
                        onClick={() => onEditSection("expiry")}
                        className="text-primary hover:text-primary/80 text-sm flex items-center"
                        disabled={isSubmitting}
                    >
                        <FaEdit className="w-3 h-3 mr-1" />
                        Edit
                    </button>
                </div>

                {enableBatchTracking ? (
                    <div>
                        <p className="text-sm text-text-secondary mb-2">
                            Batch tracking enabled with {batches.length}{" "}
                            batch(es)
                        </p>
                        <div className="space-y-2">
                            {batches.slice(0, 3).map((batch, index) => {
                                const expiryStatus = getExpiryStatus(
                                    batch.expiryDate
                                );
                                return (
                                    <div
                                        key={batch.id}
                                        className="flex items-center justify-between text-sm bg-gray-50 rounded p-2"
                                    >
                                        <span className="font-medium">
                                            {batch.batchNumber}
                                        </span>
                                        <span>
                                            {batch.quantity}{" "}
                                            {selectedProduct?.unit}
                                        </span>
                                        {batch.expiryDate && (
                                            <span
                                                className={
                                                    expiryStatus?.color ||
                                                    "text-text-tertiary"
                                                }
                                            >
                                                {new Date(
                                                    batch.expiryDate
                                                ).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                            {batches.length > 3 && (
                                <p className="text-xs text-text-quaternary">
                                    +{batches.length - 3} more batches
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-sm">
                        {batches[0]?.expiryDate ? (
                            <div className="flex items-center justify-between">
                                <span className="text-text-secondary">
                                    Single expiry date:
                                </span>
                                <span className="font-medium">
                                    {new Date(
                                        batches[0].expiryDate
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        ) : (
                            <span className="text-text-quaternary">
                                No expiry date set
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Settings Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-text-primary flex items-center">
                        <FaCog className="w-4 h-4 mr-2" />
                        Settings
                    </h4>
                    <button
                        type="button"
                        onClick={() => onEditSection("settings")}
                        className="text-primary hover:text-primary/80 text-sm flex items-center"
                        disabled={isSubmitting}
                    >
                        <FaEdit className="w-3 h-3 mr-1" />
                        Edit
                    </button>
                </div>

                <div className="space-y-3 text-sm">
                    {/* Visibility & Orders */}
                    <div className="flex items-center justify-between">
                        <span className="text-text-secondary">
                            Product Visibility:
                        </span>
                        <span
                            className={`font-medium ${
                                isVisible
                                    ? "text-secondary"
                                    : "text-text-quaternary"
                            }`}
                        >
                            {isVisible ? "Visible" : "Hidden"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-text-secondary">
                            Online Orders:
                        </span>
                        <span
                            className={`font-medium ${
                                allowOnlineOrders
                                    ? "text-secondary"
                                    : "text-text-quaternary"
                            }`}
                        >
                            {allowOnlineOrders ? "Enabled" : "Disabled"}
                        </span>
                    </div>

                    {/* Delivery */}
                    {enableLocalDelivery && (
                        <div className="flex items-center justify-between">
                            <span className="text-text-secondary flex items-center">
                                <FaShippingFast className="w-3 h-3 mr-1" />
                                Local Delivery:
                            </span>
                            <span className="font-medium text-text-primary">
                                {deliveryRadius}km radius
                                {deliveryFee > 0 && ` • ₹${deliveryFee} fee`}
                            </span>
                        </div>
                    )}

                    {/* Tags */}
                    {customTags.length > 0 && (
                        <div className="flex items-start justify-between">
                            <span className="text-text-secondary flex items-center">
                                <FaTags className="w-3 h-3 mr-1" />
                                Tags:
                            </span>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                                {customTags.slice(0, 3).map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {customTags.length > 3 && (
                                    <span className="text-xs text-text-quaternary">
                                        +{customTags.length - 3}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Final Notes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="text-sm font-medium text-blue-800 mb-2">
                    📝 What happens next?
                </h5>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                        • Product will be added to your inventory with specified
                        stock
                    </li>
                    <li>• Pricing and visibility settings will be applied</li>
                    <li>
                        • You can modify these settings anytime from inventory
                        management
                    </li>
                    <li>
                        • Track sales and stock movements from your dashboard
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default AddInventoryReview;
