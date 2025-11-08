import React from "react";

const ExpiredPage = () => {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                    <span>Products</span>
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                    <span className="text-gray-900">Expired</span>
                </nav>
                <h1 className="text-2xl font-semibold text-gray-900">
                    Expired Products
                </h1>
                <p className="text-gray-600 mt-1">
                    Products that have already expired and need attention
                </p>
            </div>

            {/* Alert Banner */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                    <div className="shrink-0">
                        <svg
                            className="h-5 w-5 text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Expired Products Alert
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>
                                Expired products should be removed from your
                                inventory immediately and cannot be sold to
                                customers. Please review and take action on all
                                expired items.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-12 h-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Expired Products
                        </h3>
                        <p className="text-gray-500">
                            Great! You don't have any expired products in your
                            inventory.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpiredPage;
