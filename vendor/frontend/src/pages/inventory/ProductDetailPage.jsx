import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    FaArrowLeft,
    FaEdit,
    FaTrash,
    FaBox,
    FaRupeeSign,
    FaCalendarAlt,
    FaStore,
    FaCog,
    FaChartLine,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTags,
    FaBarcode,
    FaChevronRight,
} from "react-icons/fa";
import { getProduct } from "../../api/inventory.api.js";
import logger from "../../utils/logger.util.js";
import Loader from "../../components/common/Loader.jsx";

const ProductDetailPage = () => {
    const { vendorProductId } = useParams();
    const navigate = useNavigate();
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        loadProductData();
    }, [vendorProductId]);

    const loadProductData = async () => {
        try {
            setLoading(true);
            setError("");

            logger.info(
                "Loading product detail for vendorProductId:",
                vendorProductId
            );

            const response = await getProduct(vendorProductId);

            if (response.success) {
                setProductData(response.data);
                logger.info("Product data loaded successfully");
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

    const handleEdit = () => {
        navigate(`/inventory/${vendorProductId}/edit`);
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        // TODO: Implement delete API call
        logger.info("Delete confirmed for product:", vendorProductId);
        setShowDeleteModal(false);
        // navigate("/inventory");
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-IN");
    };

    const getStockStatus = (currentStock, minStock) => {
        if (currentStock === 0) {
            return {
                status: "Out of Stock",
                color: "text-red-600",
                bgColor: "bg-red-100",
            };
        } else if (currentStock <= minStock) {
            return {
                status: "Low Stock",
                color: "text-yellow-600",
                bgColor: "bg-yellow-100",
            };
        } else {
            return {
                status: "In Stock",
                color: "text-green-600",
                bgColor: "bg-green-100",
            };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader text="Loading product details..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <div className="flex items-center space-x-3">
                        <FaExclamationTriangle className="text-red-500 text-xl" />
                        <div>
                            <h3 className="text-lg font-medium text-red-800">
                                Error Loading Product
                            </h3>
                            <p className="text-red-600 mt-1">{error}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => navigate("/inventory")}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Back to Inventory
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!productData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FaBox className="text-6xl text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600">
                        Product Not Found
                    </h3>
                    <p className="text-gray-500 mt-2">
                        The product you're looking for doesn't exist.
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

    const {
        product,
        pricing,
        inventory,
        expiryTracking,
        availability,
        salesMetrics,
        settings,
        vendor,
    } = productData;
    const stockStatus = getStockStatus(
        inventory.currentStock,
        inventory.minStockLevel
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto ">
                {/* Page Header */}
                <div className="space-y-6">
                    {/* Breadcrumb */}
                    <div>
                        <nav className="flex items-center space-x-2 text-sm text-text-tertiary mb-4">
                            <Link
                                to="/inventory"
                                className="hover:text-text-primary transition-colors"
                            >
                                Inventory
                            </Link>
                            <FaChevronRight className="w-4 h-4" />
                            <span className="text-text-primary">
                                Product Details
                            </span>
                        </nav>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                            <div>
                                <h1 className="text-2xl font-semibold text-text-primary">
                                    {product.name}
                                </h1>
                                <p className="text-text-tertiary mt-1">
                                    by {product.brand} •{" "}
                                    {typeof product.category === "object"
                                        ? product.category.name
                                        : product.category || "Uncategorized"}
                                </p>
                            </div>

                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                                >
                                    <FaEdit className="text-sm" />
                                    <span className="text-sm font-medium">
                                        Edit Product
                                    </span>
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center space-x-2 bg-danger text-white px-4 py-2 rounded-md hover:bg-danger/90 transition-colors"
                                >
                                    <FaTrash className="text-sm" />
                                    <span className="text-sm font-medium">
                                        Delete
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Product Header */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                            {/* Product Image */}
                            <div className="shrink-0 mb-4 lg:mb-0">
                                <img
                                    src={
                                        product.images?.[0]?.url ||
                                        "/placeholder-product.png"
                                    }
                                    alt={
                                        product.images?.[0]?.altText ||
                                        product.name
                                    }
                                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left Column - Basic Info */}
                                    <div>
                                        {product.description && (
                                            <div className="mb-4">
                                                <p className="text-text-secondary">
                                                    {product.description}
                                                </p>
                                            </div>
                                        )}

                                        {/* Product Tags */}
                                        {product.tags &&
                                            product.tags.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-sm font-medium text-text-tertiary mb-2">
                                                        Tags
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {product.tags
                                                            .slice(0, 5)
                                                            .map(
                                                                (
                                                                    tag,
                                                                    index
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                )
                                                            )}
                                                        {product.tags.length >
                                                            5 && (
                                                            <span className="text-xs text-text-quaternary">
                                                                +
                                                                {product.tags
                                                                    .length -
                                                                    5}{" "}
                                                                more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Base Price */}
                                        {product.basePrice && (
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-text-tertiary">
                                                    Base Price (MRP)
                                                </p>
                                                <p className="text-lg font-semibold text-text-primary">
                                                    {formatCurrency(
                                                        product.basePrice
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column - Technical Details */}
                                    <div>
                                        {/* Specifications */}
                                        {product.specifications && (
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-text-tertiary mb-2">
                                                    Specifications
                                                </p>
                                                <div className="space-y-2 text-sm">
                                                    {product.specifications
                                                        .weight && (
                                                        <div className="flex justify-between">
                                                            <span className="text-text-quaternary">
                                                                Weight:
                                                            </span>
                                                            <span className="text-text-primary">
                                                                {
                                                                    product
                                                                        .specifications
                                                                        .weight
                                                                        .value
                                                                }{" "}
                                                                {
                                                                    product
                                                                        .specifications
                                                                        .weight
                                                                        .unit
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                    {product.specifications
                                                        .dimensions && (
                                                        <div className="flex justify-between">
                                                            <span className="text-text-quaternary">
                                                                Dimensions:
                                                            </span>
                                                            <span className="text-text-primary">
                                                                {
                                                                    product
                                                                        .specifications
                                                                        .dimensions
                                                                        .length
                                                                }
                                                                ×
                                                                {
                                                                    product
                                                                        .specifications
                                                                        .dimensions
                                                                        .width
                                                                }
                                                                ×
                                                                {
                                                                    product
                                                                        .specifications
                                                                        .dimensions
                                                                        .height
                                                                }{" "}
                                                                {
                                                                    product
                                                                        .specifications
                                                                        .dimensions
                                                                        .unit
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Barcodes */}
                                        {product.barcodes &&
                                            product.barcodes.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-sm font-medium text-text-tertiary mb-2">
                                                        Barcodes
                                                    </p>
                                                    <div className="space-y-1">
                                                        {product.barcodes.map(
                                                            (
                                                                barcode,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center space-x-2 text-sm"
                                                                >
                                                                    <FaBarcode className="text-text-quaternary" />
                                                                    <span className="text-text-primary font-mono">
                                                                        {
                                                                            barcode.code
                                                                        }
                                                                    </span>
                                                                    <span className="text-text-quaternary">
                                                                        (
                                                                        {
                                                                            barcode.type
                                                                        }
                                                                        )
                                                                    </span>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {/* HSN Code */}
                                        {product.hsn && (
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-text-tertiary">
                                                    HSN Code
                                                </p>
                                                <p className="text-sm font-mono text-text-primary">
                                                    {product.hsn}
                                                </p>
                                            </div>
                                        )}

                                        {/* Special Indicators */}
                                        <div className="flex flex-wrap gap-2">
                                            {product.requiresPrescription && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                                                    Requires Prescription
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <div
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bgColor} ${stockStatus.color}`}
                                    >
                                        <span className="mr-2">●</span>
                                        {stockStatus.status}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {/* Pricing Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-text-tertiary">
                                        Selling Price
                                    </p>
                                    <p className="text-2xl font-bold text-text-primary">
                                        {formatCurrency(pricing.finalPrice)}
                                    </p>
                                    <p className="text-xs text-text-quaternary mt-1">
                                        Cost:{" "}
                                        {formatCurrency(pricing.costPrice)} |
                                        Margin: {pricing.margin}%
                                    </p>
                                </div>
                                <FaRupeeSign className="text-primary text-2xl" />
                            </div>
                        </div>

                        {/* Stock Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-secondary">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-text-tertiary">
                                        Current Stock
                                    </p>
                                    <p className="text-2xl font-bold text-text-primary">
                                        {inventory.currentStock}
                                    </p>
                                    <p className="text-xs text-text-quaternary mt-1">
                                        Min: {inventory.minStockLevel} | Max:{" "}
                                        {inventory.maxStockLevel}
                                    </p>
                                </div>
                                <FaBox className="text-secondary text-2xl" />
                            </div>
                        </div>

                        {/* Sales Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-accent">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-text-tertiary">
                                        Total Sold
                                    </p>
                                    <p className="text-2xl font-bold text-text-primary">
                                        {salesMetrics.totalSold}
                                    </p>
                                    <p className="text-xs text-text-quaternary mt-1">
                                        Revenue:{" "}
                                        {formatCurrency(salesMetrics.revenue)}
                                    </p>
                                </div>
                                <FaChartLine className="text-accent text-2xl" />
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-400">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-text-tertiary">
                                        Availability
                                    </p>
                                    <p className="text-lg font-bold text-text-primary capitalize">
                                        {availability.availabilityStatus.replace(
                                            "_",
                                            " "
                                        )}
                                    </p>
                                    <p className="text-xs text-text-quaternary mt-1">
                                        {availability.isAvailable
                                            ? "Available"
                                            : "Not Available"}
                                    </p>
                                </div>
                                {availability.isAvailable ? (
                                    <FaCheckCircle className="text-secondary text-2xl" />
                                ) : (
                                    <FaExclamationTriangle className="text-danger text-2xl" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pricing Details */}
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-text-primary flex items-center space-x-2">
                                    <FaRupeeSign className="text-primary" />
                                    <span>Pricing Details</span>
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-text-tertiary">
                                            Cost Price
                                        </p>
                                        <p className="text-lg font-semibold text-text-primary">
                                            {formatCurrency(pricing.costPrice)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-tertiary">
                                            Selling Price
                                        </p>
                                        <p className="text-lg font-semibold text-text-primary">
                                            {formatCurrency(
                                                pricing.sellingPrice
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-tertiary">
                                            Discount
                                        </p>
                                        <p className="text-lg font-semibold text-text-primary">
                                            {pricing.discountPercentage}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-tertiary">
                                            Final Price
                                        </p>
                                        <p className="text-lg font-semibold text-secondary">
                                            {formatCurrency(pricing.finalPrice)}
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-gray-100">
                                    <p className="text-sm font-medium text-text-tertiary">
                                        Profit Margin
                                    </p>
                                    <p className="text-xl font-bold text-secondary">
                                        {pricing.margin}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Inventory Details */}
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-text-primary flex items-center space-x-2">
                                    <FaBox className="text-secondary" />
                                    <span>Inventory Details</span>
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-text-tertiary">
                                            Current Stock
                                        </p>
                                        <p className="text-lg font-semibold text-text-primary">
                                            {inventory.currentStock}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-tertiary">
                                            Available Stock
                                        </p>
                                        <p className="text-lg font-semibold text-text-primary">
                                            {inventory.availableStock}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-tertiary">
                                            Reserved Stock
                                        </p>
                                        <p className="text-lg font-semibold text-text-primary">
                                            {inventory.reservedStock}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-tertiary">
                                            Min Stock Level
                                        </p>
                                        <p className="text-lg font-semibold text-text-primary">
                                            {inventory.minStockLevel}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expiry Tracking & Batches */}
                    {expiryTracking.hasExpiry &&
                        expiryTracking.batches &&
                        expiryTracking.batches.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm mt-6">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-text-primary flex items-center space-x-2">
                                        <FaCalendarAlt className="text-accent" />
                                        <span>Batch Information</span>
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-text-quaternary uppercase tracking-wider">
                                                    Batch Number
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-text-quaternary uppercase tracking-wider">
                                                    Quantity
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-text-quaternary uppercase tracking-wider">
                                                    Remaining
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-text-quaternary uppercase tracking-wider">
                                                    Expiry Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-text-quaternary uppercase tracking-wider">
                                                    Days to Expiry
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-text-quaternary uppercase tracking-wider">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {expiryTracking.batches.map(
                                                (batch, index) => (
                                                    <tr
                                                        key={batch._id || index}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                                                            {batch.batchNumber}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                                            {batch.quantity}{" "}
                                                            units
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                                            {
                                                                batch.remainingQuantity
                                                            }{" "}
                                                            units
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                                            {formatDate(
                                                                batch.expiryDate
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                                            {batch.daysToExpiry}{" "}
                                                            days
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    batch.isExpired
                                                                        ? "bg-red-100 text-red-800"
                                                                        : batch.isNearExpiry
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : "bg-green-100 text-green-800"
                                                                }`}
                                                            >
                                                                {batch.isExpired
                                                                    ? "Expired"
                                                                    : batch.isNearExpiry
                                                                    ? "Near Expiry"
                                                                    : "Fresh"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    {/* Settings */}
                    <div className="bg-white rounded-lg shadow-sm mt-6">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-text-primary flex items-center space-x-2">
                                <FaCog className="text-text-quaternary" />
                                <span>Product Settings</span>
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium text-text-tertiary">
                                        Auto Restock
                                    </span>
                                    <span
                                        className={`text-sm font-semibold ${
                                            settings.autoRestock
                                                ? "text-secondary"
                                                : "text-text-quaternary"
                                        }`}
                                    >
                                        {settings.autoRestock
                                            ? "Enabled"
                                            : "Disabled"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium text-text-tertiary">
                                        Auto Discount Near Expiry
                                    </span>
                                    <span
                                        className={`text-sm font-semibold ${
                                            settings.autoDiscountNearExpiry
                                                ? "text-secondary"
                                                : "text-text-quaternary"
                                        }`}
                                    >
                                        {settings.autoDiscountNearExpiry
                                            ? "Enabled"
                                            : "Disabled"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium text-text-tertiary">
                                        Hide When Out of Stock
                                    </span>
                                    <span
                                        className={`text-sm font-semibold ${
                                            settings.hideWhenOutOfStock
                                                ? "text-danger"
                                                : "text-secondary"
                                        }`}
                                    >
                                        {settings.hideWhenOutOfStock
                                            ? "Yes"
                                            : "No"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium text-text-tertiary">
                                        Min Order Quantity
                                    </span>
                                    <span className="text-sm font-semibold text-text-primary">
                                        {settings.minOrderQuantity}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium text-text-tertiary">
                                        Max Order Quantity
                                    </span>
                                    <span className="text-sm font-semibold text-text-primary">
                                        {settings.maxOrderQuantity}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <FaExclamationTriangle className="text-danger text-xl" />
                            <h3 className="text-lg font-semibold text-text-primary">
                                Confirm Delete
                            </h3>
                        </div>
                        <p className="text-text-secondary mb-6">
                            Are you sure you want to delete "{product.name}"?
                            This action cannot be undone.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-text-secondary hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-danger text-white rounded-md hover:bg-danger/90 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;
