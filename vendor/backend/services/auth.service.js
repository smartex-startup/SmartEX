import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Vendor from "../models/vendor.model.js";
import logger from "../utils/logger.util.js";

// Generate JWT token
const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "30d",
    });
};

// Set cookie with token
const setTokenCookie = (res, token) => {
    const cookieOptions = {
        expires: new Date(
            Date.now() +
                (parseInt(process.env.JWT_COOKIE_EXPIRE) || 30) *
                    24 *
                    60 *
                    60 *
                    1000
        ),
        httpOnly: true,
        sameSite: "strict",
    };

    if (process.env.NODE_ENV === "production") {
        cookieOptions.secure = true;
    }

    res.cookie("token", token, cookieOptions);
};

// Clear token cookie
const clearTokenCookie = (res) => {
    res.cookie("token", "", {
        expires: new Date(0),
        httpOnly: true,
        sameSite: "strict",
    });
};

// Authenticate vendor login
const authenticateVendor = async (email, password) => {
    try {
        // Check if user exists and get password
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            throw new Error("Invalid credentials");
        }

        // Check if user is vendor
        if (user.role !== "vendor") {
            throw new Error("Access denied. Vendor access only");
        }

        // Check if user is active
        if (!user.isActive) {
            throw new Error("Account is deactivated");
        }

        // Check password
        const isPasswordValid = await user.matchPassword(password);

        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id, user.role);

        logger.info(`Vendor login successful: ${user.email}`);

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profilePicture: user.profilePicture,
                lastLogin: user.lastLogin,
            },
        };
    } catch (error) {
        logger.error(`Login error for ${email}:`, error.message);
        throw error;
    }
};

// Fetch vendor profile data (combines user + vendor data)
const fetchVendorProfile = async (userId) => {
    try {
        const user = await User.findById(userId).select("-password");
        if (!user) {
            throw new Error("User not found");
        }

        const vendor = await Vendor.findOne({ userId }).populate(
            "userId",
            "name email phone"
        );

        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profilePicture: user.profilePicture,
                emailVerified: user.emailVerified,
                phoneVerified: user.phoneVerified,
                lastLogin: user.lastLogin,
            },
            vendor: vendor
                ? {
                      id: vendor._id,
                      businessName: vendor.businessName,
                      businessType: vendor.businessType,
                      storeName: vendor.storeDetails?.storeName,
                      isVerified: vendor.isVerified,
                      isActive: vendor.isActive,
                      rating: vendor.rating,
                      totalOrders: vendor.totalOrders,
                  }
                : null,
        };
    } catch (error) {
        logger.error(`Get profile error for user ${userId}:`, error.message);
        throw error;
    }
};

// Update vendor profile data (only user fields that vendors can modify)
const updateVendorData = async (userId, updateData) => {
    try {
        const allowedFields = ["name", "phone", "profilePicture"];
        const filteredData = {};

        // Only allow specific fields to be updated
        Object.keys(updateData).forEach((key) => {
            if (allowedFields.includes(key)) {
                filteredData[key] = updateData[key];
            }
        });

        if (Object.keys(filteredData).length === 0) {
            throw new Error("No valid fields to update");
        }

        const user = await User.findByIdAndUpdate(userId, filteredData, {
            new: true,
            runValidators: true,
        }).select("-password");

        if (!user) {
            throw new Error("User not found");
        }

        logger.info(`Profile updated for user: ${user.email}`);

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            profilePicture: user.profilePicture,
            lastLogin: user.lastLogin,
        };
    } catch (error) {
        logger.error(`Update profile error for user ${userId}:`, error.message);
        throw error;
    }
};

// Change user password
const updatePassword = async (userId, currentPassword, newPassword) => {
    try {
        const user = await User.findById(userId).select("+password");

        if (!user) {
            throw new Error("User not found");
        }

        // Verify current password
        const isCurrentPasswordValid = await user.matchPassword(
            currentPassword
        );

        if (!isCurrentPasswordValid) {
            throw new Error("Current password is incorrect");
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Generate new token
        const token = generateToken(user._id, user.role);

        logger.info(`Password changed for user: ${user.email}`);

        return { token };
    } catch (error) {
        logger.error(
            `Change password error for user ${userId}:`,
            error.message
        );
        throw error;
    }
};

export {
    generateToken,
    setTokenCookie,
    clearTokenCookie,
    authenticateVendor,
    fetchVendorProfile,
    updateVendorData,
    updatePassword,
};
