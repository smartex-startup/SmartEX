import multer from "multer";
import path from "path";
import apiResponse from "../utils/response.util.js";
import logger from "../utils/logger.util.js";

const storage = multer.memoryStorage();

// File filter for CSV/Excel files (bulk operations)
const csvExcelFileFilter = (req, file, cb) => {
    const allowedTypes = [".csv", ".xlsx", ".xls"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only CSV and Excel files are allowed"), false);
    }
};

// File filter for image files (product images)
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/bmp",
    ];
    const ext = path.extname(file.originalname).toLowerCase();

    if (
        allowedTypes.includes(ext) ||
        allowedMimeTypes.includes(file.mimetype)
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only image files (JPG, PNG, GIF, WebP, BMP) are allowed"
            ),
            false
        );
    }
};

// Multer configurations
const uploadBulk = multer({
    storage: storage,
    fileFilter: csvExcelFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

const uploadSingleImage = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit for single image
    },
});

const uploadMultipleImages = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per image
        files: 10, // Max 10 images
    },
});

// Default upload (backward compatibility for bulk operations)
const upload = uploadBulk;

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return apiResponse.badRequest(
                res,
                "File size too large. Check file size limits"
            );
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return apiResponse.badRequest(
                res,
                "Too many files. Maximum 10 images allowed"
            );
        }
        return apiResponse.badRequest(res, `Upload error: ${err.message}`);
    }

    if (err) {
        return apiResponse.badRequest(res, err.message);
    }

    next();
};

export {
    upload,
    uploadBulk,
    uploadSingleImage,
    uploadMultipleImages,
    handleUploadError,
};
