import React from "react";

const InventoryTableSkeleton = () => {
    // Generate skeleton rows
    const skeletonRows = Array.from({ length: 10 }, (_, index) => (
        <tr key={index} className="border-b border-gray-100">
            <td className="px-4 py-3">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
            </td>
            <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            </td>
            <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            </td>
            <td className="px-4 py-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-12" />
            </td>
            <td className="px-4 py-3">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
            </td>
            <td className="px-4 py-3">
                <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                </div>
            </td>
        </tr>
    ));

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 text-sm font-medium text-gray-500 bg-gray-50">
                <div className="col-span-4">Product</div>
                <div className="col-span-1">Category</div>
                <div className="col-span-1">Price</div>
                <div className="col-span-1">Disc. Price</div>
                <div className="col-span-1">Stock</div>
                <div className="col-span-2">Expiry</div>
                <div className="col-span-2">Actions</div>
            </div>

            {/* Skeleton Table Body */}
            <div className="divide-y divide-gray-100">
                <table className="w-full">
                    <tbody>{skeletonRows}</tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryTableSkeleton;
