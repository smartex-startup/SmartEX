/**
 * Loading Component for SmartEX Vendor Portal
 */

import React from "react";

const Loader = ({ size = "md", text = "Loading..." }) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16",
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div
                className={`${sizeClasses[size]} animate-spin border-4 border-gray-200 border-t-primary rounded-full`}
            />
            {text && (
                <p className="mt-2 text-sm text-gray-600 animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
};

export default Loader;
