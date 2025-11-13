import React, { useEffect } from "react";
import { FaDollarSign, FaCalculator, FaPercentage } from "react-icons/fa";

const VendorPricing = ({ pricingData, onPricingChange, selectedProduct }) => {
    const {
        costPrice = 0,
        sellingPrice = 0,
        discountPercentage = 0,
        finalPrice = 0,
        margin = 0,
    } = pricingData;

    // Auto-calculate final price when selling price or discount changes
    useEffect(() => {
        if (sellingPrice > 0) {
            const calculatedFinalPrice =
                sellingPrice - (sellingPrice * discountPercentage) / 100;
            const calculatedMargin = calculatedFinalPrice - costPrice;

            onPricingChange({
                ...pricingData,
                finalPrice: Math.max(0, calculatedFinalPrice),
                margin: calculatedMargin,
            });
        }
    }, [sellingPrice, discountPercentage, costPrice]);

    const handleInputChange = (field, value) => {
        const numericValue = parseFloat(value) || 0;
        onPricingChange({
            ...pricingData,
            [field]: numericValue,
        });
    };

    const marginPercentage = costPrice > 0 ? (margin / costPrice) * 100 : 0;
    const isProfitable = margin > 0;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                    Pricing Configuration
                </h3>
                <p className="text-text-tertiary text-sm">
                    Set your cost price, selling price, and discount for this
                    product
                </p>
            </div>

            {/* Suggested Base Price Reference */}
            {selectedProduct?.basePrice && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <FaDollarSign className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                            <p className="text-sm font-medium text-blue-800">
                                Suggested Base Price
                            </p>
                            <p className="text-lg font-semibold text-blue-900">
                                ₹
                                {selectedProduct.basePrice.toLocaleString(
                                    "en-IN"
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cost Price */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Cost Price (What you paid) *
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-quaternary">
                            ₹
                        </span>
                        <input
                            type="number"
                            value={costPrice || ""}
                            onChange={(e) =>
                                handleInputChange("costPrice", e.target.value)
                            }
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>
                    <p className="text-xs text-text-quaternary mt-1">
                        Your purchase cost per unit
                    </p>
                </div>

                {/* Selling Price */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Selling Price (Before discount) *
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-quaternary">
                            ₹
                        </span>
                        <input
                            type="number"
                            value={sellingPrice || ""}
                            onChange={(e) =>
                                handleInputChange(
                                    "sellingPrice",
                                    e.target.value
                                )
                            }
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>
                    <p className="text-xs text-text-quaternary mt-1">
                        Price before any discounts
                    </p>
                </div>

                {/* Discount Percentage */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Discount Percentage
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={discountPercentage || ""}
                            onChange={(e) =>
                                handleInputChange(
                                    "discountPercentage",
                                    e.target.value
                                )
                            }
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="0"
                            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-quaternary">
                            %
                        </span>
                    </div>
                    <p className="text-xs text-text-quaternary mt-1">
                        Optional discount to customers
                    </p>
                </div>

                {/* Final Price (Calculated) */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Final Price (After discount)
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-quaternary">
                            ₹
                        </span>
                        <input
                            type="number"
                            value={finalPrice.toFixed(2)}
                            readOnly
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-text-secondary"
                        />
                    </div>
                    <p className="text-xs text-text-quaternary mt-1">
                        Auto-calculated final price
                    </p>
                </div>
            </div>

            {/* Profit Analysis */}
            {costPrice > 0 && sellingPrice > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                        <FaCalculator className="w-4 h-4 text-text-secondary mr-2" />
                        <h4 className="text-md font-medium text-text-primary">
                            Profit Analysis
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Margin Amount */}
                        <div className="text-center">
                            <p className="text-sm text-text-tertiary">
                                Margin Amount
                            </p>
                            <p
                                className={`text-lg font-semibold ${
                                    isProfitable
                                        ? "text-secondary"
                                        : "text-danger"
                                }`}
                            >
                                ₹{margin.toFixed(2)}
                            </p>
                        </div>

                        {/* Margin Percentage */}
                        <div className="text-center">
                            <p className="text-sm text-text-tertiary">
                                Margin %
                            </p>
                            <p
                                className={`text-lg font-semibold ${
                                    isProfitable
                                        ? "text-secondary"
                                        : "text-danger"
                                }`}
                            >
                                {marginPercentage.toFixed(1)}%
                            </p>
                        </div>

                        {/* Profit Status */}
                        <div className="text-center">
                            <p className="text-sm text-text-tertiary">Status</p>
                            <div className="flex items-center justify-center">
                                {isProfitable ? (
                                    <>
                                        <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                                        <span className="text-sm font-medium text-secondary">
                                            Profitable
                                        </span>
                                    </>
                                ) : margin === 0 ? (
                                    <>
                                        <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                                        <span className="text-sm font-medium text-accent">
                                            Break-even
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-2 h-2 bg-danger rounded-full mr-2"></div>
                                        <span className="text-sm font-medium text-danger">
                                            Loss
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pricing Suggestions */}
                    {!isProfitable && costPrice > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                                <strong>Suggestion:</strong> Consider setting
                                selling price above ₹
                                {(costPrice * 1.2).toFixed(2)} for a 20% margin.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Validation Messages */}
            {costPrice > 0 && sellingPrice > 0 && sellingPrice <= costPrice && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">
                        ⚠️ Selling price should be higher than cost price to
                        ensure profitability.
                    </p>
                </div>
            )}
        </div>
    );
};

export default VendorPricing;
