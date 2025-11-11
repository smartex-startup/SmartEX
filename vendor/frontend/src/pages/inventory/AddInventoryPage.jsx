import React from "react";
import { FaChevronRight, FaPlus } from "react-icons/fa";

const AddInventoryPage = () => {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <nav className="flex items-center space-x-2 text-sm text-text-tertiary mb-4">
                    <span>Inventory</span>
                    <FaChevronRight className="w-4 h-4" />
                    <span className="text-text-primary">Add to Inventory</span>
                </nav>
                <h1 className="text-2xl font-semibold text-text-primary">
                    Add to Inventory
                </h1>
                <p className="text-text-secondary mt-1">
                    Search products from catalog and add them to your inventory
                    with stock details
                </p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FaPlus className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-medium text-text-primary mb-2">
                            Add to Inventory
                        </h3>
                        <p className="text-text-tertiary">
                            Search products from the catalog and add them to
                            your inventory with stock quantities and pricing.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddInventoryPage;
