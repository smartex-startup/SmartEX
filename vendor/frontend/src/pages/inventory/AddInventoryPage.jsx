import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaArrowRight,
    FaSave,
    FaCheck,
    FaSearch,
    FaDollarSign,
    FaBoxes,
    FaCalendarAlt,
} from "react-icons/fa";
import ProductSearch from "../../components/inventory/add/ProductSearch";
import SelectedProductPreview from "../../components/inventory/add/SelectedProductPreview";
import VendorPricing from "../../components/inventory/add/VendorPricing";
import VendorInventory from "../../components/inventory/add/VendorInventory";
import VendorExpiryBatches from "../../components/inventory/add/VendorExpiryBatches";
import AddInventoryReview from "../../components/inventory/add/AddInventoryReview";
import { addProduct } from "../../api/inventory.api";
import Loader from "../../components/common/Loader";
import logger from "../../utils/logger.util";

const AddInventoryPage = () => {
    const navigate = useNavigate();

    // Multi-step form state
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form data
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [pricingData, setPricingData] = useState({
        costPrice: 0,
        sellingPrice: 0,
        discountPercentage: 0,
        finalPrice: 0,
        margin: 0,
    });
    const [inventoryData, setInventoryData] = useState({
        currentStock: 0,
        addStock: 0,
        minStockLevel: 0,
    });
    const [expiryData, setExpiryData] = useState({
        enableBatchTracking: false,
        batches: [],
    });
    const [settingsData, setSettingsData] = useState({
        isVisible: true,
        allowOnlineOrders: true,
        enableLocalDelivery: false,
        deliveryRadius: 5,
        deliveryFee: 0,
        freeDeliveryThreshold: 0,
        customTags: [],
        specialNotes: "",
        storageConditions: "",
        handlingInstructions: "",
        warrantyPeriod: 0,
        returnPolicy: "",
    });

    // Steps configuration
    const steps = [
        {
            id: "product",
            title: "Select Product",
            icon: FaSearch,
            component: ProductSearch,
            props: {
                onProductSelect: setSelectedProduct,
                selectedProduct: selectedProduct,
            },
        },
        {
            id: "pricing",
            title: "Set Pricing",
            icon: FaDollarSign,
            component: VendorPricing,
            props: {
                pricingData: pricingData,
                onPricingChange: setPricingData,
                selectedProduct: selectedProduct,
            },
        },
        {
            id: "inventory",
            title: "Manage Stock",
            icon: FaBoxes,
            component: VendorInventory,
            props: {
                inventoryData: inventoryData,
                onInventoryChange: setInventoryData,
                selectedProduct: selectedProduct,
            },
        },
        {
            id: "expiry",
            title: "Expiry & Batches",
            icon: FaCalendarAlt,
            component: VendorExpiryBatches,
            props: {
                expiryData: expiryData,
                onExpiryChange: setExpiryData,
                selectedProduct: selectedProduct,
                inventoryData: inventoryData,
            },
        },
        {
            id: "review",
            title: "Review & Confirm",
            icon: FaCheck,
            component: AddInventoryReview,
            props: {
                selectedProduct: selectedProduct,
                pricingData: pricingData,
                inventoryData: inventoryData,
                expiryData: expiryData,
                settingsData: settingsData,
                onEditSection: (sectionId) => {
                    const stepIndex = steps.findIndex(
                        (step) => step.id === sectionId
                    );
                    if (stepIndex !== -1) {
                        setCurrentStep(stepIndex);
                    }
                },
                isSubmitting: isSubmitting,
            },
        },
    ];

    const validateStep = (stepIndex) => {
        const step = steps[stepIndex];

        switch (step.id) {
            case "product":
                return selectedProduct !== null;

            case "pricing":
                return (
                    pricingData.costPrice > 0 && pricingData.sellingPrice > 0
                );

            case "inventory":
                return inventoryData.addStock > 0;

            case "expiry":
                if (expiryData.enableBatchTracking) {
                    // Check if all batches have required fields filled
                    const allBatchesValid = expiryData.batches.every(
                        (batch) =>
                            batch.batchNumber &&
                            batch.batchNumber.trim() !== "" &&
                            batch.quantity &&
                            parseInt(batch.quantity) > 0 &&
                            batch.expiryDate &&
                            batch.expiryDate.trim() !== ""
                    );

                    if (!allBatchesValid) {
                        return false;
                    }

                    const totalBatchQuantity = expiryData.batches.reduce(
                        (sum, batch) => sum + (parseInt(batch.quantity) || 0),
                        0
                    );
                    return totalBatchQuantity === inventoryData.addStock;
                }
                return true;

            case "review":
                return true;

            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        } else {
            console.error(
                "Please complete all required fields before proceeding"
            );
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const prepareSubmissionData = () => {
        const submissionData = {
            productId: selectedProduct._id,
            pricing: {
                costPrice: pricingData.costPrice,
                sellingPrice: pricingData.sellingPrice,
                discountPercentage: pricingData.discountPercentage,
                finalPrice: pricingData.finalPrice,
                margin: pricingData.margin,
            },
            inventory: {
                currentStock: inventoryData.addStock, // The stock we're adding becomes current stock
                minStockLevel: inventoryData.minStockLevel,
                maxStockLevel: 100, // Default value or from settings
            },
            expiryTracking: {
                hasExpiry:
                    expiryData.enableBatchTracking ||
                    (expiryData.batches && expiryData.batches.length > 0),
                batches: expiryData.batches.map((batch) => ({
                    batchNumber: batch.batchNumber,
                    quantity: parseInt(batch.quantity) || 0,
                    expiryDate: batch.expiryDate,
                    manufacturingDate: batch.manufacturingDate,
                })),
            },
            settings: {
                autoRestock: false,
                autoDiscountNearExpiry: true,
                hideWhenOutOfStock: false,
                maxOrderQuantity: 10,
                minOrderQuantity: 1,
                isVisible: settingsData.isVisible,
                allowOnlineOrders: settingsData.allowOnlineOrders,
                enableLocalDelivery: settingsData.enableLocalDelivery,
                deliveryRadius: settingsData.deliveryRadius,
                deliveryFee: settingsData.deliveryFee,
                freeDeliveryThreshold: settingsData.freeDeliveryThreshold,
                customTags: settingsData.customTags,
                specialNotes: settingsData.specialNotes,
                storageConditions: settingsData.storageConditions,
                handlingInstructions: settingsData.handlingInstructions,
                warrantyPeriod: settingsData.warrantyPeriod,
                returnPolicy: settingsData.returnPolicy,
            },
        };

        return submissionData;
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) {
            console.error("Please complete all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const submissionData = prepareSubmissionData();
            logger.info(submissionData);
            await addProduct(submissionData);

            navigate("/inventory");
        } catch (error) {
            console.error("Error adding to inventory:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const CurrentStepComponent = steps[currentStep].component;
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;
    const isStepValid = validateStep(currentStep);

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-background space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6 max-w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
                        <h1 className="text-lg sm:text-2xl font-bold text-text-primary truncate">
                            Add Product to Inventory
                        </h1>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="mt-4 sm:mt-6">
                    <div className="flex items-start justify-between gap-2 sm:gap-4 overflow-x-auto py-2">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index === currentStep;
                            const isCompleted =
                                index < currentStep ||
                                (index === currentStep && isStepValid);
                            const isClickable = index <= currentStep;

                            return (
                                <div
                                    key={step.id}
                                    className="flex flex-col items-center min-w-0 shrink-0"
                                >
                                    {/* Step Icon */}
                                    <button
                                        onClick={() =>
                                            isClickable &&
                                            !isSubmitting &&
                                            setCurrentStep(index)
                                        }
                                        disabled={!isClickable || isSubmitting}
                                        className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all mb-1 ${
                                            isCompleted
                                                ? "bg-primary border-primary text-white"
                                                : isActive
                                                ? "bg-white border-primary text-primary"
                                                : "bg-gray-100 border-gray-300 text-text-quaternary"
                                        } ${
                                            isClickable && !isSubmitting
                                                ? "hover:scale-105 cursor-pointer"
                                                : "cursor-not-allowed"
                                        }`}
                                    >
                                        <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>

                                    {/* Step Title */}
                                    <p
                                        className={`text-[10px] sm:text-xs font-medium text-center max-w-16 sm:max-w-20 leading-tight ${
                                            isActive
                                                ? "text-primary"
                                                : isCompleted
                                                ? "text-secondary"
                                                : "text-text-quaternary"
                                        }`}
                                    >
                                        {step.title}
                                    </p>

                                    {/* Connector Line */}
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`absolute top-4 sm:top-5 left-1/2 w-8 sm:w-12 lg:w-16 h-0.5 transform translate-x-2 sm:translate-x-3 lg:translate-x-4 ${
                                                isCompleted
                                                    ? "bg-primary"
                                                    : "bg-gray-300"
                                            }`}
                                            style={{ zIndex: -1 }}
                                        ></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Navigation - Mobile Friendly */}
                <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button
                            onClick={prevStep}
                            disabled={isFirstStep || isSubmitting}
                            className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 border rounded-md transition-colors ${
                                isFirstStep || isSubmitting
                                    ? "border-gray-300 text-text-quaternary cursor-not-allowed"
                                    : "border-gray-300 text-text-secondary hover:bg-gray-50 hover:text-text-primary"
                            }`}
                        >
                            <FaArrowLeft className="w-4 h-4 mr-2" />
                            Previous
                        </button>

                        <div className="flex gap-3 w-full sm:w-auto">
                            {!isLastStep ? (
                                <button
                                    onClick={nextStep}
                                    disabled={!isStepValid || isSubmitting}
                                    className={`flex-1 sm:flex-none flex items-center justify-center px-6 py-2 rounded-md transition-colors ${
                                        isStepValid && !isSubmitting
                                            ? "bg-primary text-white hover:bg-primary/90"
                                            : "bg-gray-300 text-text-quaternary cursor-not-allowed"
                                    }`}
                                >
                                    Next
                                    <FaArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isStepValid || isSubmitting}
                                    className={`flex-1 sm:flex-none flex items-center justify-center px-6 py-2 rounded-md transition-colors ${
                                        isStepValid && !isSubmitting
                                            ? "bg-primary text-white hover:bg-primary/90"
                                            : "bg-gray-300 text-text-quaternary cursor-not-allowed"
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Adding...
                                        </div>
                                    ) : (
                                        <>
                                            <FaSave className="w-4 h-4 mr-2" />
                                            Add to Inventory
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected Product Preview (when product is selected) */}
            {selectedProduct && currentStep > 0 && (
                <div className="max-w-full overflow-hidden">
                    <SelectedProductPreview
                        product={selectedProduct}
                        onClearSelection={() => {
                            setSelectedProduct(null);
                            setCurrentStep(0);
                        }}
                    />
                </div>
            )}

            {/* Step Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6 max-w-full overflow-x-hidden">
                <CurrentStepComponent {...steps[currentStep].props} />
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 max-w-full">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                        onClick={prevStep}
                        disabled={isFirstStep || isSubmitting}
                        className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 border rounded-md transition-colors ${
                            isFirstStep || isSubmitting
                                ? "border-gray-300 text-text-quaternary cursor-not-allowed"
                                : "border-gray-300 text-text-secondary hover:bg-gray-50 hover:text-text-primary"
                        }`}
                    >
                        <FaArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                    </button>

                    <div className="flex gap-3 w-full sm:w-auto">
                        {!isLastStep ? (
                            <button
                                onClick={nextStep}
                                disabled={!isStepValid || isSubmitting}
                                className={`flex-1 sm:flex-none flex items-center justify-center px-6 py-2 rounded-md transition-colors ${
                                    isStepValid && !isSubmitting
                                        ? "bg-primary text-white hover:bg-primary/90"
                                        : "bg-gray-300 text-text-quaternary cursor-not-allowed"
                                }`}
                            >
                                Next
                                <FaArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!isStepValid || isSubmitting}
                                className={`flex-1 sm:flex-none flex items-center justify-center px-6 py-2 rounded-md transition-colors ${
                                    isStepValid && !isSubmitting
                                        ? "bg-primary text-white hover:bg-primary/90"
                                        : "bg-gray-300 text-text-quaternary cursor-not-allowed"
                                }`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Adding...
                                    </div>
                                ) : (
                                    <>
                                        <FaSave className="w-4 h-4 mr-2" />
                                        Add to Inventory
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddInventoryPage;
