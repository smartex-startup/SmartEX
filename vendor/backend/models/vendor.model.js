import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        businessName: {
            type: String,
            required: [true, "Please provide business name"],
            trim: true,
            maxlength: [
                100,
                "Business name cannot be more than 100 characters",
            ],
        },
        businessType: {
            type: String,
            required: [true, "Please provide business type"],
            enum: [
                "supermarket",
                "grocery_store",
                "pharmacy",
                "convenience_store",
                "department_store",
            ],
            default: "supermarket",
        },
        gstin: {
            type: String,
            required: [true, "Please provide GSTIN"],
            unique: true,
            match: [
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                "Please provide a valid GSTIN",
            ],
        },
        fssaiLicense: {
            type: String,
            match: [
                /^[0-9]{14}$/,
                "Please provide a valid FSSAI license number",
            ],
        },

        storeDetails: {
            storeName: {
                type: String,
                required: [true, "Please provide store name"],
                trim: true,
            },
            address: {
                street: {
                    type: String,
                    required: [true, "Please provide street address"],
                },
                city: {
                    type: String,
                    required: [true, "Please provide city"],
                },
                state: {
                    type: String,
                    required: [true, "Please provide state"],
                },
                pincode: {
                    type: String,
                    required: [true, "Please provide pincode"],
                    match: [
                        /^[1-9][0-9]{5}$/,
                        "Please provide a valid pincode",
                    ],
                },
                coordinates: {
                    latitude: {
                        type: Number,
                        required: [true, "Please provide latitude"],
                        min: [-90, "Latitude must be between -90 and 90"],
                        max: [90, "Latitude must be between -90 and 90"],
                    },
                    longitude: {
                        type: Number,
                        required: [true, "Please provide longitude"],
                        min: [-180, "Longitude must be between -180 and 180"],
                        max: [180, "Longitude must be between -180 and 180"],
                    },
                },
            },
            deliveryRadius: {
                type: Number,
                default: 5,
                min: [1, "Delivery radius must be at least 1 km"],
                max: [50, "Delivery radius cannot exceed 50 km"],
            },
            operatingHours: {
                monday: {
                    isOpen: { type: Boolean, default: true },
                    open: { type: String, default: "09:00" },
                    close: { type: String, default: "21:00" },
                },
                tuesday: {
                    isOpen: { type: Boolean, default: true },
                    open: { type: String, default: "09:00" },
                    close: { type: String, default: "21:00" },
                },
                wednesday: {
                    isOpen: { type: Boolean, default: true },
                    open: { type: String, default: "09:00" },
                    close: { type: String, default: "21:00" },
                },
                thursday: {
                    isOpen: { type: Boolean, default: true },
                    open: { type: String, default: "09:00" },
                    close: { type: String, default: "21:00" },
                },
                friday: {
                    isOpen: { type: Boolean, default: true },
                    open: { type: String, default: "09:00" },
                    close: { type: String, default: "21:00" },
                },
                saturday: {
                    isOpen: { type: Boolean, default: true },
                    open: { type: String, default: "09:00" },
                    close: { type: String, default: "21:00" },
                },
                sunday: {
                    isOpen: { type: Boolean, default: false },
                    open: { type: String, default: "10:00" },
                    close: { type: String, default: "20:00" },
                },
            },
            storeImages: [
                {
                    type: String,
                },
            ],
        },

        bankDetails: {
            accountNumber: {
                type: String,
                required: [true, "Please provide bank account number"],
            },
            ifscCode: {
                type: String,
                required: [true, "Please provide IFSC code"],
                match: [
                    /^[A-Z]{4}0[A-Z0-9]{6}$/,
                    "Please provide a valid IFSC code",
                ],
            },
            accountHolderName: {
                type: String,
                required: [true, "Please provide account holder name"],
            },
            bankName: {
                type: String,
                required: [true, "Please provide bank name"],
            },
        },

        documents: {
            businessRegistration: {
                type: String,
                required: [
                    true,
                    "Please upload business registration document",
                ],
            },
            gstCertificate: {
                type: String,
                required: [true, "Please upload GST certificate"],
            },
            fssaiCertificate: {
                type: String,
            },
            panCard: {
                type: String,
                required: [true, "Please upload PAN card"],
            },
            aadharCard: {
                type: String,
                required: [true, "Please upload Aadhar card"],
            },
        },

        commissionRate: {
            type: Number,
            default: 15,
            min: [0, "Commission rate cannot be negative"],
            max: [50, "Commission rate cannot exceed 50%"],
        },

        isVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },

        // Performance metrics
        rating: {
            type: Number,
            default: 0,
            min: [0, "Rating cannot be negative"],
            max: [5, "Rating cannot exceed 5"],
        },
        totalOrders: {
            type: Number,
            default: 0,
        },
        totalRevenue: {
            type: Number,
            default: 0,
        },
        averageOrderValue: {
            type: Number,
            default: 0,
        },

        // Subscription details (if applicable)
        subscription: {
            plan: {
                type: String,
                enum: ["basic", "premium", "enterprise"],
                default: "basic",
            },
            startDate: {
                type: Date,
                default: Date.now,
            },
            endDate: {
                type: Date,
            },
            isActive: {
                type: Boolean,
                default: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Create 2dsphere index for location-based queries
vendorSchema.index({ "storeDetails.address.coordinates": "2dsphere" });

// Index for frequently queried fields
vendorSchema.index({ isVerified: 1, isActive: 1 });
vendorSchema.index({ businessType: 1 });
vendorSchema.index({ "storeDetails.address.pincode": 1 });

// Virtual for total products
vendorSchema.virtual("totalProducts", {
    ref: "VendorProduct",
    localField: "_id",
    foreignField: "vendor",
    count: true,
});

// Ensure virtual fields are serialized
vendorSchema.set("toJSON", { virtuals: true });
vendorSchema.set("toObject", { virtuals: true });

export default mongoose.model("Vendor", vendorSchema);
