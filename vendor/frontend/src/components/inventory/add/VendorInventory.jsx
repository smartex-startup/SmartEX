import React from "react";
import {
    FaBoxes,
    FaWarehouse,
    FaExclamationTriangle,
    FaInfoCircle,
} from "react-icons/fa";

const VendorInventory = ({
    inventoryData,
    onInventoryChange,
    selectedProduct,
}) => {
    const {
        currentStock = 0,
        minStockLevel = 0,
        maxStockLevel = 0,
        reorderPoint = 0,
        addStock = 0,
    } = inventoryData;

    const handleInputChange = (field, value) => {
        const numericValue = parseInt(value) || 0;
        onInventoryChange({
            ...inventoryData,
            [field]: numericValue,
        });
    };

    const newTotalStock = currentStock + addStock;
    const stockStatus = getStockStatus(
        newTotalStock,
        minStockLevel,
        maxStockLevel,
        reorderPoint
    );

    function getStockStatus(stock, minLevel, maxLevel, reorderPoint) {
        if (maxLevel > 0 && stock > maxLevel) {
            return {
                level: "overstocked",
                color: "text-purple-600",
                bg: "bg-purple-50",
                border: "border-purple-200",
            };
        } else if (stock <= reorderPoint) {
            return {
                level: "reorder",
                color: "text-accent",
                bg: "bg-yellow-50",
                border: "border-yellow-200",
            };
        } else if (stock <= minLevel) {
            return {
                level: "low",
                color: "text-danger",
                bg: "bg-red-50",
                border: "border-red-200",
            };
        } else if (minLevel > 0 && stock >= minLevel * 2) {
            return {
                level: "good",
                color: "text-secondary",
                bg: "bg-green-50",
                border: "border-green-200",
            };
        } else {
            return {
                level: "adequate",
                color: "text-primary",
                bg: "bg-blue-50",
                border: "border-blue-200",
            };
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                    Inventory Management
                </h3>
                <p className="text-text-tertiary text-sm">
                    Configure stock levels and inventory settings for this
                    product
                </p>
            </div>

            {/* Current Stock Information */}
            {currentStock > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <FaWarehouse className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                            <p className="text-sm font-medium text-blue-800">
                                Current Stock Level
                            </p>
                            <p className="text-lg font-semibold text-blue-900">
                                {currentStock}{" "}
                                {selectedProduct?.unit || "units"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add Stock */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Add Stock Quantity *
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={addStock || ""}
                            onChange={(e) =>
                                handleInputChange("addStock", e.target.value)
                            }
                            min="1"
                            placeholder="0"
                            className="w-full pl-3 pr-16 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            required
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-quaternary text-sm">
                            {selectedProduct?.unit || "units"}
                        </span>
                    </div>
                    <p className="text-xs text-text-quaternary mt-1">
                        Quantity you're adding to inventory
                    </p>
                </div>

                {/* Min Stock Level */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Minimum Stock Level
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={minStockLevel || ""}
                            onChange={(e) =>
                                handleInputChange(
                                    "minStockLevel",
                                    e.target.value
                                )
                            }
                            min="0"
                            placeholder="0"
                            className="w-full pl-3 pr-16 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-quaternary text-sm">
                            {selectedProduct?.unit || "units"}
                        </span>
                    </div>
                    <p className="text-xs text-text-quaternary mt-1">
                        Alert when stock goes below this level
                    </p>
                </div>

                {/* Reorder Point */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Reorder Point
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={reorderPoint || ""}
                            onChange={(e) =>
                                handleInputChange(
                                    "reorderPoint",
                                    e.target.value
                                )
                            }
                            min="0"
                            placeholder="0"
                            className="w-full pl-3 pr-16 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-quaternary text-sm">
                            {selectedProduct?.unit || "units"}
                        </span>
                    </div>
                    <p className="text-xs text-text-quaternary mt-1">
                        Trigger reorder when stock hits this level
                    </p>
                </div>

                {/* Max Stock Level */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Maximum Stock Level
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={maxStockLevel || ""}
                            onChange={(e) =>
                                handleInputChange(
                                    "maxStockLevel",
                                    e.target.value
                                )
                            }
                            min="0"
                            placeholder="0"
                            className="w-full pl-3 pr-16 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-quaternary text-sm">
                            {selectedProduct?.unit || "units"}
                        </span>
                    </div>
                    <p className="text-xs text-text-quaternary mt-1">
                        Maximum storage capacity for this product
                    </p>
                </div>
            </div>

            {/* Stock Calculation Preview */}
            {addStock > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-medium text-text-primary mb-3 flex items-center">
                        <FaBoxes className="w-4 h-4 mr-2" />
                        Stock Summary After Addition
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Current + New */}
                        <div className="text-center">
                            <p className="text-sm text-text-tertiary">
                                Total After Addition
                            </p>
                            <p className="text-xl font-semibold text-text-primary">
                                {newTotalStock}
                            </p>
                            <p className="text-xs text-text-quaternary">
                                {currentStock} + {addStock}{" "}
                                {selectedProduct?.unit || "units"}
                            </p>
                        </div>

                        {/* Stock Status */}
                        <div className="text-center">
                            <p className="text-sm text-text-tertiary">
                                Stock Status
                            </p>
                            <div
                                className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}
                            >
                                {stockStatus.level === "overstocked" &&
                                    "📦 Overstocked"}
                                {stockStatus.level === "good" &&
                                    "✅ Good Level"}
                                {stockStatus.level === "adequate" &&
                                    "ℹ️ Adequate"}
                                {stockStatus.level === "reorder" &&
                                    "⚠️ Reorder Soon"}
                                {stockStatus.level === "low" && "🚨 Low Stock"}
                            </div>
                        </div>

                        {/* Days Until Reorder (Estimate) */}
                        <div className="text-center">
                            <p className="text-sm text-text-tertiary">
                                Est. Coverage
                            </p>
                            <p className="text-lg font-semibold text-text-secondary">
                                {reorderPoint > 0
                                    ? `${Math.floor(
                                          (newTotalStock - reorderPoint) /
                                              Math.max(1, reorderPoint / 7)
                                      )} days`
                                    : "—"}
                            </p>
                            <p className="text-xs text-text-quaternary">
                                Until reorder point
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock Level Warnings */}
            <div className="space-y-3">
                {/* Overstocking Warning */}
                {maxStockLevel > 0 && newTotalStock > maxStockLevel && (
                    <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                        <div className="flex">
                            <FaExclamationTriangle className="w-4 h-4 text-purple-600 mt-0.5 mr-2" />
                            <div>
                                <p className="text-sm font-medium text-purple-800">
                                    Overstocking Alert
                                </p>
                                <p className="text-sm text-purple-600">
                                    Adding {addStock} units will exceed your
                                    maximum stock level by{" "}
                                    {newTotalStock - maxStockLevel} units.
                                    Consider reducing the quantity.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Low Reorder Point Warning */}
                {minStockLevel > 0 &&
                    reorderPoint > 0 &&
                    reorderPoint <= minStockLevel && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <div className="flex">
                                <FaInfoCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">
                                        Inventory Setup Tip
                                    </p>
                                    <p className="text-sm text-yellow-600">
                                        Consider setting reorder point higher
                                        than minimum stock level for better
                                        inventory management.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                {/* Zero Stock Validation */}
                {addStock === 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <div className="flex">
                            <FaExclamationTriangle className="w-4 h-4 text-red-600 mt-0.5 mr-2" />
                            <div>
                                <p className="text-sm font-medium text-red-800">
                                    Stock Required
                                </p>
                                <p className="text-sm text-red-600">
                                    Please specify the quantity you want to add
                                    to your inventory.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Inventory Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="text-sm font-medium text-blue-800 mb-2">
                    💡 Inventory Management Tips
                </h5>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                        • Set reorder point at 150-200% of minimum stock level
                    </li>
                    <li>• Monitor expiry dates for perishable products</li>
                    <li>• Track sales velocity to optimize stock levels</li>
                    <li>• Consider seasonal demand variations</li>
                </ul>
            </div>
        </div>
    );
};

export default VendorInventory;
