import React from "react";
import {
    FaCog,
    FaEye,
    FaEyeSlash,
    FaShippingFast,
    FaTags,
    FaInfoCircle,
    FaGlobe,
    FaWarehouse,
    FaBox,
} from "react-icons/fa";

const VendorSettings = ({
    settingsData,
    onSettingsChange,
    selectedProduct,
}) => {
    const {
        isVisible = true,
        allowOnlineOrders = true,
        enableLocalDelivery = false,
        deliveryRadius = 5,
        deliveryFee = 0,
        freeDeliveryThreshold = 0,
        customTags = [],
        specialNotes = "",
        storageConditions = "",
        handlingInstructions = "",
        warrantyPeriod = 0,
        returnPolicy = "",
    } = settingsData;

    const handleInputChange = (field, value) => {
        if (field === "customTags") {
            onSettingsChange({
                ...settingsData,
                [field]: value,
            });
        } else if (
            [
                "deliveryRadius",
                "deliveryFee",
                "freeDeliveryThreshold",
                "warrantyPeriod",
            ].includes(field)
        ) {
            onSettingsChange({
                ...settingsData,
                [field]: parseFloat(value) || 0,
            });
        } else if (typeof value === "boolean") {
            onSettingsChange({
                ...settingsData,
                [field]: value,
            });
        } else {
            onSettingsChange({
                ...settingsData,
                [field]: value,
            });
        }
    };

    const handleTagsChange = (tagsString) => {
        const tagsArray = tagsString
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);
        handleInputChange("customTags", tagsArray);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                    Product Settings & Configuration
                </h3>
                <p className="text-text-tertiary text-sm">
                    Configure visibility, delivery options, and additional
                    product settings
                </p>
            </div>

            {/* Visibility & Availability */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <h4 className="text-md font-medium text-text-primary flex items-center">
                    <FaEye className="w-4 h-4 mr-2" />
                    Visibility & Availability
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Product Visibility */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                            {isVisible ? (
                                <FaEye className="w-4 h-4 text-secondary mr-2" />
                            ) : (
                                <FaEyeSlash className="w-4 h-4 text-text-quaternary mr-2" />
                            )}
                            <div>
                                <p className="text-sm font-medium text-text-primary">
                                    Product Visible
                                </p>
                                <p className="text-xs text-text-tertiary">
                                    Show product to customers
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isVisible}
                                onChange={(e) =>
                                    handleInputChange(
                                        "isVisible",
                                        e.target.checked
                                    )
                                }
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    {/* Online Orders */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                            <FaGlobe className="w-4 h-4 text-primary mr-2" />
                            <div>
                                <p className="text-sm font-medium text-text-primary">
                                    Allow Online Orders
                                </p>
                                <p className="text-xs text-text-tertiary">
                                    Accept orders through platform
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={allowOnlineOrders}
                                onChange={(e) =>
                                    handleInputChange(
                                        "allowOnlineOrders",
                                        e.target.checked
                                    )
                                }
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Delivery Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <h4 className="text-md font-medium text-text-primary flex items-center">
                    <FaShippingFast className="w-4 h-4 mr-2" />
                    Delivery & Shipping
                </h4>

                {/* Enable Local Delivery */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                        <FaShippingFast className="w-4 h-4 text-accent mr-2" />
                        <div>
                            <p className="text-sm font-medium text-text-primary">
                                Local Delivery
                            </p>
                            <p className="text-xs text-text-tertiary">
                                Offer delivery in your area
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={enableLocalDelivery}
                            onChange={(e) =>
                                handleInputChange(
                                    "enableLocalDelivery",
                                    e.target.checked
                                )
                            }
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                {/* Delivery Options */}
                {enableLocalDelivery && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Delivery Radius (km)
                            </label>
                            <input
                                type="number"
                                value={deliveryRadius || ""}
                                onChange={(e) =>
                                    handleInputChange(
                                        "deliveryRadius",
                                        e.target.value
                                    )
                                }
                                min="1"
                                max="50"
                                step="0.5"
                                placeholder="5"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Delivery Fee (₹)
                            </label>
                            <input
                                type="number"
                                value={deliveryFee || ""}
                                onChange={(e) =>
                                    handleInputChange(
                                        "deliveryFee",
                                        e.target.value
                                    )
                                }
                                min="0"
                                step="0.01"
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Free Delivery Above (₹)
                            </label>
                            <input
                                type="number"
                                value={freeDeliveryThreshold || ""}
                                onChange={(e) =>
                                    handleInputChange(
                                        "freeDeliveryThreshold",
                                        e.target.value
                                    )
                                }
                                min="0"
                                step="0.01"
                                placeholder="500"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Product Tags */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <h4 className="text-md font-medium text-text-primary flex items-center">
                    <FaTags className="w-4 h-4 mr-2" />
                    Product Tags & Labels
                </h4>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Custom Tags
                    </label>
                    <input
                        type="text"
                        value={customTags.join(", ")}
                        onChange={(e) => handleTagsChange(e.target.value)}
                        placeholder="organic, local, premium, fresh (separate with commas)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    <p className="text-xs text-text-quaternary mt-1">
                        Add custom tags to help customers find your product
                        (separate with commas)
                    </p>

                    {/* Tag Preview */}
                    {customTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {customTags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Storage & Handling */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <h4 className="text-md font-medium text-text-primary flex items-center">
                    <FaWarehouse className="w-4 h-4 mr-2" />
                    Storage & Handling
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Storage Conditions
                        </label>
                        <select
                            value={storageConditions}
                            onChange={(e) =>
                                handleInputChange(
                                    "storageConditions",
                                    e.target.value
                                )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="">Select storage conditions</option>
                            <option value="room-temperature">
                                Room Temperature
                            </option>
                            <option value="refrigerated">
                                Refrigerated (2-8°C)
                            </option>
                            <option value="frozen">Frozen (-18°C)</option>
                            <option value="dry-cool">Dry & Cool Place</option>
                            <option value="humidity-controlled">
                                Humidity Controlled
                            </option>
                            <option value="temperature-controlled">
                                Temperature Controlled
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Warranty Period (Days)
                        </label>
                        <input
                            type="number"
                            value={warrantyPeriod || ""}
                            onChange={(e) =>
                                handleInputChange(
                                    "warrantyPeriod",
                                    e.target.value
                                )
                            }
                            min="0"
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Handling Instructions
                    </label>
                    <textarea
                        value={handlingInstructions}
                        onChange={(e) =>
                            handleInputChange(
                                "handlingInstructions",
                                e.target.value
                            )
                        }
                        rows="3"
                        placeholder="Special handling instructions for this product..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <h4 className="text-md font-medium text-text-primary flex items-center">
                    <FaBox className="w-4 h-4 mr-2" />
                    Additional Information
                </h4>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Return Policy
                    </label>
                    <select
                        value={returnPolicy}
                        onChange={(e) =>
                            handleInputChange("returnPolicy", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                        <option value="">Select return policy</option>
                        <option value="no-returns">No Returns</option>
                        <option value="defective-only">
                            Defective Products Only
                        </option>
                        <option value="7-days">7 Days Return</option>
                        <option value="15-days">15 Days Return</option>
                        <option value="30-days">30 Days Return</option>
                        <option value="custom">Custom Policy</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Special Notes
                    </label>
                    <textarea
                        value={specialNotes}
                        onChange={(e) =>
                            handleInputChange("specialNotes", e.target.value)
                        }
                        rows="3"
                        placeholder="Any special notes or instructions for customers..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                </div>
            </div>

            {/* Configuration Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                    <FaInfoCircle className="w-4 h-4 mr-2" />
                    Configuration Summary
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-blue-600">Visibility:</p>
                        <p className="font-medium text-blue-800">
                            {isVisible ? "✅ Visible" : "❌ Hidden"}
                        </p>
                    </div>
                    <div>
                        <p className="text-blue-600">Online Orders:</p>
                        <p className="font-medium text-blue-800">
                            {allowOnlineOrders ? "✅ Enabled" : "❌ Disabled"}
                        </p>
                    </div>
                    <div>
                        <p className="text-blue-600">Delivery:</p>
                        <p className="font-medium text-blue-800">
                            {enableLocalDelivery
                                ? `✅ ${deliveryRadius}km`
                                : "❌ Pickup Only"}
                        </p>
                    </div>
                    <div>
                        <p className="text-blue-600">Tags:</p>
                        <p className="font-medium text-blue-800">
                            {customTags.length > 0
                                ? `${customTags.length} tags`
                                : "No tags"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorSettings;
