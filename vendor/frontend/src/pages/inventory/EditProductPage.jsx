import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    FaArrowLeft,
    FaSave,
    FaTimes,
    FaRupeeSign,
    FaBox,
    FaCalendarAlt,
    FaCog,
    FaChevronRight,
    FaPlus,
    FaTrash,
    FaExclamationTriangle,
    FaInfoCircle,
} from "react-icons/fa";
import { getProduct, updateProduct } from "../../api/inventory.api.js";
import logger from "../../utils/logger.util.js";
import Loader from "../../components/common/Loader.jsx";

const EditProductPage = () => {
    const { vendorProductId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [originalData, setOriginalData] = useState(null);
    const [formData, setFormData] = useState({
        pricing: {
            costPrice: 0,
            sellingPrice: 0,
            discountPercentage: 0,
        },
        inventory: {
            currentStock: 0,
            minStockLevel: 5,
            maxStockLevel: 100,
            reservedStock: 0,
        },
        expiryTracking: {
            hasExpiry: false,
            batches: [],
        },
        settings: {
            isActive: true,
            isVisible: true,
            autoRestock: false,
            autoDiscountNearExpiry: false,
            hideWhenOutOfStock: false,
            minOrderQuantity: 1,
            maxOrderQuantity: 10,
        },
    });
    const [newBatch, setNewBatch] = useState({
        batchNumber: "",
        quantity: 0,
        expiryDate: "",
    });

    useEffect(() => {
        loadProductData();
    }, [vendorProductId]);

    const loadProductData = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getProduct(vendorProductId);

            if (response.success) {
                const productData = response.data;
                setOriginalData(productData);
                setFormData({
                    pricing: { ...productData.pricing },
                    inventory: { ...productData.inventory },
                    expiryTracking: {
                        hasExpiry:
                            productData.expiryTracking?.hasExpiry || false,
                        batches: productData.expiryTracking?.batches || [],
                    },
                    settings: { ...productData.settings },
                });
                logger.info("Product data loaded for editing");
            } else {
                throw new Error(
                    response.message || "Failed to load product data"
                );
            }
        } catch (err) {
            logger.error("Error loading product data:", err);
            setError(err.message || "Failed to load product details");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (section, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const addBatch = () => {
        if (
            !newBatch.batchNumber ||
            !newBatch.quantity ||
            !newBatch.expiryDate
        ) {
            setError("Please fill in all batch details");
            return;
        }

        const batch = {
            ...newBatch,
            quantity: parseInt(newBatch.quantity),
            remainingQuantity: parseInt(newBatch.quantity),
            isExpired: false,
            isNearExpiry: false,
        };

        setFormData((prev) => ({
            ...prev,
            expiryTracking: {
                ...prev.expiryTracking,
                batches: [...prev.expiryTracking.batches, batch],
            },
        }));

        setNewBatch({ batchNumber: "", quantity: 0, expiryDate: "" });
        setError("");
    };

    const removeBatch = (index) => {
        setFormData((prev) => ({
            ...prev,
            expiryTracking: {
                ...prev.expiryTracking,
                batches: prev.expiryTracking.batches.filter(
                    (_, i) => i !== index
                ),
            },
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");

            // Calculate total stock from batches if expiry tracking is enabled
            if (
                formData.expiryTracking.hasExpiry &&
                formData.expiryTracking.batches.length > 0
            ) {
                const totalBatchStock = formData.expiryTracking.batches.reduce(
                    (sum, batch) =>
                        sum + (batch.remainingQuantity || batch.quantity),
                    0
                );
                formData.inventory.currentStock = totalBatchStock;
            }

            const response = await updateProduct(vendorProductId, formData);

            if (response.success) {
                logger.info("Product updated successfully");
                navigate(`/inventory/${vendorProductId}`);
            } else {
                throw new Error(response.message || "Failed to update product");
            }
        } catch (err) {
            logger.error("Error updating product:", err);
            setError(err.message || "Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(`/inventory/${vendorProductId}`);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader text="Loading product data..." />
            </div>
        );
    }

    if (!originalData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FaExclamationTriangle className="text-6xl text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600">
                        Product Not Found
                    </h3>
                    <p className="text-gray-500 mt-2">
                        The product you're trying to edit doesn't exist.
                    </p>
                    <button
                        onClick={() => navigate("/inventory")}
                        className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Back to Inventory
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Content Area - Linear Layout */}
            <div className="max-w-7xl mx-auto ">
                <div className="space-y-6">
                    {/* Page Header */}
                    <div>
                        <nav className="flex items-center space-x-2 text-sm text-text-tertiary mb-4">
                            <Link
                                to="/inventory"
                                className="hover:text-text-primary transition-colors"
                            >
                                Inventory
                            </Link>
                            <FaChevronRight className="w-4 h-4" />
                            <Link
                                to={`/inventory/${vendorProductId}`}
                                className="hover:text-text-primary transition-colors"
                            >
                                {originalData?.product?.name}
                            </Link>
                            <FaChevronRight className="w-4 h-4" />
                            <span className="text-text-primary">Edit</span>
                        </nav>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                            <div>
                                <h1 className="text-2xl font-semibold text-text-primary">
                                    Edit Product
                                </h1>
                                <p className="text-text-tertiary mt-1">
                                    {originalData?.product?.name} • by{" "}
                                    {originalData?.product?.brand}
                                </p>
                            </div>

                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center space-x-2 text-text-secondary bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    <FaTimes className="text-sm" />
                                    <span className="text-sm font-medium">
                                        Cancel
                                    </span>
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                >
                                    <FaSave className="text-sm" />
                                    <span className="text-sm font-medium">
                                        {saving ? "Saving..." : "Save Changes"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
                            <FaExclamationTriangle className="mr-2" />
                            {error}
                        </div>
                    )}

                    {/* Pricing Section */}
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <div className="flex items-center mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                <FaRupeeSign className="text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Pricing
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Manage cost price, selling price, and
                                    discounts
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cost Price{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                    <input
                                        type="number"
                                        value={formData.pricing.costPrice}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "pricing",
                                                "costPrice",
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Your purchase/manufacturing cost
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Selling Price{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                    <input
                                        type="number"
                                        value={formData.pricing.sellingPrice}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "pricing",
                                                "sellingPrice",
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Price customers will pay
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Discount Percentage
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={
                                            formData.pricing.discountPercentage
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "pricing",
                                                "discountPercentage",
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                        className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                        %
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Promotional discount offered
                                </p>
                            </div>
                        </div>

                        {/* Pricing Summary */}
                        {formData.pricing.sellingPrice > 0 && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">
                                    Pricing Summary
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">
                                            Cost Price:
                                        </span>
                                        <div className="font-medium text-gray-900">
                                            {formatCurrency(
                                                formData.pricing.costPrice
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">
                                            Selling Price:
                                        </span>
                                        <div className="font-medium text-gray-900">
                                            {formatCurrency(
                                                formData.pricing.sellingPrice
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">
                                            Profit Margin:
                                        </span>
                                        <div
                                            className={`font-medium ${
                                                formData.pricing.sellingPrice -
                                                    formData.pricing.costPrice >
                                                0
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {formatCurrency(
                                                formData.pricing.sellingPrice -
                                                    formData.pricing.costPrice
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">
                                            Profit %:
                                        </span>
                                        <div
                                            className={`font-medium ${
                                                ((formData.pricing
                                                    .sellingPrice -
                                                    formData.pricing
                                                        .costPrice) /
                                                    formData.pricing
                                                        .costPrice) *
                                                    100 >
                                                0
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {formData.pricing.costPrice > 0
                                                ? (
                                                      ((formData.pricing
                                                          .sellingPrice -
                                                          formData.pricing
                                                              .costPrice) /
                                                          formData.pricing
                                                              .costPrice) *
                                                      100
                                                  ).toFixed(1) + "%"
                                                : "0%"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stock & Inventory Section */}
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <div className="flex items-center mb-6">
                            <div className="p-2 bg-green-100 rounded-lg mr-3">
                                <FaBox className="text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Stock & Inventory
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Manage current stock and stock level alerts
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Stock{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.inventory.currentStock}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "inventory",
                                            "currentStock",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="0"
                                    min="0"
                                    disabled={formData.expiryTracking.hasExpiry}
                                />
                                {formData.expiryTracking.hasExpiry && (
                                    <p className="text-xs text-amber-600 mt-1">
                                        Auto-calculated from batch totals
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minimum Stock Level
                                </label>
                                <input
                                    type="number"
                                    value={formData.inventory.minStockLevel}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "inventory",
                                            "minStockLevel",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="5"
                                    min="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Alert when stock falls below this level
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Stock Level
                                </label>
                                <input
                                    type="number"
                                    value={formData.inventory.maxStockLevel}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "inventory",
                                            "maxStockLevel",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="100"
                                    min="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Prevent overstocking above this level
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reserved Stock
                                </label>
                                <input
                                    type="number"
                                    value={formData.inventory.reservedStock}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "inventory",
                                            "reservedStock",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="0"
                                    min="0"
                                    max={formData.inventory.currentStock}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Stock reserved for pending orders
                                </p>
                            </div>
                        </div>

                        {/* Stock Status */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                                Stock Status
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">
                                        Total Stock:
                                    </span>
                                    <div className="font-medium text-gray-900">
                                        {formData.inventory.currentStock} units
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500">
                                        Available:
                                    </span>
                                    <div className="font-medium text-green-600">
                                        {Math.max(
                                            0,
                                            formData.inventory.currentStock -
                                                formData.inventory.reservedStock
                                        )}{" "}
                                        units
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500">
                                        Reserved:
                                    </span>
                                    <div className="font-medium text-orange-600">
                                        {formData.inventory.reservedStock} units
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500">
                                        Status:
                                    </span>
                                    <div
                                        className={`font-medium ${
                                            formData.inventory.currentStock <=
                                            formData.inventory.minStockLevel
                                                ? "text-red-600"
                                                : formData.inventory
                                                      .currentStock <=
                                                  formData.inventory
                                                      .minStockLevel *
                                                      2
                                                ? "text-amber-600"
                                                : "text-green-600"
                                        }`}
                                    >
                                        {formData.inventory.currentStock <=
                                        formData.inventory.minStockLevel
                                            ? "Low Stock"
                                            : formData.inventory.currentStock <=
                                              formData.inventory.minStockLevel *
                                                  2
                                            ? "Moderate"
                                            : "Good Stock"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expiry & Batches Section */}
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <div className="flex items-center mb-6">
                            <div className="p-2 bg-orange-100 rounded-lg mr-3">
                                <FaCalendarAlt className="text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Expiry & Batches
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Manage expiry tracking and batch information
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={formData.expiryTracking.hasExpiry}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "expiryTracking",
                                            "hasExpiry",
                                            e.target.checked
                                        )
                                    }
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Enable expiry tracking for this product
                                </span>
                            </label>
                            <p className="text-xs text-gray-500 mt-1 ml-7">
                                Track multiple batches with different expiry
                                dates
                            </p>
                        </div>

                        {formData.expiryTracking.hasExpiry && (
                            <div>
                                {/* Add New Batch */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-900 mb-4">
                                        Add New Batch
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Batch Number
                                            </label>
                                            <input
                                                type="text"
                                                value={newBatch.batchNumber}
                                                onChange={(e) =>
                                                    setNewBatch((prev) => ({
                                                        ...prev,
                                                        batchNumber:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                                                placeholder="e.g., B001"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                value={newBatch.quantity}
                                                onChange={(e) =>
                                                    setNewBatch((prev) => ({
                                                        ...prev,
                                                        quantity:
                                                            parseInt(
                                                                e.target.value
                                                            ) || 0,
                                                    }))
                                                }
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Expiry Date
                                            </label>
                                            <input
                                                type="date"
                                                value={newBatch.expiryDate}
                                                onChange={(e) =>
                                                    setNewBatch((prev) => ({
                                                        ...prev,
                                                        expiryDate:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={addBatch}
                                                className="w-full px-3 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center space-x-1"
                                            >
                                                <FaPlus className="text-xs" />
                                                <span>Add Batch</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Current Batches */}
                                {formData.expiryTracking.batches.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-4">
                                            Current Batches
                                        </h4>
                                        <div className="space-y-3">
                                            {formData.expiryTracking.batches.map(
                                                (batch, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
                                                    >
                                                        <div className="flex items-center space-x-4 flex-1">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {
                                                                        batch.batchNumber
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    Batch Number
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {batch.remainingQuantity ||
                                                                        batch.quantity}{" "}
                                                                    units
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    Remaining
                                                                    Quantity
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {new Date(
                                                                        batch.expiryDate
                                                                    ).toLocaleDateString()}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    Expiry Date
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                removeBatch(
                                                                    index
                                                                )
                                                            }
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        >
                                                            <FaTrash className="text-sm" />
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                            <div className="flex items-center">
                                                <FaInfoCircle className="text-blue-600 mr-2 text-sm" />
                                                <span className="text-sm text-blue-800">
                                                    Total stock from all
                                                    batches:{" "}
                                                    {formData.expiryTracking.batches.reduce(
                                                        (sum, batch) =>
                                                            sum +
                                                            (batch.remainingQuantity ||
                                                                batch.quantity),
                                                        0
                                                    )}{" "}
                                                    units
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Settings Section */}
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 opacity-60">
                        <div className="flex items-center mb-6">
                            <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                <FaCog className="text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Settings
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Configure product visibility, ordering, and
                                    automation
                                </p>
                            </div>
                            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                Coming Soon
                            </div>
                        </div>

                        <div className="space-y-6 pointer-events-none">
                            {/* Visibility Settings */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">
                                    Visibility Settings
                                </h4>
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.settings.isActive}
                                            disabled
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">
                                                Active Product
                                            </span>
                                            <p className="text-xs text-gray-500">
                                                Product is available for sale
                                            </p>
                                        </div>
                                    </label>

                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={
                                                formData.settings.isVisible
                                            }
                                            disabled
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">
                                                Visible in Catalog
                                            </span>
                                            <p className="text-xs text-gray-500">
                                                Show product in store listings
                                            </p>
                                        </div>
                                    </label>

                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={
                                                formData.settings
                                                    .hideWhenOutOfStock
                                            }
                                            disabled
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">
                                                Hide When Out of Stock
                                            </span>
                                            <p className="text-xs text-gray-500">
                                                Automatically hide when stock
                                                reaches zero
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Order Settings */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">
                                    Order Settings
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Minimum Order Quantity
                                        </label>
                                        <input
                                            type="number"
                                            value={
                                                formData.settings
                                                    .minOrderQuantity
                                            }
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                            placeholder="1"
                                            min="1"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Minimum units customers can order
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Maximum Order Quantity
                                        </label>
                                        <input
                                            type="number"
                                            value={
                                                formData.settings
                                                    .maxOrderQuantity
                                            }
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                            placeholder="10"
                                            min="1"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Maximum units customers can order
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Automation Settings */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">
                                    Automation Settings
                                </h4>
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={
                                                formData.settings.autoRestock
                                            }
                                            disabled
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">
                                                Auto Restock Notifications
                                            </span>
                                            <p className="text-xs text-gray-500">
                                                Get notified when stock reaches
                                                minimum level
                                            </p>
                                        </div>
                                    </label>

                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={
                                                formData.settings
                                                    .autoDiscountNearExpiry
                                            }
                                            disabled
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">
                                                Auto Discount Near Expiry
                                            </span>
                                            <p className="text-xs text-gray-500">
                                                Automatically apply discounts to
                                                items nearing expiry
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProductPage;
