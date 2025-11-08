import React from "react";
import TopNavbar from "./TopNavbar.jsx";
import Sidebar from "./Sidebar.jsx";

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <TopNavbar />

            {/* Main Content Area */}
            <div className="flex pt-16">
                {" "}
                {/* pt-16 to account for fixed navbar */}
                {/* Sidebar */}
                <Sidebar />
                {/* Main Content */}
                <main className="flex-1 ml-64 p-6">
                    {" "}
                    {/* ml-64 to account for fixed sidebar */}
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
