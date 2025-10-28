import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
            trim: true,
            maxlength: [50, "Name cannot be more than 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email",
            ],
        },
        phone: {
            type: String,
            required: [true, "Please provide a phone number"],
            match: [
                /^[6-9]\d{9}$/,
                "Please provide a valid Indian phone number",
            ],
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },
        role: {
            type: String,
            enum: ["customer", "vendor", "admin"],
            default: "customer",
        },
        addresses: [
            {
                type: {
                    type: String,
                    enum: ["home", "work", "other"],
                    default: "home",
                },
                street: {
                    type: String,
                    required: true,
                },
                city: {
                    type: String,
                    required: true,
                },
                state: {
                    type: String,
                    required: true,
                },
                pincode: {
                    type: String,
                    required: true,
                    match: [
                        /^[1-9][0-9]{5}$/,
                        "Please provide a valid pincode",
                    ],
                },
                coordinates: {
                    latitude: {
                        type: Number,
                        min: [-90, "Latitude must be between -90 and 90"],
                        max: [90, "Latitude must be between -90 and 90"],
                    },
                    longitude: {
                        type: Number,
                        min: [-180, "Longitude must be between -180 and 180"],
                        max: [180, "Longitude must be between -180 and 180"],
                    },
                },
                isDefault: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        phoneVerified: {
            type: Boolean,
            default: false,
        },
        profilePicture: {
            type: String,
            default: null,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    const salt = await bcrypt.genSalt(
        parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
    );
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Generate JWT token
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Ensure only one default address
userSchema.pre("save", function (next) {
    if (this.addresses && this.addresses.length > 0) {
        const defaultAddresses = this.addresses.filter(
            (addr) => addr.isDefault
        );
        if (defaultAddresses.length > 1) {
            // Keep only the first default address
            this.addresses.forEach((addr, index) => {
                if (index > 0 && addr.isDefault) {
                    addr.isDefault = false;
                }
            });
        }
    }
    next();
});

export default mongoose.model("User", userSchema);
