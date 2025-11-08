import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import logger from "../../utils/logger.util.js";

const TopNavbar = () => {
    const { vendor, logout } = useAuth();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            logger.info("User logged out successfully");
        } catch (error) {
            logger.error("Logout failed:", error);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 shadow-sm">
            <div className="flex items-center justify-between px-6 h-full">
                {/* Left Side - Logo & Title */}
                <div className="flex items-center">
                    {/* Logo - Using a placeholder for now */}
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                                S
                            </span>
                        </div>
                        <span className="ml-3 text-lg font-medium text-text-primary">
                            SmartEX
                        </span>
                    </div>

                    {/* Panel Title */}
                    <div className="ml-8 px-4 py-1 bg-gray-100 rounded-md">
                        <span className="text-sm font-medium text-text-secondary">
                            VENDOR PANEL
                        </span>
                    </div>
                </div>

                {/* Right Side - User Profile */}
                <div className="flex items-center space-x-4">
                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() =>
                                setShowProfileDropdown(!showProfileDropdown)
                            }
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {/* Profile Avatar */}
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {vendor?.businessName?.[0]?.toUpperCase() ||
                                        "V"}
                                </span>
                            </div>

                            {/* Vendor Name */}
                            <span className="text-sm font-medium text-text-secondary">
                                {vendor?.businessName || "Vendor"}
                            </span>

                            {/* Dropdown Arrow */}
                            <svg
                                className={`w-4 h-4 text-text-tertiary transition-transform ${
                                    showProfileDropdown ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {showProfileDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-medium text-text-primary">
                                        {vendor?.businessName}
                                    </p>
                                    <p className="text-sm text-text-tertiary">
                                        {vendor?.email}
                                    </p>
                                </div>

                                <button className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-gray-100">
                                    Profile Settings
                                </button>

                                <button className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-gray-100">
                                    Business Settings
                                </button>

                                <div className="border-t border-gray-100">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-text-danger hover:bg-red-50"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;
