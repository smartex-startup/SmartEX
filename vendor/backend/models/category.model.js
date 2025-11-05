import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide category name"],
            trim: true,
            maxlength: [50, "Category name cannot be more than 50 characters"],
        },
        slug: {
            type: String,
            required: [true, "Please provide category slug"],
            unique: true,
            lowercase: true,
            match: [
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                "Slug can only contain lowercase letters, numbers, and hyphens",
            ],
        },
        description: {
            type: String,
            maxlength: [200, "Description cannot be more than 200 characters"],
        },
        image: {
            type: String,
            default: null,
        },
        icon: {
            type: String,
            default: null,
        },
        parentCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
        metaData: {
            keywords: [String],
            metaTitle: String,
            metaDescription: String,
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });

// Virtual for subcategories
categorySchema.virtual("subcategories", {
    ref: "Category",
    localField: "_id",
    foreignField: "parentCategory",
});

// Ensure virtual fields are serialized
categorySchema.set("toJSON", { virtuals: true });
categorySchema.set("toObject", { virtuals: true });

// Pre-save middleware to generate slug if not provided
categorySchema.pre("save", function (next) {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, "") // Remove invalid chars
            .replace(/\s+/g, "-") // Replace spaces with -
            .replace(/-+/g, "-") // Replace multiple - with single -
            .trim("-"); // Trim - from start and end
    }
    next();
});

export default mongoose.model("Category", categorySchema);
