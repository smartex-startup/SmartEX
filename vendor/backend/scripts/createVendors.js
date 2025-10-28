import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Vendor from "../models/vendor.model.js";
import logger from "../utils/logger.util.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info("MongoDB Connected for seeding");
    } catch (error) {
        logger.error("Database connection error:", error.message);
        process.exit(1);
    }
};

// Sample vendor data
const vendorData = [
    {
        user: {
            name: "Raj Kumar",
            email: "raj@freshmart.com",
            phone: "9876543210",
            password: "password123",
            role: "vendor",
        },
        vendor: {
            businessName: "Fresh Mart",
            businessType: "supermarket",
            gstin: "29ABCDE1234F1Z5",
            fssaiLicense: "12345678901234",
            storeDetails: {
                storeName: "Fresh Mart - Main Branch",
                address: {
                    street: "123 Market Street",
                    city: "Mumbai",
                    state: "Maharashtra",
                    pincode: "400001",
                    coordinates: {
                        latitude: 19.076,
                        longitude: 72.8777,
                    },
                },
                deliveryRadius: 5,
                operatingHours: {
                    monday: { isOpen: true, open: "08:00", close: "22:00" },
                    tuesday: { isOpen: true, open: "08:00", close: "22:00" },
                    wednesday: { isOpen: true, open: "08:00", close: "22:00" },
                    thursday: { isOpen: true, open: "08:00", close: "22:00" },
                    friday: { isOpen: true, open: "08:00", close: "22:00" },
                    saturday: { isOpen: true, open: "08:00", close: "22:00" },
                    sunday: { isOpen: true, open: "09:00", close: "21:00" },
                },
            },
            bankDetails: {
                accountNumber: "123456789012",
                ifscCode: "HDFC0001234",
                accountHolderName: "Raj Kumar",
                bankName: "HDFC Bank",
            },
            documents: {
                businessRegistration: "uploads/business_reg_1.pdf",
                gstCertificate: "uploads/gst_cert_1.pdf",
                fssaiCertificate: "uploads/fssai_cert_1.pdf",
                panCard: "uploads/pan_1.pdf",
                aadharCard: "uploads/aadhar_1.pdf",
            },
            isVerified: true,
            isActive: true,
        },
    },
];

// Create vendors function
const createVendors = async () => {
    try {
        logger.info("Starting vendor creation...");

        for (const data of vendorData) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: data.user.email });
            if (existingUser) {
                logger.info(
                    `User with email ${data.user.email} already exists, skipping...`
                );
                continue;
            }

            // Create user
            const user = new User(data.user);
            await user.save();
            logger.info(`Created user: ${user.email}`);

            // Create vendor profile
            const vendor = new Vendor({
                userId: user._id,
                ...data.vendor,
            });
            await vendor.save();
            logger.info(`Created vendor: ${vendor.businessName}`);

            logger.info(
                `✅ Successfully created vendor account for ${user.name} (${user.email})`
            );
        }

        logger.info("✅ All vendors created successfully!");
        logger.info("\n📋 Test Vendor Accounts:");
        logger.info(
            "1. Email: raj@freshmart.com | Password: password123 | Store: Fresh Mart"
        );
        logger.info("\nYou can now test the login API with these credentials!");
    } catch (error) {
        logger.error("Error creating vendors:", error.message);
    } finally {
        mongoose.connection.close();
        logger.info("Database connection closed");
    }
};

// Run the script
const run = async () => {
    await connectDB();
    await createVendors();
};

run();
