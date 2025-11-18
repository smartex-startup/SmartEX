import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useInventory } from "../context/InventoryContext";
import { Link, useNavigate } from "react-router-dom";
import {
    FaBox,
    FaRupeeSign,
    FaExclamationTriangle,
    FaTimes,
    FaPlus,
    FaClipboardList,
    FaBell,
    FaChartLine,
    FaCalendarAlt,
    FaShoppingCart,
    FaEye,
    FaArrowRight,
    FaClock,
    FaCheckCircle,
    FaInfoCircle,
} from "react-icons/fa";

import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";

const DashboardPage = () => {
    const { vendor } = useAuth();
    const { summary, loading, loadInventory, loadLowStock, loadNearExpiry } =
        useInventory();
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    // Fetch data on component mount
    useEffect(() => {
        loadInventory();
        loadLowStock();
        loadNearExpiry();
        loadDashboardData();
    }, [loadInventory, loadLowStock, loadNearExpiry]);

    const loadDashboardData = async () => {
        // Simulated data - replace with actual API calls
        setAlerts([
            {
                id: 1,
                type: "low_stock",
                title: "Low Stock Alert",
                message: "5 products are running low on stock",
                severity: "warning",
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
            {
                id: 2,
                type: "expiry",
                title: "Expiry Alert",
                message: "3 products are nearing expiry",
                severity: "error",
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            },
            {
                id: 3,
                type: "stock_update",
                title: "Stock Updated",
                message: "Successfully updated inventory for 12 products",
                severity: "success",
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            },
        ]);

        setRecentActivity([
            {
                id: 1,
                action: "Added new product",
                details: "Amul Fresh Milk 500ml added to inventory",
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                type: "add",
            },
            {
                id: 2,
                action: "Stock updated",
                details:
                    "Britannia Good Day Cookies - Stock increased by 50 units",
                timestamp: new Date(Date.now() - 45 * 60 * 1000),
                type: "update",
            },
            {
                id: 3,
                action: "Price updated",
                details: "Tata Salt 1kg - Price updated to ₹25.00",
                timestamp: new Date(Date.now() - 90 * 60 * 1000),
                type: "price",
            },
        ]);
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));

        if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        }
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        }
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case "low_stock":
                return <FaExclamationTriangle />;
            case "expiry":
                return <FaClock />;
            case "stock_update":
                return <FaCheckCircle />;
            default:
                return <FaInfoCircle />;
        }
    };

    const getAlertColor = (severity) => {
        switch (severity) {
            case "error":
                return "text-red-600 bg-red-50 border-red-200";
            case "warning":
                return "text-orange-600 bg-orange-50 border-orange-200";
            case "success":
                return "text-green-600 bg-green-50 border-green-200";
            default:
                return "text-blue-600 bg-blue-50 border-blue-200";
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case "add":
                return <FaPlus className="text-green-600" />;
            case "update":
                return <FaBox className="text-blue-600" />;
            case "price":
                return <FaRupeeSign className="text-purple-600" />;
            default:
                return <FaInfoCircle className="text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white p-6 rounded-lg shadow border border-gray-200 h-32"
                                ></div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow border border-gray-200 h-96"></div>
                            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 h-96"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary">
                                Welcome back, {vendor?.businessName || "Vendor"}
                                !
                            </h1>
                            <p className="text-text-tertiary mt-2">
                                Here's your business overview for today •{" "}
                                {new Date().toLocaleDateString("en-IN", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Products */}
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <FaBox className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <FaArrowTrendUp className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-text-tertiary uppercase tracking-wide">
                                    Total Products
                                </h3>
                                <p className="text-3xl font-bold text-text-primary mt-2">
                                    {summary?.totalProducts || 0}
                                </p>
                                <p className="text-sm text-green-600 mt-2">
                                    +12% from last month
                                </p>
                            </div>
                        </div>

                        {/* Total Value */}
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <FaRupeeSign className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                                <FaArrowTrendUp className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-text-tertiary uppercase tracking-wide">
                                    Inventory Value
                                </h3>
                                <p className="text-3xl font-bold text-text-primary mt-2">
                                    ₹
                                    {(summary?.totalValue || 0).toLocaleString(
                                        "en-IN"
                                    )}
                                </p>
                                <p className="text-sm text-green-600 mt-2">
                                    +8% from last month
                                </p>
                            </div>
                        </div>

                        {/* Low Stock */}
                        <div
                            className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigate("/inventory/low-stock")}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="p-3 bg-orange-50 rounded-lg">
                                        <FaExclamationTriangle className="w-6 h-6 text-orange-600" />
                                    </div>
                                </div>
                                <FaArrowRight className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-text-tertiary uppercase tracking-wide">
                                    Low Stock Items
                                </h3>
                                <p className="text-3xl font-bold text-orange-600 mt-2">
                                    {summary?.lowStockItems || 0}
                                </p>
                                <p className="text-sm text-text-tertiary mt-2">
                                    Requires attention
                                </p>
                            </div>
                        </div>

                        {/* Out of Stock */}
                        <div
                            className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigate("/inventory/out-of-stock")}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <FaTimes className="w-6 h-6 text-red-600" />
                                    </div>
                                </div>
                                <FaArrowRight className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-text-tertiary uppercase tracking-wide">
                                    Out of Stock
                                </h3>
                                <p className="text-3xl font-bold text-red-600 mt-2">
                                    {summary?.outOfStockItems || 0}
                                </p>
                                <p className="text-sm text-text-tertiary mt-2">
                                    Restock needed
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Analytics & Chart Area */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Inventory Overview Chart */}
                            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold text-text-primary">
                                            Inventory Overview
                                        </h2>
                                        <p className="text-sm text-text-tertiary mt-1">
                                            Stock levels across categories
                                        </p>
                                    </div>
                                    <FaChartLine className="w-6 h-6 text-primary" />
                                </div>

                                {/* Simple Chart Placeholder - Replace with actual chart library */}
                                <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                                    <div className="text-center">
                                        <FaChartLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium">
                                            Inventory Analytics Chart
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Chart visualization coming soon
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {summary?.totalProducts || 0}
                                        </p>
                                        <p className="text-sm text-text-tertiary">
                                            Total Items
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {(summary?.totalProducts || 0) -
                                                (summary?.outOfStockItems || 0)}
                                        </p>
                                        <p className="text-sm text-text-tertiary">
                                            In Stock
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-orange-600">
                                            {summary?.lowStockItems || 0}
                                        </p>
                                        <p className="text-sm text-text-tertiary">
                                            Low Stock
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                                <h2 className="text-xl font-semibold text-text-primary mb-6">
                                    Quick Actions
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Link
                                        to="/inventory"
                                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors group"
                                    >
                                        <div className="p-3 bg-green-50 rounded-lg mr-4 group-hover:bg-primary transition-colors">
                                            <FaClipboardList className="w-5 h-5 text-green-600 group-hover:text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-medium text-text-primary group-hover:text-primary">
                                                Manage Inventory
                                            </h3>
                                            <p className="text-sm text-text-tertiary">
                                                Update stock and pricing
                                            </p>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/inventory/low-stock"
                                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors group"
                                    >
                                        <div className="p-3 bg-orange-50 rounded-lg mr-4 group-hover:bg-primary transition-colors">
                                            <FaBell className="w-5 h-5 text-orange-600 group-hover:text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-medium text-text-primary group-hover:text-primary">
                                                View Alerts
                                            </h3>
                                            <p className="text-sm text-text-tertiary">
                                                Check low stock & expiry
                                            </p>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/inventory/near-expiry"
                                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors group"
                                    >
                                        <div className="p-3 bg-purple-50 rounded-lg mr-4 group-hover:bg-primary transition-colors">
                                            <FaCalendarAlt className="w-5 h-5 text-purple-600 group-hover:text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-medium text-text-primary group-hover:text-primary">
                                                Expiry Management
                                            </h3>
                                            <p className="text-sm text-text-tertiary">
                                                Handle expiring products
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Alerts & Recent Activity */}
                        <div className="space-y-6">
                            {/* Alerts */}
                            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-text-primary">
                                        Recent Alerts
                                    </h3>
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                        {
                                            alerts.filter(
                                                (a) =>
                                                    a.severity === "error" ||
                                                    a.severity === "warning"
                                            ).length
                                        }{" "}
                                        Active
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {alerts.slice(0, 5).map((alert) => (
                                        <div
                                            key={alert.id}
                                            className={`p-3 rounded-lg border flex items-start space-x-3 ${getAlertColor(
                                                alert.severity
                                            )}`}
                                        >
                                            <div className="shrink-0 mt-0.5">
                                                {getAlertIcon(alert.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">
                                                    {alert.title}
                                                </p>
                                                <p className="text-xs mt-1 opacity-80">
                                                    {alert.message}
                                                </p>
                                                <p className="text-xs mt-2 opacity-70">
                                                    {formatTimeAgo(
                                                        alert.timestamp
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {alerts.length === 0 && (
                                        <div className="text-center py-8">
                                            <FaCheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                            <p className="text-text-tertiary">
                                                No active alerts
                                            </p>
                                            <p className="text-sm text-text-tertiary mt-1">
                                                Everything looks good!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">
                                    Recent Activity
                                </h3>
                                <div className="space-y-4">
                                    {recentActivity
                                        .slice(0, 5)
                                        .map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="flex items-start space-x-3"
                                            >
                                                <div className="shrink-0 w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
                                                    {getActivityIcon(
                                                        activity.type
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-text-primary">
                                                        {activity.action}
                                                    </p>
                                                    <p className="text-xs text-text-tertiary mt-1">
                                                        {activity.details}
                                                    </p>
                                                    <p className="text-xs text-text-tertiary mt-1">
                                                        {formatTimeAgo(
                                                            activity.timestamp
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    {recentActivity.length === 0 && (
                                        <div className="text-center py-8">
                                            <FaClock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-text-tertiary">
                                                No recent activity
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">
                                    Quick Stats
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-sm text-text-tertiary">
                                                Active Products
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-text-primary">
                                            {(summary?.totalProducts || 0) -
                                                (summary?.outOfStockItems || 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                            <span className="text-sm text-text-tertiary">
                                                Low Stock
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-orange-600">
                                            {summary?.lowStockItems || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            <span className="text-sm text-text-tertiary">
                                                Out of Stock
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-red-600">
                                            {summary?.outOfStockItems || 0}
                                        </span>
                                    </div>
                                    <hr className="my-3" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-text-primary">
                                            Total Value
                                        </span>
                                        <span className="text-sm font-bold text-primary">
                                            ₹
                                            {(
                                                summary?.totalValue || 0
                                            ).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
