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
                        hasExpiry: productData.expiryTracking?.hasExpiry || false,
                        batches: productData.expiryTracking?.batches || [],
                    },
                    settings: { ...productData.settings },
                });
                logger.info("Product data loaded for editing");
            } else {
                throw new Error(response.message || "Failed to load product data");
            }
        } catch (err) {
            logger.error("Error loading product data:", err);
            setError(err.message || "Failed to load product details");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const addBatch = () => {
        if (!newBatch.batchNumber || !newBatch.quantity || !newBatch.expiryDate) {
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

        setFormData(prev => ({
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
        setFormData(prev => ({
            ...prev,
            expiryTracking: {
                ...prev.expiryTracking,
                batches: prev.expiryTracking.batches.filter((_, i) => i !== index),
            },
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");

            // Calculate total stock from batches if expiry tracking is enabled
            if (formData.expiryTracking.hasExpiry && formData.expiryTracking.batches.length > 0) {
                const totalBatchStock = formData.expiryTracking.batches.reduce(
                    (sum, batch) => sum + (batch.remainingQuantity || batch.quantity),
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
                    <h3 className="text-xl font-medium text-gray-600">Product Not Found</h3>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="space-y-6">
                    {/* Breadcrumb */}
                    <div>
                        <nav className="flex items-center space-x-2 text-sm text-text-tertiary mb-4">
                            <Link to="/inventory" className="hover:text-text-primary transition-colors">
                                Inventory
                            </Link>
                            <FaChevronRight className="w-4 h-4" />
                            <Link 
                                to={`/inventory/${vendorProductId}`}
                                className="hover:text-text-primary transition-colors"
                            >
                                {originalData.product.name}
                            </Link>
                            <FaChevronRight className="w-4 h-4" />
                            <span className="text-text-primary">Edit Product</span>
                        </nav>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                            <div>
                                <h1 className="text-2xl font-semibold text-text-primary">
                                    Edit Product
                                </h1>
                                <p className="text-text-tertiary mt-1">
                                    {originalData.product.name} by {originalData.product.brand}
                                </p>
                            </div>

                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center space-x-2 border border-gray-300 text-text-secondary px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    <FaTimes className="text-sm" />
                                    <span className="text-sm font-medium">Cancel</span>
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    <FaSave className="text-sm" />
                                    <span className="text-sm font-medium">
                                        {saving ? "Saving..." : "Save Changes"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <FaExclamationTriangle className="text-red-500" />
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Section Navigation */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-medium text-text-primary mb-4">
                                    Edit Sections
                                </h3>
                                <nav className="space-y-2">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-left ${
                                                activeSection === section.id
                                                    ? "bg-primary text-white"
                                                    : "text-text-secondary hover:bg-gray-50"
                                            }`}
                                        >
                                            <section.icon className={activeSection === section.id ? "text-white" : section.color} />
                                            <span className="font-medium">{section.name}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                {/* Pricing Section */}
                                {activeSection === "pricing" && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center space-x-2">
                                            <FaRupeeSign className="text-blue-600" />
                                            <span>Pricing Configuration</span>
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                                    Cost Price
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.pricing.costPrice}
                                                    onChange={(e) => handleInputChange("pricing", "costPrice", parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Enter cost price"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                                    Selling Price
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.pricing.sellingPrice}
                                                    onChange={(e) => handleInputChange("pricing", "sellingPrice", parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Enter selling price"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                                    Discount Percentage
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={formData.pricing.discountPercentage}
                                                    onChange={(e) => handleInputChange("pricing", "discountPercentage", parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Enter discount percentage"
                                                />
                                            </div>
                                            
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-text-primary mb-3">Pricing Summary</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-text-tertiary">Cost Price:</span>
                                                        <span className="font-medium">{formatCurrency(formData.pricing.costPrice)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-text-tertiary">Selling Price:</span>
                                                        <span className="font-medium">{formatCurrency(formData.pricing.sellingPrice)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-text-tertiary">Discount:</span>
                                                        <span className="font-medium">{formData.pricing.discountPercentage}%</span>
                                                    </div>
                                                    <div className="border-t pt-2 flex justify-between">
                                                        <span className="text-text-secondary font-medium">Final Price:</span>
                                                        <span className="font-semibold text-green-600">
                                                            {formatCurrency(
                                                                formData.pricing.sellingPrice * 
                                                                (1 - formData.pricing.discountPercentage / 100)
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-text-tertiary">Profit Margin:</span>
                                                        <span className="font-medium">
                                                            {formData.pricing.costPrice > 0 
                                                                ? ((formData.pricing.sellingPrice - formData.pricing.costPrice) / formData.pricing.costPrice * 100).toFixed(1)
                                                                : 0}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Inventory Section */}
                                {activeSection === "inventory" && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center space-x-2">
                                            <FaBox className="text-green-600" />
                                            <span>Stock & Inventory Management</span>
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                                    Current Stock
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.inventory.currentStock}
                                                    onChange={(e) => handleInputChange("inventory", "currentStock", parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Enter current stock"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                                    Reserved Stock
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.inventory.reservedStock}
                                                    onChange={(e) => handleInputChange("inventory", "reservedStock", parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Enter reserved stock"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                                    Minimum Stock Level
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.inventory.minStockLevel}
                                                    onChange={(e) => handleInputChange("inventory", "minStockLevel", parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Enter minimum stock level"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                                    Maximum Stock Level
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.inventory.maxStockLevel}
                                                    onChange={(e) => handleInputChange("inventory", "maxStockLevel", parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Enter maximum stock level"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <FaInfoCircle className="text-blue-600" />
                                                <h4 className="font-medium text-blue-800">Stock Status</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-blue-700">Available Stock:</span>
                                                    <span className="font-semibold ml-2">
                                                        {Math.max(0, formData.inventory.currentStock - formData.inventory.reservedStock)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-blue-700">Stock Status:</span>
                                                    <span className={`ml-2 font-semibold ${
                                                        formData.inventory.currentStock === 0 
                                                            ? "text-red-600" 
                                                            : formData.inventory.currentStock <= formData.inventory.minStockLevel
                                                            ? "text-orange-600"
                                                            : "text-green-600"
                                                    }`}>
                                                        {formData.inventory.currentStock === 0 
                                                            ? "Out of Stock"
                                                            : formData.inventory.currentStock <= formData.inventory.minStockLevel
                                                            ? "Low Stock"
                                                            : "In Stock"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-blue-700">Reorder Level:</span>
                                                    <span className="font-semibold ml-2">
                                                        {formData.inventory.minStockLevel} units
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Expiry Section */}
                                {activeSection === "expiry" && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center space-x-2">
                                            <FaCalendarAlt className="text-orange-600" />
                                            <span>Expiry Tracking & Batch Management</span>
                                        </h3>
                                        
                                        <div className="space-y-6">
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    id="hasExpiry"
                                                    checked={formData.expiryTracking.hasExpiry}
                                                    onChange={(e) => handleInputChange("expiryTracking", "hasExpiry", e.target.checked)}
                                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                                />
                                                <label htmlFor="hasExpiry" className="text-sm font-medium text-text-secondary">
                                                    This product has an expiry date
                                                </label>
                                            </div>
                                            
                                            {formData.expiryTracking.hasExpiry && (
                                                <div>
                                                    <h4 className="font-medium text-text-primary mb-4">Product Batches</h4>
                                                    
                                                    {/* Add New Batch */}
                                                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                                        <h5 className="font-medium text-text-secondary mb-3">Add New Batch</h5>
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                            <input
                                                                type="text"
                                                                placeholder="Batch Number"
                                                                value={newBatch.batchNumber}
                                                                onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder="Quantity"
                                                                min="1"
                                                                value={newBatch.quantity}
                                                                onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
                                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                            />
                                                            <input
                                                                type="date"
                                                                placeholder="Expiry Date"
                                                                value={newBatch.expiryDate}
                                                                onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                            />
                                                            <button
                                                                onClick={addBatch}
                                                                className="flex items-center justify-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                                                            >
                                                                <FaPlus className="text-sm" />
                                                                <span>Add</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Existing Batches */}
                                                    {formData.expiryTracking.batches.length > 0 ? (
                                                        <div className="overflow-x-auto">
                                                            <table className="min-w-full divide-y divide-gray-200">
                                                                <thead className="bg-gray-50">
                                                                    <tr>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-quaternary uppercase">
                                                                            Batch Number
                                                                        </th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-quaternary uppercase">
                                                                            Quantity
                                                                        </th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-quaternary uppercase">
                                                                            Expiry Date
                                                                        </th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-quaternary uppercase">
                                                                            Actions
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="bg-white divide-y divide-gray-200">
                                                                    {formData.expiryTracking.batches.map((batch, index) => (
                                                                        <tr key={index}>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                                                                                {batch.batchNumber}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                                                                {batch.remainingQuantity || batch.quantity} units
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                                                                {new Date(batch.expiryDate).toLocaleDateString("en-IN")}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                                <button
                                                                                    onClick={() => removeBatch(index)}
                                                                                    className="text-red-600 hover:text-red-800"
                                                                                >
                                                                                    <FaTrash />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8 text-text-tertiary">
                                                            No batches added yet. Add a batch to track expiry dates.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Settings Section */}
                                {activeSection === "settings" && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center space-x-2">
                                            <FaCog className="text-purple-600" />
                                            <span>Product Settings</span>
                                        </h3>
                                        
                                        <div className="space-y-6">
                                            {/* Visibility Settings */}
                                            <div>
                                                <h4 className="font-medium text-text-secondary mb-3">Visibility & Status</h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            id="isActive"
                                                            checked={formData.settings.isActive}
                                                            onChange={(e) => handleInputChange("settings", "isActive", e.target.checked)}
                                                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                                        />
                                                        <label htmlFor="isActive" className="text-sm text-text-primary">
                                                            Product is active
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            id="isVisible"
                                                            checked={formData.settings.isVisible}
                                                            onChange={(e) => handleInputChange("settings", "isVisible", e.target.checked)}
                                                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                                        />
                                                        <label htmlFor="isVisible" className="text-sm text-text-primary">
                                                            Visible to customers
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            id="hideWhenOutOfStock"
                                                            checked={formData.settings.hideWhenOutOfStock}
                                                            onChange={(e) => handleInputChange("settings", "hideWhenOutOfStock", e.target.checked)}
                                                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                                        />
                                                        <label htmlFor="hideWhenOutOfStock" className="text-sm text-text-primary">
                                                            Hide when out of stock
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Automation Settings */}
                                            <div>
                                                <h4 className="font-medium text-text-secondary mb-3">Automation</h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            id="autoRestock"
                                                            checked={formData.settings.autoRestock}
                                                            onChange={(e) => handleInputChange("settings", "autoRestock", e.target.checked)}
                                                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                                        />
                                                        <label htmlFor="autoRestock" className="text-sm text-text-primary">
                                                            Auto-restock when low
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            id="autoDiscountNearExpiry"
                                                            checked={formData.settings.autoDiscountNearExpiry}
                                                            onChange={(e) => handleInputChange("settings", "autoDiscountNearExpiry", e.target.checked)}
                                                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                                        />
                                                        <label htmlFor="autoDiscountNearExpiry" className="text-sm text-text-primary">
                                                            Auto-discount near expiry
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Limits */}
                                            <div>
                                                <h4 className="font-medium text-text-secondary mb-3">Order Limits</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-text-secondary mb-2">
                                                            Minimum Order Quantity
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={formData.settings.minOrderQuantity}
                                                            onChange={(e) => handleInputChange("settings", "minOrderQuantity", parseInt(e.target.value) || 1)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-text-secondary mb-2">
                                                            Maximum Order Quantity
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={formData.settings.maxOrderQuantity}
                                                            onChange={(e) => handleInputChange("settings", "maxOrderQuantity", parseInt(e.target.value) || 1)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProductPage;