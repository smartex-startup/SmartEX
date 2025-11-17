import React from "react";
import { FaBoxes, FaWarehouse } from "react-icons/fa";

const VendorInventory = ({
    inventoryData,
    onInventoryChange,
    selectedProduct,
}) => {
    const { currentStock = 0, minStockLevel = 0, addStock = 0 } = inventoryData;

    const handleInputChange = (field, value) => {
        const numericValue = parseInt(value) || 0;
        onInventoryChange({
            ...inventoryData,
            [field]: numericValue,
        });
    };

    const newTotalStock = currentStock + addStock;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                    Inventory Management
                </h3>
                <p className="text-text-tertiary text-sm">
                    Configure stock levels for this product
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
            </div>

            {/* Stock Calculation Preview */}
            {addStock > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-medium text-text-primary mb-3 flex items-center">
                        <FaBoxes className="w-4 h-4 mr-2" />
                        Stock Summary After Addition
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-50 text-green-600">
                                ✅ Stock Ready
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorInventory;
