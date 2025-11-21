import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logger from "../../utils/logger.util.js";

const Sidebar = () => {
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({
        inventory: true, // Keep inventory expanded by default as it's main feature
    });

    const toggleMenu = (menuKey) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [menuKey]: !prev[menuKey],
        }));
        logger.info(`Sidebar menu ${menuKey} toggled`);
    };

    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z"
                    />
                </svg>
            ),
        },
        {
            name: "Analytics",
            path: "/analytics",
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H11a2 2 0 01-2-2z"
                    />
                </svg>
            ),
        },
        {
            name: "Inventory",
            key: "inventory",
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                    />
                </svg>
            ),
            submenu: [
                { name: "All Inventory", path: "/inventory" },
                { name: "Add New to Inventory", path: "/inventory/add" },
                { name: "Bulk Operations", path: "/inventory/bulk-operations" },
                { name: "Low Stock", path: "/inventory/low-stock" },
                { name: "Near Expiry", path: "/inventory/near-expiry" },
                { name: "Expired Items", path: "/inventory/expired" },
            ],
        },
        {
            name: "Orders",
            path: "/orders",
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                </svg>
            ),
        },
        // {
        //     name: "Reviews",
        //     path: "/reviews",
        //     icon: (
        //         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        //         </svg>
        //     )
        // },
        // {
        //     name: "Categories",
        //     path: "/categories",
        //     icon: (
        //         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        //         </svg>
        //     )
        // },
        // {
        //     name: "Banners",
        //     path: "/banners",
        //     icon: (
        //         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        //         </svg>
        //     )
        // },
        // {
        //     name: "Coupons",
        //     path: "/coupons",
        //     icon: (
        //         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 11-4 0V7a2 2 0 00-2-2H5z" />
        //         </svg>
        //     )
        // },
        // {
        //     name: "Users",
        //     path: "/users",
        //     icon: (
        //         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        //         </svg>
        //     )
        // },
        // {
        //     name: "Settings",
        //     path: "/settings",
        //     icon: (
        //         <svg
        //             className="w-5 h-5"
        //             fill="none"
        //             stroke="currentColor"
        //             viewBox="0 0 24 24"
        //         >
        //             <path
        //                 strokeLinecap="round"
        //                 strokeLinejoin="round"
        //                 strokeWidth={2}
        //                 d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        //             />
        //             <path
        //                 strokeLinecap="round"
        //                 strokeLinejoin="round"
        //                 strokeWidth={2}
        //                 d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        //             />
        //         </svg>
        //     ),
        // },
    ];

    const isActivePath = (path) => {
        return location.pathname === path;
    };

    const isActiveSubmenu = (submenu) => {
        return submenu.some((item) => location.pathname === item.path);
    };

    return (
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-40 overflow-y-auto">
            <nav className="p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            {item.submenu ? (
                                // Menu with submenu
                                <div>
                                    <button
                                        onClick={() => toggleMenu(item.key)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                                            isActiveSubmenu(item.submenu)
                                                ? "bg-primary text-text-inverse"
                                                : "text-text-secondary hover:bg-gray-100"
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            {item.icon}
                                            <span className="font-medium">
                                                {item.name}
                                            </span>
                                        </div>
                                        <svg
                                            className={`w-4 h-4 transition-transform duration-200 ${
                                                expandedMenus[item.key]
                                                    ? "rotate-180"
                                                    : ""
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

                                    {/* Submenu */}
                                    {expandedMenus[item.key] && (
                                        <ul className="mt-2 ml-6 space-y-1">
                                            {item.submenu.map((subItem) => (
                                                <li key={subItem.name}>
                                                    <NavLink
                                                        to={subItem.path}
                                                        className={({
                                                            isActive,
                                                        }) =>
                                                            `block px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                                                                isActive
                                                                    ? "bg-blue-50 text-text-brand font-medium"
                                                                    : "text-text-tertiary hover:bg-gray-100 hover:text-text-secondary"
                                                            }`
                                                        }
                                                    >
                                                        {subItem.name}
                                                    </NavLink>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                // Simple menu item
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                                            isActive
                                                ? "bg-primary text-text-inverse"
                                                : "text-text-secondary hover:bg-gray-100"
                                        }`
                                    }
                                >
                                    {item.icon}
                                    <span className="font-medium">
                                        {item.name}
                                    </span>
                                </NavLink>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
