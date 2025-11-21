import React, { useState, useRef } from "react";
import {
    FaFileUpload,
    FaHistory,
    FaUpload,
    FaDownload,
    FaFileAlt,
    FaCheckCircle,
    FaTimes,
    FaExclamationTriangle,
    FaRedo,
    FaCloudUploadAlt,
    FaFileExport,
    FaPlay,
} from "react-icons/fa";
import {
    bulkUpdateInventory,
    downloadRollbackFile,
    downloadTemplate,
} from "../../api/bulk.api.js";
import logger from "../../utils/logger.util.js";
import Loader from "../../components/common/Loader.jsx";

const BulkOperationsPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState(null);
    const [rollbackData, setRollbackData] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Handle file selection
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        setError(null);
        setResults(null);
        setRollbackData(null);

        if (!file) {
            setSelectedFile(null);
            return;
        }

        // Validate file type
        const allowedTypes = [
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];

        const isValidType =
            allowedTypes.includes(file.type) ||
            file.name.toLowerCase().endsWith(".csv") ||
            file.name.toLowerCase().endsWith(".xlsx") ||
            file.name.toLowerCase().endsWith(".xls");

        if (!isValidType) {
            setError("Please select a valid CSV or Excel file");
            return;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            setError("File size should not exceed 10MB");
            return;
        }

        setSelectedFile(file);
        logger.info("File selected:", file.name);
    };

    // Handle bulk update processing
    const handleBulkUpdate = async () => {
        if (!selectedFile) {
            setError("Please select a file first");
            return;
        }

        setIsProcessing(true);
        setError(null);
        setResults(null);
        setRollbackData(null);

        try {
            const response = await bulkUpdateInventory(selectedFile);
            // Backend sends data nested in response.data.data.results
            setResults(response.data.data.results);
            setRollbackData(response.data.data.rollbackData);
            logger.info("Bulk update completed:", response.data);

            // Reset file selection after successful processing
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err) {
            logger.error("Bulk update error:", err);
            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Failed to process bulk update"
            );
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle template download
    const handleDownloadTemplate = async () => {
        try {
            await downloadTemplate();
            logger.info("Template downloaded successfully");
        } catch (err) {
            logger.error("Template download error:", err);
            setError("Failed to download template");
        }
    };

    // Handle rollback file download
    const handleDownloadRollback = async () => {
        if (!rollbackData || rollbackData.length === 0) {
            setError("No rollback data available");
            return;
        }

        try {
            await downloadRollbackFile(rollbackData);
            logger.info("Rollback file downloaded successfully");
        } catch (err) {
            logger.error("Rollback download error:", err);
            setError("Failed to download rollback file");
        }
    };

    // Reset form
    const handleReset = () => {
        setSelectedFile(null);
        setResults(null);
        setRollbackData(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "processed":
                return <FaCheckCircle className="w-4 h-4 text-green-600" />;
            case "skipped":
                return (
                    <FaExclamationTriangle className="w-4 h-4 text-orange-600" />
                );
            case "failed":
                return <FaTimes className="w-4 h-4 text-red-600" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "processed":
                return "text-green-600";
            case "skipped":
                return "text-orange-600";
            case "failed":
                return "text-red-600";
            default:
                return "text-text-tertiary";
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">
                        Bulk Operations
                    </h1>
                    <p className="text-text-tertiary mt-1">
                        Update multiple products at once using CSV or Excel
                        files
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 text-text-secondary">
                        <FaHistory className="w-4 h-4" />
                        <span>History</span>
                    </button>
                </div>
            </div>

            {/* Getting Started Card */}
            <div className="bg-white rounded-lg shadow border-l-4 border-l-primary p-6">
                <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-lg bg-blue-50">
                        <FaCloudUploadAlt className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-medium text-text-primary mb-2">
                            Getting Started
                        </h3>
                        <p className="text-text-secondary mb-4">
                            Update multiple products at once by uploading a CSV
                            or Excel file. Download the template to get the
                            correct format.
                        </p>
                        <button
                            onClick={handleDownloadTemplate}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-text-inverse rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <FaDownload className="w-4 h-4" />
                            <span>Download Template</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-text-primary mb-4">
                    Upload File
                </h3>

                {/* File Drop Zone */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <FaFileUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-text-primary mb-2">
                            Choose a file or drag it here
                        </p>
                        <p className="text-text-tertiary mb-4">
                            Supports CSV, XLSX, and XLS files up to 10MB
                        </p>
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-text-secondary rounded-lg hover:bg-gray-200 transition-colors">
                            <FaFileAlt className="w-4 h-4" />
                            <span>Select File</span>
                        </div>
                    </label>
                </div>

                {/* Selected File Info */}
                {selectedFile && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <FaFileAlt className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-900">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-sm text-green-700">
                                        {(selectedFile.size / 1024).toFixed(1)}{" "}
                                        KB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleReset}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleBulkUpdate}
                        disabled={!selectedFile || isProcessing}
                        className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 bg-secondary text-text-inverse rounded-lg hover:bg-secondary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                {/* Custom Loader */}
                                <div className="flex items-center justify-center gap-4">
                                    <div className="w-4 h-4 animate-spin border-2  border-secondary border-t-white  rounded-full" />
                                    <p className="text-sm text-white animate-pulse">
                                        Processing...
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <FaPlay className="w-4 h-4" />
                                <span>Process File</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-6 py-3 border border-gray-300 text-text-secondary rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-white rounded-lg shadow border-l-4 border-l-danger p-6">
                    <div className="flex items-start space-x-3">
                        <FaTimes className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-red-900 mb-1">
                                Error Processing File
                            </h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Display */}
            {results && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-l-blue-500">
                            <div className="flex items-center">
                                <div className="p-3 rounded-lg bg-blue-50">
                                    <FaFileAlt className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-semibold text-text-primary">
                                        {results.totalRows}
                                    </p>
                                    <p className="text-sm text-text-tertiary">
                                        Total Rows
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-l-green-500">
                            <div className="flex items-center">
                                <div className="p-3 rounded-lg bg-green-50">
                                    <FaCheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-semibold text-text-primary">
                                        {results.processed}
                                    </p>
                                    <p className="text-sm text-text-tertiary">
                                        Processed
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-l-orange-500">
                            <div className="flex items-center">
                                <div className="p-3 rounded-lg bg-orange-50">
                                    <FaExclamationTriangle className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-semibold text-text-primary">
                                        {results.skipped}
                                    </p>
                                    <p className="text-sm text-text-tertiary">
                                        Skipped
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-l-red-500">
                            <div className="flex items-center">
                                <div className="p-3 rounded-lg bg-red-50">
                                    <FaTimes className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-semibold text-text-primary">
                                        {results.failed}
                                    </p>
                                    <p className="text-sm text-text-tertiary">
                                        Failed
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rollback Option */}
                    {rollbackData && rollbackData.length > 0 && (
                        <div className="bg-white rounded-lg shadow border-l-4 border-l-accent p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 rounded-lg bg-orange-50">
                                        <FaHistory className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-text-primary mb-1">
                                            Rollback Available
                                        </h3>
                                        <p className="text-text-secondary">
                                            Download a file to restore the
                                            original values if needed
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDownloadRollback}
                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-accent text-text-inverse rounded-lg hover:bg-accent-dark transition-colors"
                                >
                                    <FaFileExport className="w-4 h-4" />
                                    <span>Download Rollback</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Detailed Results */}
                    {results.details && results.details.length > 0 && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b">
                                <h3 className="text-lg font-medium text-text-primary">
                                    Processing Details
                                </h3>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                                Row
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                                Details
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {results.details.map(
                                            (detail, index) => (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                                        {detail.row}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div
                                                            className={`flex items-center space-x-2 text-sm ${getStatusColor(
                                                                detail.status
                                                            )}`}
                                                        >
                                                            {getStatusIcon(
                                                                detail.status
                                                            )}
                                                            <span className="capitalize">
                                                                {detail.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                                        {detail.productName ||
                                                            "-"}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-text-secondary">
                                                        {detail.reason ||
                                                            (detail.updatedFields
                                                                ? `Updated: ${detail.updatedFields.join(
                                                                      ", "
                                                                  )}`
                                                                : "-")}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Instructions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-text-primary mb-4">
                    How It Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-text-secondary mb-2">
                            Supported Formats
                        </h4>
                        <ul className="space-y-1 text-sm text-text-tertiary">
                            <li>• CSV files (.csv)</li>
                            <li>• Excel files (.xlsx, .xls)</li>
                            <li>• Maximum file size: 10MB</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-text-secondary mb-2">
                            Supported Fields
                        </h4>
                        <ul className="space-y-1 text-sm text-text-tertiary">
                            <li>• Product Name (required for matching)</li>
                            <li>• Current Stock, Selling Price, Cost Price</li>
                            <li>• Min Stock Level, Max Stock Level</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-text-secondary">
                        <strong>Important:</strong> Products are matched by
                        exact name. Only existing products in your inventory
                        will be updated. Download the template to ensure correct
                        formatting.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BulkOperationsPage;
