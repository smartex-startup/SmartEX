import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useInventory } from "../context/InventoryContext";
import {
    FaBox,
    FaDollarSign,
    FaExclamationTriangle,
    FaTimes,
    FaPlus,
    FaClipboardList,
    FaBell,
} from "react-icons/fa";

const DashboardPage = () => {
    const { vendor } = useAuth();
    const { summary, loading, loadInventory, loadLowStock, loadNearExpiry } =
        useInventory();

    // Fetch data on component mount
    useEffect(() => {
        loadInventory();
        loadLowStock();
        loadNearExpiry();
    }, [loadInventory, loadLowStock, loadNearExpiry]);

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white p-6 rounded-lg shadow h-32"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary">
                    Welcome back, {vendor?.businessName || "Vendor"}!
                </h1>
                <p className="text-text-tertiary mt-2">
                    Here's your business overview for today
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Products */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <FaBox className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-text-primary">
                            Total Products
                        </h3>
                        <p className="text-3xl font-bold text-primary mt-2">
                            {summary?.totalProducts || 0}
                        </p>
                    </div>
                </div>

                {/* Total Value */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <FaDollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-text-primary">
                            Total Value
                        </h3>
                        <p className="text-3xl font-bold text-secondary mt-2">
                            ₹{summary?.totalValue?.toLocaleString() || 0}
                        </p>
                    </div>
                </div>

                {/* Low Stock */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <FaExclamationTriangle className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-text-primary">
                            Low Stock
                        </h3>
                        <p className="text-3xl font-bold text-accent mt-2">
                            {summary?.lowStockItems || 0}
                        </p>
                    </div>
                </div>

                {/* Out of Stock */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <FaTimes className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-text-primary">
                            Out of Stock
                        </h3>
                        <p className="text-3xl font-bold text-danger mt-2">
                            {summary?.outOfStockItems || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="p-2 bg-blue-50 rounded-lg mr-4">
                            <FaPlus className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-medium text-text-primary">
                                Add Product
                            </h3>
                            <p className="text-sm text-text-tertiary">
                                Add new product to inventory
                            </p>
                        </div>
                    </button>

                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="p-2 bg-green-50 rounded-lg mr-4">
                            <FaClipboardList className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-medium text-text-primary">
                                Manage Inventory
                            </h3>
                            <p className="text-sm text-text-tertiary">
                                Update stock and pricing
                            </p>
                        </div>
                    </button>

                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="p-2 bg-orange-50 rounded-lg mr-4">
                            <FaBell className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-medium text-text-primary">
                                View Alerts
                            </h3>
                            <p className="text-sm text-text-tertiary">
                                Check low stock & expiry
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
