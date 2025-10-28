import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide product name"],
            trim: true,
            maxlength: [100, "Product name cannot be more than 100 characters"],
        },
        description: {
            type: String,
            maxlength: [
                1000,
                "Description cannot be more than 1000 characters",
            ],
        },
        brand: {
            type: String,
            required: [true, "Please provide brand name"],
            trim: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Please provide category"],
        },
        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },

        basePrice: {
            type: Number,
            required: [true, "Please provide base price (MRP)"],
            min: [0, "Price cannot be negative"],
        },

        images: [
            {
                url: {
                    type: String,
                    required: true,
                },
                altText: {
                    type: String,
                    default: "",
                },
                isPrimary: {
                    type: Boolean,
                    default: false,
                },
            },
        ],

        specifications: {
            weight: {
                value: Number,
                unit: {
                    type: String,
                    enum: ["g", "kg", "mg", "ml", "l", "pieces"],
                    default: "g",
                },
            },
            dimensions: {
                length: Number,
                width: Number,
                height: Number,
                unit: {
                    type: String,
                    enum: ["cm", "mm", "inch"],
                    default: "cm",
                },
            },
            ingredients: {
                type: String,
                maxlength: [
                    500,
                    "Ingredients cannot be more than 500 characters",
                ],
            },
            nutritionalInfo: {
                calories: Number,
                protein: Number,
                carbohydrates: Number,
                fat: Number,
                fiber: Number,
                sugar: Number,
                sodium: Number,
            },
            allergens: [
                {
                    type: String,
                    enum: [
                        "gluten",
                        "nuts",
                        "dairy",
                        "eggs",
                        "soy",
                        "shellfish",
                        "fish",
                        "sesame",
                    ],
                },
            ],
            storageInstructions: {
                type: String,
                maxlength: [
                    200,
                    "Storage instructions cannot be more than 200 characters",
                ],
            },
        },

        barcodes: [
            {
                code: {
                    type: String,
                    required: true,
                },
                type: {
                    type: String,
                    enum: ["EAN", "UPC", "ISBN"],
                    default: "EAN",
                },
            },
        ],

        hsn: {
            type: String,
            match: [/^[0-9]{4,8}$/, "Please provide a valid HSN code"],
        },

        tags: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],

        isActive: {
            type: Boolean,
            default: true,
        },

        requiresPrescription: {
            type: Boolean,
            default: false,
        },

        // Product variants (for different sizes, flavors, etc.)
        variants: [
            {
                name: {
                    type: String,
                    required: true,
                },
                value: {
                    type: String,
                    required: true,
                },
                priceModifier: {
                    type: Number,
                    default: 0,
                },
            },
        ],

        // SEO and metadata
        seo: {
            metaTitle: String,
            metaDescription: String,
            keywords: [String],
            slug: {
                type: String,
                unique: true,
                sparse: true,
            },
        },

        // Admin fields
        isApproved: {
            type: Boolean,
            default: false,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        approvedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
productSchema.index({ name: "text", description: "text", brand: "text" });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ isActive: 1, isApproved: 1 });
productSchema.index({ "barcodes.code": 1 });
productSchema.index({ tags: 1 });

// Pre-save middleware to ensure only one primary image
productSchema.pre("save", function (next) {
    if (this.images && this.images.length > 0) {
        const primaryImages = this.images.filter((img) => img.isPrimary);
        if (primaryImages.length > 1) {
            // Keep only the first primary image
            this.images.forEach((img, index) => {
                if (index > 0 && img.isPrimary) {
                    img.isPrimary = false;
                }
            });
        } else if (primaryImages.length === 0) {
            // Set first image as primary if none is set
            this.images[0].isPrimary = true;
        }
    }
    next();
});

// Pre-save middleware to generate slug
productSchema.pre("save", function (next) {
    if (!this.seo.slug && this.name) {
        this.seo.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim("-");
    }
    next();
});

export default mongoose.model("Product", productSchema);
