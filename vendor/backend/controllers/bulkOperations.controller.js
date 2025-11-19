import {
    processBulkInventoryUpdate,
    generateSampleCSV,
} from "../services/bulkOperations.service.js";
import apiResponse from "../utils/response.util.js";
import logger from "../utils/logger.util.js";
import * as XLSX from "xlsx";
import Vendor from "../models/vendor.model.js";

// Process bulk inventory update
const bulkUpdate = async (req, res) => {
    try {
        // File is already validated by upload middleware
        const file = req.file;

        // Find the vendor using the user ID
        const vendor = await Vendor.findOne({ userId: req.user.id });
        if (!vendor) {
            return apiResponse.badRequest(
                res,
                "Vendor profile not found for this user"
            );
        }

        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname.toLowerCase();

        // Determine file type
        let fileType;
        if (fileName.endsWith(".csv")) {
            fileType = "csv";
        } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
            fileType = "excel";
        } else {
            return apiResponse.badRequest(
                res,
                "Unsupported file format. Please upload CSV or Excel files only."
            );
        }

        logger.info(
            `Processing bulk update file: ${req.file.originalname}, type: ${fileType}`
        );

        // Process the bulk update
        const results = await processBulkInventoryUpdate(
            vendor._id,
            fileBuffer,
            fileType
        );

        // Generate rollback CSV if there are updates
        let rollbackCSV = null;
        if (results.rollbackData && results.rollbackData.length > 0) {
            rollbackCSV = generateRollbackCSV(results.rollbackData);
        }

        const responseData = {
            results,
            rollbackAvailable: rollbackCSV !== null,
        };

        // Store rollback data in response headers for download
        if (rollbackCSV) {
            res.setHeader("X-Rollback-Available", "true");
        }

        return apiResponse.success(
            res,
            "Bulk update completed successfully",
            responseData,
            {
                summary: `Processed: ${results.processed}, Skipped: ${results.skipped}, Failed: ${results.failed}`,
                actualUpdated: results.actualUpdated,
            }
        );
    } catch (error) {
        logger.error("Bulk update controller error:", error.message);

        if (
            error.message.includes("Unsupported file type") ||
            error.message.includes("Failed to parse file") ||
            error.message.includes("No valid data found")
        ) {
            return apiResponse.badRequest(res, error.message);
        }

        return apiResponse.serverError(res, "Failed to process bulk update");
    }
};

// Download rollback CSV
const downloadRollback = async (req, res) => {
    try {
        const { rollbackData } = req.body;

        if (
            !rollbackData ||
            !Array.isArray(rollbackData) ||
            rollbackData.length === 0
        ) {
            return apiResponse.badRequest(res, "No rollback data provided");
        }

        const rollbackCSV = generateRollbackCSV(rollbackData);

        const timestamp = new Date().toISOString().split("T")[0];
        const filename = `inventory_rollback_${timestamp}.csv`;

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );
        res.setHeader("Content-Length", rollbackCSV.length);

        return res.send(rollbackCSV);
    } catch (error) {
        logger.error("Download rollback controller error:", error.message);
        return apiResponse.serverError(res, "Failed to generate rollback file");
    }
};

// Download sample template
const downloadTemplate = async (req, res) => {
    try {
        const templateCSV = generateSampleCSV();

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="inventory_template.csv"'
        );
        res.setHeader("Content-Length", templateCSV.length);

        return res.send(templateCSV);
    } catch (error) {
        logger.error("Download template controller error:", error.message);
        return apiResponse.serverError(res, "Failed to generate template file");
    }
};

// Helper function to generate rollback CSV
const generateRollbackCSV = (rollbackData) => {
    const csvData = [
        [
            "Product Name",
            "Current Stock",
            "Selling Price",
            "Cost Price",
            "Min Stock Level",
            "Max Stock Level",
        ],
    ];

    rollbackData.forEach((item) => {
        const original = item.originalData;
        csvData.push([
            item.productName,
            original.currentStock || "",
            original.sellingPrice || "",
            original.costPrice || "",
            original.minStockLevel || "",
            original.maxStockLevel || "",
        ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rollback Data");

    return XLSX.write(workbook, { type: "buffer", bookType: "csv" });
};

export { bulkUpdate, downloadRollback, downloadTemplate };
