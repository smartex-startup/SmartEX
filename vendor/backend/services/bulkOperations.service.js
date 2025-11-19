import VendorProduct from "../models/vendorProduct.model.js";
import Product from "../models/product.model.js";
import logger from "../utils/logger.util.js";
import * as XLSX from "xlsx";

// Process bulk inventory update from uploaded file data
const processBulkInventoryUpdate = async (vendorId, fileData, fileType) => {
    try {
        logger.info(`Starting bulk inventory update for vendor: ${vendorId}`);

        // Parse the uploaded file data
        let parsedData;
        try {
            if (fileType === "csv") {
                parsedData = parseCSVData(fileData);
            } else if (fileType === "excel") {
                parsedData = parseExcelData(fileData);
            } else {
                throw new Error(
                    "Unsupported file type. Only CSV and Excel files are supported."
                );
            }
        } catch (parseError) {
            logger.error("File parsing error:", parseError.message);
            throw new Error(`Failed to parse file: ${parseError.message}`);
        }

        if (!parsedData || parsedData.length === 0) {
            throw new Error("No valid data found in the uploaded file");
        }

        logger.info(`Parsed ${parsedData.length} rows from uploaded file`);

        // Get all vendor's products for lookup
        const vendorProducts = await VendorProduct.find({ vendor: vendorId })
            .populate("product", "name")
            .lean();

        // Create lookup map for faster product name matching
        const productLookupMap = new Map();
        vendorProducts.forEach((vp) => {
            if (vp.product && vp.product.name) {
                productLookupMap.set(
                    vp.product.name.toLowerCase().trim(),
                    vp._id
                );
            }
        });

        // Process each row and prepare bulk operations
        const bulkOperations = [];
        const results = {
            totalRows: parsedData.length,
            processed: 0,
            skipped: 0,
            failed: 0,
            details: [],
            rollbackData: [],
        };

        for (let i = 0; i < parsedData.length; i++) {
            const row = parsedData[i];
            const rowNumber = i + 1;

            try {
                // Validate required fields
                if (!row.productName || row.productName.trim() === "") {
                    results.skipped++;
                    results.details.push({
                        row: rowNumber,
                        status: "skipped",
                        reason: "Missing product name",
                    });
                    continue;
                }

                // Find matching product
                const productKey = row.productName.toLowerCase().trim();
                const vendorProductId = productLookupMap.get(productKey);

                if (!vendorProductId) {
                    results.skipped++;
                    results.details.push({
                        row: rowNumber,
                        status: "skipped",
                        reason: `Product "${row.productName}" not found in vendor inventory`,
                    });
                    continue;
                }

                // Get current product data for rollback
                const currentProduct = vendorProducts.find(
                    (vp) => vp._id.toString() === vendorProductId.toString()
                );
                if (currentProduct) {
                    results.rollbackData.push({
                        productName: row.productName,
                        originalData: {
                            currentStock:
                                currentProduct.inventory?.currentStock || 0,
                            sellingPrice:
                                currentProduct.pricing?.sellingPrice || 0,
                            costPrice: currentProduct.pricing?.costPrice || 0,
                            minStockLevel:
                                currentProduct.inventory?.minStockLevel || 0,
                            maxStockLevel:
                                currentProduct.inventory?.maxStockLevel || 0,
                        },
                    });
                }

                // Prepare update data (only update fields that are provided)
                const updateData = {};

                // Update stock if provided
                if (
                    row.currentStock !== undefined &&
                    row.currentStock !== null &&
                    row.currentStock !== ""
                ) {
                    const stockValue = parseFloat(row.currentStock);
                    if (!isNaN(stockValue) && stockValue >= 0) {
                        updateData["inventory.currentStock"] = stockValue;
                    }
                }

                // Update selling price if provided
                if (
                    row.sellingPrice !== undefined &&
                    row.sellingPrice !== null &&
                    row.sellingPrice !== ""
                ) {
                    const priceValue = parseFloat(row.sellingPrice);
                    if (!isNaN(priceValue) && priceValue >= 0) {
                        updateData["pricing.sellingPrice"] = priceValue;
                    }
                }

                // Update cost price if provided
                if (
                    row.costPrice !== undefined &&
                    row.costPrice !== null &&
                    row.costPrice !== ""
                ) {
                    const costValue = parseFloat(row.costPrice);
                    if (!isNaN(costValue) && costValue >= 0) {
                        updateData["pricing.costPrice"] = costValue;
                    }
                }

                // Update min stock level if provided
                if (
                    row.minStockLevel !== undefined &&
                    row.minStockLevel !== null &&
                    row.minStockLevel !== ""
                ) {
                    const minStockValue = parseFloat(row.minStockLevel);
                    if (!isNaN(minStockValue) && minStockValue >= 0) {
                        updateData["inventory.minStockLevel"] = minStockValue;
                    }
                }

                // Update max stock level if provided
                if (
                    row.maxStockLevel !== undefined &&
                    row.maxStockLevel !== null &&
                    row.maxStockLevel !== ""
                ) {
                    const maxStockValue = parseFloat(row.maxStockLevel);
                    if (!isNaN(maxStockValue) && maxStockValue >= 1) {
                        updateData["inventory.maxStockLevel"] = maxStockValue;
                    }
                }

                // Skip if no valid fields to update
                if (Object.keys(updateData).length === 0) {
                    results.skipped++;
                    results.details.push({
                        row: rowNumber,
                        status: "skipped",
                        reason: "No valid fields to update",
                    });
                    continue;
                }

                // Add to bulk operations
                bulkOperations.push({
                    updateOne: {
                        filter: { _id: vendorProductId },
                        update: { $set: updateData },
                    },
                });

                results.processed++;
                results.details.push({
                    row: rowNumber,
                    status: "processed",
                    productName: row.productName,
                    updatedFields: Object.keys(updateData),
                });
            } catch (rowError) {
                logger.error(
                    `Error processing row ${rowNumber}:`,
                    rowError.message
                );
                results.failed++;
                results.details.push({
                    row: rowNumber,
                    status: "failed",
                    reason: rowError.message,
                });
            }
        }

        // Execute bulk operations if any
        let bulkResult = null;
        if (bulkOperations.length > 0) {
            try {
                bulkResult = await VendorProduct.bulkWrite(bulkOperations);
                logger.info(
                    `Bulk write completed: ${bulkResult.modifiedCount} products updated`
                );

                // IMPORTANT: Manually trigger field recalculations since bulkWrite bypasses Mongoose middleware
                if (bulkResult.modifiedCount > 0) {
                    logger.info(
                        "Triggering field recalculations for updated products..."
                    );

                    // Get the IDs of updated products
                    const updatedProductIds = bulkOperations.map(
                        (op) => op.updateOne.filter._id
                    );

                    // Fetch and re-save each product to trigger pre-save middleware
                    const updatedProducts = await VendorProduct.find({
                        _id: { $in: updatedProductIds },
                    });

                    // Save each product individually to trigger calculations
                    for (const product of updatedProducts) {
                        try {
                            await product.save();
                        } catch (saveError) {
                            logger.error(
                                `Error recalculating fields for product ${product._id}:`,
                                saveError.message
                            );
                        }
                    }

                    logger.info(
                        `Field recalculations completed for ${updatedProducts.length} products`
                    );
                }
            } catch (bulkError) {
                logger.error("Bulk write error:", bulkError.message);
                throw new Error(
                    `Failed to execute bulk update: ${bulkError.message}`
                );
            }
        }

        const summary = {
            operation: "bulk_inventory_update",
            timestamp: new Date().toISOString(),
            totalRows: results.totalRows,
            processed: results.processed,
            skipped: results.skipped,
            failed: results.failed,
            actualUpdated: bulkResult?.modifiedCount || 0,
            details: results.details,
            rollbackData: results.rollbackData,
        };

        logger.info(
            `Bulk inventory update completed for vendor ${vendorId}:`,
            summary
        );
        return summary;
    } catch (error) {
        logger.error("Bulk inventory update service error:", error.message);
        throw error;
    }
};

