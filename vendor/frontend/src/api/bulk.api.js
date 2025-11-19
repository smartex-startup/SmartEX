import apiClient from "../utils/axios.js";
import logger from "../utils/logger.util.js";

// Process bulk inventory update from uploaded file
export const bulkUpdateInventory = async (file) => {
    try {
        logger.info("Starting bulk inventory update...");

        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post("/bulk/update", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        logger.info("Bulk inventory update completed successfully");
        return response;
    } catch (error) {
        logger.error(
            "Failed to process bulk update:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Download rollback CSV file
export const downloadRollbackFile = async (rollbackData) => {
    try {
        logger.info("Generating rollback file...");

        const response = await apiClient.post(
            "/bulk/rollback",
            { rollbackData },
            {
                responseType: "blob",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        // Create download
        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        const timestamp = new Date().toISOString().split("T")[0];
        link.download = `inventory_rollback_${timestamp}.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        logger.info("Rollback file downloaded successfully");
        return true;
    } catch (error) {
        logger.error(
            "Failed to download rollback file:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};

// Download sample CSV template
export const downloadTemplate = async () => {
    try {
        logger.info("Downloading template file...");

        const response = await apiClient.get("/bulk/template", {
            responseType: "blob",
        });

        // Create download
        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "inventory_template.csv";

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        logger.info("Template downloaded successfully");
        return true;
    } catch (error) {
        logger.error(
            "Failed to download template:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
};
