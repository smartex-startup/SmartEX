import React, { useState, useEffect } from "react";
import {
    FaSearch,
    FaImage,
    FaTag,
    FaBox,
    FaCheck,
    FaExclamationTriangle,
} from "react-icons/fa";
import {
    searchProducts,
    getCategories,
    getProducts,
} from "../../../api/products.api.js";
import { getVendorProductByMasterProductId } from "../../../api/inventory.api.js";
import Loader from "../../common/Loader.jsx";
import Pagination from "../../common/Pagination.jsx";
import logger from "../../../utils/logger.util.js";

const ProductSearch = ({ selectedProduct, onProductSelect }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [existingProducts, setExistingProducts] = useState(new Set());
    const [checkingInventory, setCheckingInventory] = useState(false);

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 20,
        hasNextPage: false,
        hasPrevPage: false,
    });

    // Load categories on mount
    useEffect(() => {
        loadCategories();
        loadInitialProducts();
    }, []);

    // Trigger search when category changes
    useEffect(() => {
        if (selectedCategory !== "") {
            handleSearch();
        }
    }, [selectedCategory]);

    const loadCategories = async () => {
        try {
            const response = await getCategories();
            if (response.success) {
                setCategories(response.data || []);
            }
        } catch (err) {
            logger.error("Failed to load categories:", err);
        }
    };

    const loadInitialProducts = async () => {
        try {
            setLoading(true);
            const response = await getProducts({
                limit: pagination.limit,
                page: 1,
            });
            if (response.success) {
                setSearchResults(response.data.products || []);
                setPagination({
                    currentPage: response.data.pagination?.currentPage || 1,
                    totalPages: response.data.pagination?.totalPages || 1,
                    totalItems:
                        response.data.pagination?.totalProducts ||
                        response.data.products?.length ||
                        0,
                    limit: response.data.pagination?.limit || pagination.limit,
                    hasNextPage: response.data.pagination?.hasNextPage || false,
                    hasPrevPage: response.data.pagination?.hasPrevPage || false,
                });

                // Check which products are already in inventory
                checkExistingProducts(response.data.products || []);
            }
        } catch (err) {
            logger.error("Failed to load initial products:", err);
            setError("Failed to load products. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Function to check which products are already in vendor inventory
    const checkExistingProducts = async (products) => {
        if (!products || products.length === 0) return;

        setCheckingInventory(true);
        const existingProductIds = new Set();

        try {
            // Check each product in parallel
            const checks = products.map(async (product) => {
                try {
                    const response = await getVendorProductByMasterProductId(
                        product._id
                    );
                    if (response.success && response.data) {
                        existingProductIds.add(product._id);
                    }
                } catch (error) {
                    // Ignore 404 errors - means product not in inventory
                    if (error.response?.status !== 404) {
                        logger.error(
                            `Error checking product ${product._id}:`,
                            error
                        );
                    }
                }
            });

            await Promise.all(checks);
            setExistingProducts(existingProductIds);
        } catch (error) {
            logger.error("Error during bulk inventory check:", error);
        } finally {
            setCheckingInventory(false);
        }
    };

    const changePage = async (newPage) => {
        if (
            newPage === pagination.currentPage ||
            newPage < 1 ||
            newPage > pagination.totalPages
        ) {
            return;
        }

        setPagination((prev) => ({ ...prev, currentPage: newPage }));
        await performSearch(
            searchTerm,
            selectedCategory,
            newPage,
            pagination.limit
        );
    };

    const changeLimit = async (newLimit) => {
        setPagination((prev) => ({ ...prev, limit: newLimit, currentPage: 1 }));
        await performSearch(searchTerm, selectedCategory, 1, newLimit);
    };

    const performSearch = async (
        searchQuery,
        categoryFilter,
        page = 1,
        limit = 20
    ) => {
        setLoading(true);
        setError(null);

        try {
            let response;

            if (searchQuery.trim()) {
                // Search with term
                const params = {
                    ...(categoryFilter && { category: categoryFilter }),
                    page,
                    limit,
                };
                response = await searchProducts(searchQuery, params);
            } else {
                // Get products by category or all products
                const params = {
                    ...(categoryFilter && { category: categoryFilter }),
                    page,
                    limit,
                };
                response = await getProducts(params);
            }

            if (response.success) {
                const products = response.data.products || [];
                setSearchResults(products);
                setPagination({
                    currentPage: response.data.pagination?.currentPage || page,
                    totalPages: response.data.pagination?.totalPages || 1,
                    totalItems:
                        response.data.pagination?.totalProducts ||
                        products.length ||
                        0,
                    limit: response.data.pagination?.limit || limit,
                    hasNextPage: response.data.pagination?.hasNextPage || false,
                    hasPrevPage: response.data.pagination?.hasPrevPage || false,
                });

                // Check which products are already in inventory
                checkExistingProducts(products);

                if (products.length === 0) {
                    setError("No products found matching your criteria");
                }
            } else {
                setError("Failed to search products");
            }
        } catch (err) {
            logger.error("Product search failed:", err);
            setError("Failed to search products. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        await performSearch(searchTerm, selectedCategory, 1, pagination.limit);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const ProductRow = ({ product }) => {
        const isSelected = selectedProduct?._id === product._id;
        const isInInventory = existingProducts.has(product._id);
        const [localChecking, setLocalChecking] = useState(false);

        const handleProductSelect = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Prevent selection if product is already in inventory
            if (isInInventory) {
                alert(
                    "This product is already in your inventory. You cannot add it again."
                );
                return;
            }

            // Don't select if already selected - allow deselection by clicking again
            if (isSelected) {
                console.log("Product deselected:", product.name);
                onProductSelect(null);
                return;
            }

            // Check if product exists in vendor inventory before selection
            setLocalChecking(true);
            try {
                const response = await getVendorProductByMasterProductId(
                    product._id
                );

                if (response.success && response.data) {
                    // Product already exists in inventory
                    setExistingProducts(
                        (prev) => new Set([...prev, product._id])
                    );
                    alert(
                        "This product is already in your inventory. You cannot add it again."
                    );
                } else {
                    // Product doesn't exist, safe to select
                    console.log("Product selected:", product.name, product);
                    onProductSelect(product);
                }
            } catch (error) {
                logger.error("Error checking product in inventory:", error);
                // On error, allow selection but warn user
                console.log(
                    "Product selected with warning:",
                    product.name,
                    product
                );
                onProductSelect(product);
            } finally {
                setLocalChecking(false);
            }
        };

        return (
            <tr
                className={`transition-colors ${
                    isInInventory
                        ? "bg-red-50 cursor-not-allowed opacity-75"
                        : isSelected
                        ? "bg-blue-50 border-l-4 border-primary cursor-pointer"
                        : "cursor-pointer hover:bg-gray-50"
                }`}
                onClick={!isInInventory ? handleProductSelect : undefined}
            >
                {/* Product Name with Image */}
                <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10">
                            {product.images?.[0]?.url ? (
                                <img
                                    src={product.images[0].url}
                                    alt={
                                        product.images[0].altText ||
                                        product.name
                                    }
                                    className="h-10 w-10 rounded object-cover"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                    }}
                                />
                            ) : (
                                <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                                    <FaImage className="w-4 h-4 text-text-quaternary" />
                                </div>
                            )}
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-text-primary">
                                {product.name}
                            </div>
                        </div>
                    </div>
                </td>

                {/* Brand */}
                <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-secondary">
                        {product.brand}
                    </div>
                </td>

                {/* Category */}
                <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-secondary">
                        {product.category?.name || product.category || "-"}
                    </div>
                </td>

                {/* HSN Code */}
                <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-secondary">
                        {product.hsn || "-"}
                    </div>
                </td>

                {/* Base Price */}
                <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-text-primary">
                        {product.basePrice
                            ? `₹${product.basePrice.toLocaleString("en-IN")}`
                            : "-"}
                    </div>
                </td>

                {/* Action */}
                <td className="px-4 py-4 whitespace-nowrap text-center">
                    {localChecking ? (
                        <div className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                            <div className="animate-spin w-3 h-3 mr-1 border border-gray-400 border-t-transparent rounded-full"></div>
                            Checking...
                        </div>
                    ) : isInInventory ? (
                        <div className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-700 border border-red-300">
                            <FaExclamationTriangle className="w-3 h-3 mr-1" />
                            Already Added
                        </div>
                    ) : (
                        <button
                            type="button"
                            className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                isSelected
                                    ? "bg-primary text-white"
                                    : "bg-white text-primary border border-primary hover:bg-primary hover:text-white"
                            }`}
                            onClick={handleProductSelect}
                        >
                            {isSelected ? (
                                <>
                                    <FaCheck className="w-3 h-3 mr-1" />
                                    Selected
                                </>
                            ) : (
                                "Select"
                            )}
                        </button>
                    )}
                </td>
            </tr>
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
            <div>
                <h3 className="text-base sm:text-lg font-medium text-text-primary mb-2 sm:mb-4">
                    Select Product from Catalog
                </h3>
                <p className="text-text-tertiary text-xs sm:text-sm">
                    Search for products from the catalog to add to your
                    inventory
                </p>
            </div>

            {/* Search Controls */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                    {/* Search Input */}
                    <div className="lg:col-span-2">
                        <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1">
                            Search Products
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Search by product name, brand, or HSN..."
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-quaternary w-4 h-4" />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1">
                            Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) =>
                                setSelectedCategory(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Search Button */}
                <div className="mt-3 sm:mt-4">
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Searching...
                            </>
                        ) : (
                            <>
                                <FaSearch className="w-4 h-4" />
                                Search Products
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="max-w-full overflow-hidden">
                    {/* Inventory checking indicator */}
                    {checkingInventory && (
                        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-center text-sm text-blue-700">
                                <div className="animate-spin w-4 h-4 mr-2 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                Checking which products are already in your
                                inventory...
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-3 sm:mb-4">
                        <h4 className="text-sm sm:text-md font-medium text-text-primary">
                            {searchTerm.trim()
                                ? `Search Results (${pagination.totalItems} products found)`
                                : `Available Products (${pagination.totalItems} products)`}
                        </h4>

                        {/* Items per page selector */}
                        <div className="flex items-center space-x-2 mt-2 lg:mt-0">
                            <label className="text-xs sm:text-sm text-text-secondary">
                                Show:
                            </label>
                            <select
                                value={pagination.limit}
                                onChange={(e) =>
                                    changeLimit(parseInt(e.target.value))
                                }
                                className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={loading}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="text-xs sm:text-sm text-text-secondary">
                                per page
                            </span>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="overflow-x-auto max-w-full">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Brand
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        HSN Code
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Base Price
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {searchResults.map((product) => (
                                    <ProductRow
                                        key={product._id}
                                        product={product}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Custom Pagination Component */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    {/* Mobile pagination */}
                                    <button
                                        onClick={() =>
                                            changePage(
                                                pagination.currentPage - 1
                                            )
                                        }
                                        disabled={
                                            !pagination.hasPrevPage || loading
                                        }
                                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() =>
                                            changePage(
                                                pagination.currentPage + 1
                                            )
                                        }
                                        disabled={
                                            !pagination.hasNextPage || loading
                                        }
                                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>

                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-text-secondary">
                                            Showing{" "}
                                            <span className="font-medium">
                                                {(pagination.currentPage - 1) *
                                                    pagination.limit +
                                                    1}
                                            </span>{" "}
                                            to{" "}
                                            <span className="font-medium">
                                                {Math.min(
                                                    pagination.currentPage *
                                                        pagination.limit,
                                                    pagination.totalItems
                                                )}
                                            </span>{" "}
                                            of{" "}
                                            <span className="font-medium">
                                                {pagination.totalItems}
                                            </span>{" "}
                                            results
                                        </p>
                                    </div>

                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                            {/* Previous button */}
                                            <button
                                                onClick={() =>
                                                    changePage(
                                                        pagination.currentPage -
                                                            1
                                                    )
                                                }
                                                disabled={
                                                    !pagination.hasPrevPage ||
                                                    loading
                                                }
                                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-text-quaternary ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">
                                                    Previous
                                                </span>
                                                <svg
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>

                                            {/* Page numbers */}
                                            {Array.from(
                                                {
                                                    length: Math.min(
                                                        5,
                                                        pagination.totalPages
                                                    ),
                                                },
                                                (_, i) => {
                                                    let pageNum;
                                                    if (
                                                        pagination.totalPages <=
                                                        5
                                                    ) {
                                                        pageNum = i + 1;
                                                    } else if (
                                                        pagination.currentPage <=
                                                        3
                                                    ) {
                                                        pageNum = i + 1;
                                                    } else if (
                                                        pagination.currentPage >=
                                                        pagination.totalPages -
                                                            2
                                                    ) {
                                                        pageNum =
                                                            pagination.totalPages -
                                                            4 +
                                                            i;
                                                    } else {
                                                        pageNum =
                                                            pagination.currentPage -
                                                            2 +
                                                            i;
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() =>
                                                                changePage(
                                                                    pageNum
                                                                )
                                                            }
                                                            disabled={loading}
                                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 ${
                                                                pageNum ===
                                                                pagination.currentPage
                                                                    ? "z-10 bg-primary text-white focus:z-20"
                                                                    : "text-text-primary"
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                }
                                            )}

                                            {/* Next button */}
                                            <button
                                                onClick={() =>
                                                    changePage(
                                                        pagination.currentPage +
                                                            1
                                                    )
                                                }
                                                disabled={
                                                    !pagination.hasNextPage ||
                                                    loading
                                                }
                                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-text-quaternary ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">
                                                    Next
                                                </span>
                                                <svg
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* No Results */}
            {searchResults.length === 0 && !loading && error && (
                <div className="text-center py-8">
                    <FaBox className="w-12 h-12 text-text-quaternary mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-text-primary mb-2">
                        No products found
                    </h4>
                    <p className="text-text-tertiary">
                        Try adjusting your search term or category filter
                    </p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <Loader size="lg" text="Loading products..." />
                </div>
            )}
        </div>
    );
};

export default ProductSearch;
