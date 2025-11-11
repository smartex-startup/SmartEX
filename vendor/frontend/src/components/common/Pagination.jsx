import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useInventory } from "../../context/InventoryContext";

const Pagination = () => {
    const { pagination, changePage, changeLimit } = useInventory();

    const {
        currentPage,
        totalPages,
        totalItems,
        limit,
        hasNextPage,
        hasPrevPage,
    } = pagination;

    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, "...");
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push("...", totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalItems);

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                {/* Mobile pagination */}
                <button
                    onClick={() => changePage(currentPage - 1)}
                    disabled={!hasPrevPage}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button
                    onClick={() => changePage(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>

            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4">
                    <p className="text-sm text-text-secondary">
                        Showing <span className="font-medium">{startItem}</span>{" "}
                        to <span className="font-medium">{endItem}</span> of{" "}
                        <span className="font-medium">{totalItems}</span>{" "}
                        results
                    </p>

                    <div className="flex items-center space-x-2">
                        <label
                            htmlFor="items-per-page"
                            className="text-sm text-text-secondary"
                        >
                            Items per page:
                        </label>
                        <select
                            id="items-per-page"
                            value={limit}
                            onChange={(e) =>
                                changeLimit(parseInt(e.target.value))
                            }
                            className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                <div>
                    <nav
                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                        aria-label="Pagination"
                    >
                        {/* Previous button */}
                        <button
                            onClick={() => changePage(currentPage - 1)}
                            disabled={!hasPrevPage}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-text-quaternary ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Previous</span>
                            <FaChevronLeft className="h-5 w-5" />
                        </button>

                        {/* Page numbers */}
                        {getPageNumbers().map((page, index) => {
                            if (page === "...") {
                                return (
                                    <span
                                        key={index}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-text-secondary ring-1 ring-inset ring-gray-300"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => changePage(page)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                                        page === currentPage
                                            ? "z-10 bg-primary text-text-inverse focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                            : "text-text-primary"
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        {/* Next button */}
                        <button
                            onClick={() => changePage(currentPage + 1)}
                            disabled={!hasNextPage}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-text-quaternary ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Next</span>
                            <FaChevronRight className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
