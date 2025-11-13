import React, { useState, useEffect } from "react";
import {
    FaCalendarAlt,
    FaBarcode,
    FaTrashAlt,
    FaPlus,
    FaExclamationTriangle,
    FaInfoCircle,
    FaClock,
} from "react-icons/fa";

const VendorExpiryBatches = ({
    expiryData,
    onExpiryChange,
    selectedProduct,
    inventoryData,
}) => {
    const { batches = [], enableBatchTracking = false } = expiryData;
    const { addStock = 0 } = inventoryData;

    const [totalBatchQuantity, setTotalBatchQuantity] = useState(0);

    useEffect(() => {
        const total = batches.reduce(
            (sum, batch) => sum + (batch.quantity || 0),
            0
        );
        setTotalBatchQuantity(total);
    }, [batches]);

    const handleBatchTrackingToggle = (enabled) => {
        if (enabled && batches.length === 0) {
            // Add a default batch when enabling tracking
            const newBatch = {
                id: Date.now(),
                batchNumber: `BATCH-${Date.now()}`,
                expiryDate: "",
                quantity: addStock || 0,
                purchaseDate: new Date().toISOString().split("T")[0],
                manufacturingDate: "",
                notes: "",
            };
            onExpiryChange({
                ...expiryData,
                enableBatchTracking: enabled,
                batches: [newBatch],
            });
        } else {
            onExpiryChange({
                ...expiryData,
                enableBatchTracking: enabled,
                batches: enabled ? batches : [],
            });
        }
    };

    const addNewBatch = () => {
        const newBatch = {
            id: Date.now(),
            batchNumber: `BATCH-${Date.now()}`,
            expiryDate: "",
            quantity: 0,
            purchaseDate: new Date().toISOString().split("T")[0],
            manufacturingDate: "",
            notes: "",
        };
        onExpiryChange({
            ...expiryData,
            batches: [...batches, newBatch],
        });
    };

    const updateBatch = (batchId, field, value) => {
        const updatedBatches = batches.map((batch) =>
            batch.id === batchId
                ? {
                      ...batch,
                      [field]:
                          field === "quantity" ? parseInt(value) || 0 : value,
                  }
                : batch
        );
        onExpiryChange({
            ...expiryData,
            batches: updatedBatches,
        });
    };

    const removeBatch = (batchId) => {
        const updatedBatches = batches.filter((batch) => batch.id !== batchId);
        onExpiryChange({
            ...expiryData,
            batches: updatedBatches,
        });
    };

    const getExpiryStatus = (expiryDate) => {
        if (!expiryDate) return null;

        const today = new Date();
        const expiry = new Date(expiryDate);
        const daysUntilExpiry = Math.ceil(
            (expiry - today) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry < 0) {
            return {
                status: "expired",
                color: "text-red-600",
                bg: "bg-red-50",
                days: Math.abs(daysUntilExpiry),
            };
        } else if (daysUntilExpiry <= 7) {
            return {
                status: "critical",
                color: "text-red-600",
                bg: "bg-red-50",
                days: daysUntilExpiry,
            };
        } else if (daysUntilExpiry <= 30) {
            return {
                status: "warning",
                color: "text-yellow-600",
                bg: "bg-yellow-50",
                days: daysUntilExpiry,
            };
        } else if (daysUntilExpiry <= 90) {
            return {
                status: "caution",
                color: "text-blue-600",
                bg: "bg-blue-50",
                days: daysUntilExpiry,
            };
        } else {
            return {
                status: "good",
                color: "text-green-600",
                bg: "bg-green-50",
                days: daysUntilExpiry,
            };
        }
    };

    const quantityMismatch =
        enableBatchTracking && totalBatchQuantity !== addStock && addStock > 0;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                    Expiry & Batch Management
                </h3>
                <p className="text-text-tertiary text-sm">
                    Track expiry dates and manage product batches for better
                    inventory control
                </p>
            </div>

            {/* Batch Tracking Toggle */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <FaBarcode className="w-5 h-5 text-text-secondary mr-2" />
                        <div>
                            <h4 className="text-md font-medium text-text-primary">
                                Enable Batch Tracking
                            </h4>
                            <p className="text-sm text-text-tertiary">
                                Track individual batches with separate expiry
                                dates
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={enableBatchTracking}
                            onChange={(e) =>
                                handleBatchTrackingToggle(e.target.checked)
                            }
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>

            {/* Single Expiry Date (when batch tracking is disabled) */}
            {!enableBatchTracking && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Product Expiry Date
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={batches[0]?.expiryDate || ""}
                                onChange={(e) => {
                                    const singleBatch = {
                                        id: 1,
                                        batchNumber: "SINGLE",
                                        expiryDate: e.target.value,
                                        quantity: addStock,
                                        purchaseDate: new Date()
                                            .toISOString()
                                            .split("T")[0],
                                        manufacturingDate: "",
                                        notes: "",
                                    };
                                    onExpiryChange({
                                        ...expiryData,
                                        batches: e.target.value
                                            ? [singleBatch]
                                            : [],
                                    });
                                }}
                                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-quaternary w-4 h-4" />
                        </div>
                        {batches[0]?.expiryDate && (
                            <div className="mt-2">
                                {(() => {
                                    const expiryStatus = getExpiryStatus(
                                        batches[0].expiryDate
                                    );
                                    return expiryStatus ? (
                                        <div
                                            className={`inline-flex items-center px-2 py-1 rounded text-sm ${expiryStatus.bg} ${expiryStatus.color}`}
                                        >
                                            <FaClock className="w-3 h-3 mr-1" />
                                            {expiryStatus.status === "expired"
                                                ? `Expired ${expiryStatus.days} days ago`
                                                : `${expiryStatus.days} days until expiry`}
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Batch Management (when batch tracking is enabled) */}
            {enableBatchTracking && (
                <div className="space-y-4">
                    {/* Quantity Validation */}
                    {quantityMismatch && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <div className="flex">
                                <FaExclamationTriangle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">
                                        Quantity Mismatch
                                    </p>
                                    <p className="text-sm text-yellow-600">
                                        Total batch quantities (
                                        {totalBatchQuantity}) don't match
                                        inventory quantity ({addStock}). Please
                                        adjust batch quantities.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add New Batch Button */}
                    <div className="flex justify-between items-center">
                        <h4 className="text-md font-medium text-text-primary">
                            Product Batches
                        </h4>
                        <button
                            type="button"
                            onClick={addNewBatch}
                            className="inline-flex items-center px-3 py-2 border border-primary text-primary bg-white rounded-md text-sm hover:bg-primary hover:text-white transition-colors"
                        >
                            <FaPlus className="w-3 h-3 mr-2" />
                            Add Batch
                        </button>
                    </div>

                    {/* Batch Cards */}
                    <div className="space-y-4">
                        {batches.map((batch, index) => {
                            const expiryStatus = getExpiryStatus(
                                batch.expiryDate
                            );

                            return (
                                <div
                                    key={batch.id}
                                    className="border border-gray-200 rounded-lg p-4 space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-sm font-medium text-text-primary">
                                            Batch #{index + 1}
                                        </h5>
                                        {batches.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeBatch(batch.id)
                                                }
                                                className="text-danger hover:bg-red-50 p-1 rounded transition-colors"
                                            >
                                                <FaTrashAlt className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Batch Number */}
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">
                                                Batch Number
                                            </label>
                                            <input
                                                type="text"
                                                value={batch.batchNumber}
                                                onChange={(e) =>
                                                    updateBatch(
                                                        batch.id,
                                                        "batchNumber",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                                placeholder="Enter batch number"
                                            />
                                        </div>

                                        {/* Quantity */}
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">
                                                Quantity
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={batch.quantity || ""}
                                                    onChange={(e) =>
                                                        updateBatch(
                                                            batch.id,
                                                            "quantity",
                                                            e.target.value
                                                        )
                                                    }
                                                    min="0"
                                                    className="w-full px-2 py-1 pr-12 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                                    placeholder="0"
                                                />
                                                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-text-quaternary text-xs">
                                                    {selectedProduct?.unit ||
                                                        "units"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Expiry Date */}
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">
                                                Expiry Date
                                            </label>
                                            <input
                                                type="date"
                                                value={batch.expiryDate}
                                                onChange={(e) =>
                                                    updateBatch(
                                                        batch.id,
                                                        "expiryDate",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                            />
                                            {expiryStatus && (
                                                <div
                                                    className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs ${expiryStatus.bg} ${expiryStatus.color}`}
                                                >
                                                    <FaClock className="w-2 h-2 mr-1" />
                                                    {expiryStatus.status ===
                                                    "expired"
                                                        ? `Expired ${expiryStatus.days} days ago`
                                                        : `${expiryStatus.days} days`}
                                                </div>
                                            )}
                                        </div>

                                        {/* Purchase Date */}
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">
                                                Purchase Date
                                            </label>
                                            <input
                                                type="date"
                                                value={batch.purchaseDate}
                                                onChange={(e) =>
                                                    updateBatch(
                                                        batch.id,
                                                        "purchaseDate",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                            />
                                        </div>

                                        {/* Manufacturing Date */}
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">
                                                Manufacturing Date
                                            </label>
                                            <input
                                                type="date"
                                                value={batch.manufacturingDate}
                                                onChange={(e) =>
                                                    updateBatch(
                                                        batch.id,
                                                        "manufacturingDate",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                            />
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">
                                                Notes
                                            </label>
                                            <input
                                                type="text"
                                                value={batch.notes}
                                                onChange={(e) =>
                                                    updateBatch(
                                                        batch.id,
                                                        "notes",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                                placeholder="Optional notes"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Batch Summary */}
                    {batches.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-text-primary mb-2">
                                Batch Summary
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-text-tertiary">
                                        Total Batches
                                    </p>
                                    <p className="text-lg font-semibold text-text-primary">
                                        {batches.length}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-text-tertiary">
                                        Total Quantity
                                    </p>
                                    <p className="text-lg font-semibold text-text-primary">
                                        {totalBatchQuantity}{" "}
                                        {selectedProduct?.unit || "units"}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-text-tertiary">
                                        Earliest Expiry
                                    </p>
                                    <p className="text-lg font-semibold text-text-primary">
                                        {batches.some((b) => b.expiryDate)
                                            ? (() => {
                                                  const earliestExpiry = batches
                                                      .filter(
                                                          (b) => b.expiryDate
                                                      )
                                                      .sort(
                                                          (a, b) =>
                                                              new Date(
                                                                  a.expiryDate
                                                              ) -
                                                              new Date(
                                                                  b.expiryDate
                                                              )
                                                      )[0];
                                                  return earliestExpiry
                                                      ? new Date(
                                                            earliestExpiry.expiryDate
                                                        ).toLocaleDateString()
                                                      : "—";
                                              })()
                                            : "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Expiry Management Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                    <FaInfoCircle className="w-4 h-4 mr-2" />
                    Expiry Management Tips
                </h5>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                        • Use batch tracking for products with varying expiry
                        dates
                    </li>
                    <li>• Monitor products expiring within 30 days</li>
                    <li>
                        • Implement FIFO (First In, First Out) for stock
                        rotation
                    </li>
                    <li>• Set alerts for products nearing expiry</li>
                </ul>
            </div>
        </div>
    );
};

export default VendorExpiryBatches;
