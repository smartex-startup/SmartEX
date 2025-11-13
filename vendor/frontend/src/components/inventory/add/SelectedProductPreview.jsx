import React from "react";
import { FaImage, FaTag, FaBarcode, FaTimes } from "react-icons/fa";

const SelectedProductPreview = ({ product, onClearSelection }) => {
    if (!product) return null;

    // Helper function to format dimensions
    const formatDimensions = (dimensions) => {
        if (!dimensions || typeof dimensions !== "object") return null;

        if (dimensions.length && dimensions.width && dimensions.height) {
            return `${dimensions.length}×${dimensions.width}×${
                dimensions.height
            } ${dimensions.unit || "cm"}`;
        }
        return null;
    };

    // Helper function to format weight
    const formatWeight = (weight) => {
        if (!weight || typeof weight !== "object") return null;
        return `${weight.value} ${weight.unit || "g"}`;
    };

    // Helper function to format specification values
    const formatSpecValue = (key, value) => {
        if (key === "dimensions") {
            return formatDimensions(value);
        }
        if (key === "weight") {
            return formatWeight(value);
        }
        if (typeof value === "object" && value !== null) {
            return `${value.value || value.amount || ""} ${
                value.unit || ""
            }`.trim();
        }
        return value;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">
                    Selected Product
                </h3>
                <button
                    onClick={onClearSelection}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-gray-100"
                    title="Clear selection"
                >
                    <FaTimes className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Top Section: Image, Name, Brand, Description, Price */}
                <div className="flex gap-4 mb-4">
                    {/* Product Image */}
                    <div className="shrink-0">
                        {product.images?.[0]?.url ? (
                            <img
                                src={product.images[0].url}
                                alt={product.images[0].altText || product.name}
                                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                onError={(e) => {
                                    e.target.style.display = "none";
                                }}
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
                                <FaImage className="w-6 h-6 text-gray-300" />
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                        {/* Product Name */}
                        <h4 className="font-semibold text-gray-900 text-base leading-tight mb-1 truncate">
                            {product.name}
                        </h4>

                        {/* Brand */}
                        <p className="text-sm text-gray-600 mb-2">
                            by {product.brand}
                        </p>

                        {/* Description - Single line with ellipsis */}
                        {product.description && (
                            <p className="text-sm text-gray-500 mb-2 truncate">
                                {product.description}
                            </p>
                        )}

                        {/* Category */}
                        {product.category && (
                            <div className="flex items-center mb-2">
                                <FaTag className="w-3 h-3 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500">
                                    {product.category.name || product.category}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    {product.basePrice && (
                        <div className="text-right shrink-0">
                            <p className="text-xs text-gray-500">Base Price</p>
                            <p className="text-lg font-bold text-blue-600">
                                ₹{product.basePrice.toLocaleString("en-IN")}
                            </p>
                        </div>
                    )}
                </div>

                {/* Bottom Section: Physical Properties and Specifications Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Physical Properties Card */}
                    {(product.specifications?.dimensions ||
                        product.specifications?.weight) && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                                Physical Properties
                            </h5>
                            <div className="space-y-2">
                                {product.specifications.dimensions && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">
                                            Dimensions:
                                        </span>
                                        <span className="text-xs font-medium text-gray-900">
                                            {formatDimensions(
                                                product.specifications
                                                    .dimensions
                                            )}
                                        </span>
                                    </div>
                                )}
                                {product.specifications.weight && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">
                                            Weight:
                                        </span>
                                        <span className="text-xs font-medium text-gray-900">
                                            {formatWeight(
                                                product.specifications.weight
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Specifications Card */}
                    {product.specifications &&
                        Object.keys(product.specifications).filter(
                            (key) =>
                                key !== "dimensions" &&
                                key !== "weight" &&
                                key !== "nutritionalInfo"
                        ).length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                                    Specifications
                                </h5>
                                <div className="space-y-2">
                                    {Object.entries(product.specifications)
                                        .filter(
                                            ([key]) =>
                                                key !== "dimensions" &&
                                                key !== "weight" &&
                                                key !== "nutritionalInfo"
                                        )
                                        .slice(0, 3)
                                        .map(([key, value]) => {
                                            const formattedValue =
                                                formatSpecValue(key, value);
                                            if (!formattedValue) return null;

                                            return (
                                                <div
                                                    key={key}
                                                    className="flex justify-between items-center"
                                                >
                                                    <span className="text-xs text-gray-600 capitalize">
                                                        {key
                                                            .replace(
                                                                /([A-Z])/g,
                                                                " $1"
                                                            )
                                                            .toLowerCase()}
                                                        :
                                                    </span>
                                                    <span className="text-xs font-medium text-gray-900 text-right truncate">
                                                        {formattedValue}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        )}
                </div>

                {/* HSN Code (if exists) */}
                {product.hsn && (
                    <div className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded-lg border border-yellow-200 mt-4">
                        <div className="flex items-center">
                            <FaBarcode className="w-3 h-3 text-gray-500 mr-2" />
                            <span className="text-xs font-medium text-gray-700">
                                HSN Code:
                            </span>
                        </div>
                        <span className="text-xs font-mono text-gray-900 bg-white px-2 py-1 rounded border">
                            {product.hsn}
                        </span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                        Ready to configure inventory details
                    </span>
                    <div className="flex items-center text-green-600">
                        <span className="text-xs font-medium mr-2">
                            Selected
                        </span>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectedProductPreview;
