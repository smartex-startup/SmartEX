import React, { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { useInventory } from "../../context/InventoryContext.jsx";

const SearchAndFilters = () => {
    const { filters, applyFilters, clearFilters, loading } = useInventory();

    // Local state for form inputs
    const [formFilters, setFormFilters] = useState({
        search: filters.search || "",
        category: filters.category || "",
        status: filters.status || "",
        minPrice: filters.minPrice || "",
        maxPrice: filters.maxPrice || "",
        expiryStatus: filters.expiryStatus || "",
        sortBy: filters.sortBy || "product.name",
        sortOrder: filters.sortOrder || "asc",
    });

    // Handle form input changes
    const handleInputChange = (name, value) => {
        setFormFilters((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission (Apply Filters button)
    const handleApplyFilters = (e) => {
        e.preventDefault();
        applyFilters(formFilters);
    };

    // Handle clear filters
    const handleClearFilters = () => {
        const clearedFilters = {
            search: "",
            category: "",
            status: "",
            minPrice: "",
            maxPrice: "",
            expiryStatus: "",
            sortBy: "product.name",
            sortOrder: "asc",
        };
        setFormFilters(clearedFilters);
        clearFilters();
    };

    // Check if any filters are active
    const hasActiveFilters = Object.values(formFilters).some(
        (value) => value !== "" && value !== "product.name" && value !== "asc"
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">
                    Search & Filters
                </h2>
                {hasActiveFilters && (
                    <span className="text-sm bg-primary-light bg-opacity-20 text-primary px-2 py-1 rounded-full">
                        Filters Applied
                    </span>
                )}
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-4">
                {/* Search and Category Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search Input */}
                    <div>
                        <label
                            htmlFor="search"
                            className="block text-sm font-medium text-text-secondary mb-1"
                        >
                            Search Products
                        </label>
                        <input
                            type="text"
                            id="search"
                            value={formFilters.search}
                            onChange={(e) =>
                                handleInputChange("search", e.target.value)
                            }
                            placeholder="Search by product name or brand..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label
                            htmlFor="category"
                            className="block text-sm font-medium text-text-secondary mb-1"
                        >
                            Category
                        </label>
                        <select
                            id="category"
                            value={formFilters.category}
                            onChange={(e) =>
                                handleInputChange("category", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">All Categories</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Home & Garden">Home & Garden</option>
                            <option value="Sports">Sports</option>
                            <option value="Books">Books</option>
                            <option value="Food & Beverages">
                                Food & Beverages
                            </option>
                            <option value="Health & Beauty">
                                Health & Beauty
                            </option>
                            <option value="Automotive">Automotive</option>
                        </select>
                    </div>
                </div>

                {/* Status and Expiry Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status Filter */}
                    <div>
                        <label
                            htmlFor="status"
                            className="block text-sm font-medium text-text-secondary mb-1"
                        >
                            Availability Status
                        </label>
                        <select
                            id="status"
                            value={formFilters.status}
                            onChange={(e) =>
                                handleInputChange("status", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">All Status</option>
                            <option value="available">Available</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                            <option value="discontinued">Discontinued</option>
                        </select>
                    </div>

                    {/* Expiry Status Filter */}
                    <div>
                        <label
                            htmlFor="expiryStatus"
                            className="block text-sm font-medium text-text-secondary mb-1"
                        >
                            Expiry Status
                        </label>
                        <select
                            id="expiryStatus"
                            value={formFilters.expiryStatus}
                            onChange={(e) =>
                                handleInputChange(
                                    "expiryStatus",
                                    e.target.value
                                )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">All Items</option>
                            <option value="fresh">Fresh</option>
                            <option value="near_expiry">Near Expiry</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>

                {/* Price Range Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="minPrice"
                            className="block text-sm font-medium text-text-secondary mb-1"
                        >
                            Min Price (₹)
                        </label>
                        <input
                            type="number"
                            id="minPrice"
                            value={formFilters.minPrice}
                            onChange={(e) =>
                                handleInputChange("minPrice", e.target.value)
                            }
                            placeholder="0"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="maxPrice"
                            className="block text-sm font-medium text-text-secondary mb-1"
                        >
                            Max Price (₹)
                        </label>
                        <input
                            type="number"
                            id="maxPrice"
                            value={formFilters.maxPrice}
                            onChange={(e) =>
                                handleInputChange("maxPrice", e.target.value)
                            }
                            placeholder="No limit"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Sorting Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="sortBy"
                            className="block text-sm font-medium text-text-secondary mb-1"
                        >
                            Sort By
                        </label>
                        <select
                            id="sortBy"
                            value={formFilters.sortBy}
                            onChange={(e) =>
                                handleInputChange("sortBy", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="product.name">Product Name</option>
                            <option value="product.brand">Brand</option>
                            <option value="pricing.finalPrice">Price</option>
                            <option value="inventory.currentStock">
                                Stock
                            </option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="sortOrder"
                            className="block text-sm font-medium text-text-secondary mb-1"
                        >
                            Sort Order
                        </label>
                        <select
                            id="sortOrder"
                            value={formFilters.sortOrder}
                            onChange={(e) =>
                                handleInputChange("sortOrder", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-text-inverse rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin h-4 w-4 text-text-inverse" />
                                Applying...
                            </>
                        ) : (
                            "Apply Filters"
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleClearFilters}
                        disabled={loading}
                        className="px-6 py-2 border border-gray-300 text-text-secondary rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Clear Filters
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SearchAndFilters;
