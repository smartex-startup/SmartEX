import React from "react";
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
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                    />
                </svg>
            ),
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            title: "Total Value",
            value: `₹${(summary?.totalValue || 0).toLocaleString("en-IN")}`,
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                </svg>
            ),
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
        },
        {
            title: "Low Stock Items",
            value: summary?.lowStockItems || 0,
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                </svg>
            ),
            bgColor: "bg-yellow-100",
            iconColor: "text-yellow-600",
            alert: (summary?.lowStockItems || 0) > 0,
        },
        {
            title: "Out of Stock",
            value: summary?.outOfStockItems || 0,
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ),
            bgColor: "bg-red-100",
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
                        card.alert
                            ? "border-l-orange-400"
                            : "border-l-transparent"
                    }`}
                >
                    <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${card.bgColor}`}>
                            <div className={card.iconColor}>{card.icon}</div>
                        </div>
                        <div className="ml-4">
                            <p className="text-2xl font-semibold text-gray-900">
                                {card.value}
                            </p>
                            <p className="text-sm text-gray-500">
                                {card.title}
                            </p>
                        </div>
                    </div>

                    {card.alert && (
                        <div className="mt-3 flex items-center">
                            <svg
                                className="w-4 h-4 text-orange-500 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
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
