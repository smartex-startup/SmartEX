import React from "react";

const InventoryPage = () => {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">
                        All Inventory
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Manage your inventory products (0 products)
                    </p>
                </div>
                <button className="bg-primary text-text-inverse px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center space-x-2">
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
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                    <span>Add to Inventory</span>
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 max-w-lg">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search inventory..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
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
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                            />
                        </svg>
                        <span>Filters (0)</span>
                    </button>
                    <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Table Header */}
            <div className="bg-white rounded-lg shadow">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 text-sm font-medium text-gray-500">
                    <div className="col-span-4">Product</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2">Price</div>
                    <div className="col-span-2">Discounted Price</div>
                    <div className="col-span-1">Stock</div>
                    <div className="col-span-1">Actions</div>
                </div>

                {/* Empty State */}
                <div className="p-12 text-center">
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
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-text-primary mb-2">
                        No products in inventory
                    </h3>
                    <p className="text-text-tertiary mb-6">
                        Get started by adding products from the catalog to your
                        inventory.
                    </p>
                    <button className="bg-primary text-text-inverse px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                        Add Your First Product
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InventoryPage;
