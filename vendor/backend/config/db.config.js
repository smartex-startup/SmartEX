import mongoose from "mongoose";
import logger from "../utils/logger.util.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        logger.info(`MongoDB Connected: ${conn.connection.name}`);
    } catch (error) {
        logger.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;
