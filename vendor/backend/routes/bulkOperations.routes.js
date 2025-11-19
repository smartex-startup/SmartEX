import express from "express";
import {
    bulkUpdate,
    downloadRollback,
    downloadTemplate,
} from "../controllers/bulkOperations.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { upload, handleUploadError } from "../middlewares/upload.middleware.js";

const router = express.Router();

// All bulk operations routes require authentication
router.use(auth);

// Upload and process bulk inventory update
router.post("/update", upload.single("file"), handleUploadError, bulkUpdate);

// Download rollback file
router.get("/rollback/:rollbackId", downloadRollback);

// Download CSV template
router.get("/template", downloadTemplate);

export default router;
