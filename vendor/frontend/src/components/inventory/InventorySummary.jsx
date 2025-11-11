import React from "react";
import {
    FaBox,
    FaDollarSign,
    FaExclamationTriangle,
    FaClock,
} from "react-icons/fa";
import { useInventory } from "../../context/InventoryContext.jsx";

const InventorySummary = () => {
    const { summary, pagination, loading } = useInventory();

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white p-6 rounded-lg shadow animate-pulse"
                    >
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                            <div className="ml-4 space-y-2">
                                <div className="h-6 bg-gray-300 rounded w-16"></div>
                                <div className="h-4 bg-gray-300 rounded w-24"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const summaryCards = [
        {
            title: "Total Products",
            value: summary?.totalProducts || 0,
            icon: <FaBox className="w-6 h-6" />,
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            title: "Total Value",
            value: `₹${(summary?.totalValue || 0).toLocaleString("en-IN")}`,
            icon: <FaDollarSign className="w-6 h-6" />,
            bgColor: "bg-green-50",
            iconColor: "text-green-600",
        },
        {
            title: "Low Stock Items",
            value: summary?.lowStockItems || 0,
            icon: <FaExclamationTriangle className="w-6 h-6" />,
            bgColor: "bg-orange-50",
            iconColor: "text-orange-600",
            alert: (summary?.lowStockItems || 0) > 0,
        },
        {
            title: "Out of Stock",
            value: summary?.outOfStockItems || 0,
            icon: <FaClock className="w-6 h-6" />,
            bgColor: "bg-red-50",
            iconColor: "text-red-600",
            alert: (summary?.outOfStockItems || 0) > 0,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {summaryCards.map((card, index) => (
                <div
                    key={index}
                    className={`bg-white p-6 rounded-lg shadow border-l-4 ${
                        card.alert ? "border-l-accent" : "border-l-transparent"
                    }`}
                >
                    <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${card.bgColor}`}>
                            <div className={card.iconColor}>{card.icon}</div>
                        </div>
                        <div className="ml-4">
                            <p className="text-2xl font-semibold text-text-primary">
                                {card.value}
                            </p>
                            <p className="text-sm text-text-tertiary">
                                {card.title}
                            </p>
                        </div>
                    </div>

                    {card.alert && (
                        <div className="mt-3 flex items-center">
                            <FaExclamationTriangle className="w-4 h-4 text-orange-500 mr-2" />
                            <span className="text-xs text-orange-600 font-medium">
                                Requires attention
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default InventorySummary;