// Parse CSV data from buffer
const parseCSVData = (fileBuffer) => {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length === 0) {
        throw new Error("CSV file is empty");
    }

    // Get headers (first row)
    const headers = jsonData[0];
    if (!headers || headers.length === 0) {
        throw new Error("CSV file has no headers");
    }

    // Convert to objects using headers
    const data = [];
    for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const rowObject = {};
        headers.forEach((header, index) => {
            if (header) {
                const normalizedHeader = normalizeColumnName(header.toString());
                rowObject[normalizedHeader] = row[index];
            }
        });

        // Only include rows with at least a product name
        if (rowObject.productName) {
            data.push(rowObject);
        }
    }

    return data;
};

// Parse Excel data from buffer
const parseExcelData = (fileBuffer) => {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (jsonData.length === 0) {
        throw new Error("Excel file is empty");
    }

    // Normalize column names
    const data = jsonData.map((row) => {
        const normalizedRow = {};
        Object.keys(row).forEach((key) => {
            const normalizedKey = normalizeColumnName(key);
            normalizedRow[normalizedKey] = row[key];
        });
        return normalizedRow;
    });

    // Filter rows with product names
    return data.filter((row) => row.productName);
};

// Normalize column names to match expected field names
const normalizeColumnName = (columnName) => {
    const normalized = columnName.toString().toLowerCase().trim();

    // Map various possible column names to our standard field names
    const columnMap = {
        "product name": "productName",
        productname: "productName",
        name: "productName",
        product: "productName",
        "current stock": "currentStock",
        currentstock: "currentStock",
        stock: "currentStock",
        quantity: "currentStock",
        "selling price": "sellingPrice",
        sellingprice: "sellingPrice",
        price: "sellingPrice",
        "sale price": "sellingPrice",
        "cost price": "costPrice",
        costprice: "costPrice",
        cost: "costPrice",
        "min stock level": "minStockLevel",
        minstocklevel: "minStockLevel",
        "min stock": "minStockLevel",
        "minimum stock": "minStockLevel",
        "max stock level": "maxStockLevel",
        maxstocklevel: "maxStockLevel",
        "max stock": "maxStockLevel",
        "maximum stock": "maxStockLevel",
    };

    return columnMap[normalized] || normalized;
};

// Generate sample CSV template
const generateSampleCSV = () => {
    const sampleData = [
        [
            "Product Name",
            "Current Stock",
            "Selling Price",
            "Cost Price",
            "Min Stock Level",
            "Max Stock Level",
        ],
        ["Sample Product 1", "100", "25.99", "18.50", "10", "500"],
        ["Sample Product 2", "50", "15.99", "12.00", "5", "200"],
        ["Sample Product 3", "0", "39.99", "28.75", "15", "300"],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Template");

    return XLSX.write(workbook, { type: "buffer", bookType: "csv" });
};

export { processBulkInventoryUpdate, generateSampleCSV };
