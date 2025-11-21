import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import InventoryPage from "./pages/inventory/InventoryPage.jsx";
import AddInventoryPage from "./pages/inventory/AddInventoryPage.jsx";
import ProductDetailPage from "./pages/inventory/ProductDetailPage.jsx";
import EditProductPage from "./pages/inventory/EditProductPage.jsx";
import LowStockPage from "./pages/inventory/LowStockPage.jsx";
import NearExpiryPage from "./pages/inventory/NearExpiryPage.jsx";
import ExpiredPage from "./pages/inventory/ExpiredPage.jsx";
import BulkOperationsPage from "./pages/inventory/BulkOperationsPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import MainLayout from "./components/layout/MainLayout.jsx";

const App = () => {
    return (
        <div className="App">
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes with Layout */}
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Routes>
                                    <Route
                                        path="/"
                                        element={
                                            <Navigate to="/dashboard" replace />
                                        }
                                    />
                                    <Route
                                        path="/dashboard"
                                        element={<DashboardPage />}
                                    />

                                    {/* Inventory Routes */}
                                    <Route
                                        path="/inventory"
                                        element={<InventoryPage />}
                                    />
                                    <Route
                                        path="/inventory/add"
                                        element={<AddInventoryPage />}
                                    />
                                    <Route
                                        path="/inventory/bulk-operations"
                                        element={<BulkOperationsPage />}
                                    />
                                    <Route
                                        path="/inventory/:vendorProductId"
                                        element={<ProductDetailPage />}
                                    />
                                    <Route
                                        path="/inventory/:vendorProductId/edit"
                                        element={<EditProductPage />}
                                    />
                                    <Route
                                        path="/inventory/low-stock"
                                        element={<LowStockPage />}
                                    />
                                    <Route
                                        path="/inventory/near-expiry"
                                        element={<NearExpiryPage />}
                                    />
                                    <Route
                                        path="/inventory/expired"
                                        element={<ExpiredPage />}
                                    />

                                    {/* Catch all for authenticated users */}
                                    <Route
                                        path="*"
                                        element={
                                            <Navigate to="/dashboard" replace />
                                        }
                                    />
                                </Routes>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>
    );
};

export default App;
