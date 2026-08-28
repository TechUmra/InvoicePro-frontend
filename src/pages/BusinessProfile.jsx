import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function BusinessProfile() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        businessName: "",
        businessType: "",
        businessDescription: "",
        businessAddress: "",
        gstin: "",
        phone: "",

        signature: "",
        businessStamp: "",

        bankDetails: {
            bankName: "",
            accountHolderName: "",
            accountNumber: "",
            ifscCode: "",
            branch: "",
            upiId: "",
        },
    });

    // =====================================================
    // GET CURRENT USER DETAILS
    // =====================================================

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await API.get("/auth/me");

                // Axios already converts JSON response
                const data = response.data;

                const user = data.user;

                if (!user) {
                    throw new Error("User profile not found.");
                }

                setFormData({
                    businessName: user.businessName || "",
                    businessType: user.businessType || "",
                    businessDescription:
                        user.businessDescription || "",
                    businessAddress:
                        user.businessAddress || "",
                    gstin: user.gstin || "",
                    phone: user.phone || "",

                    signature: user.signature || "",
                    businessStamp:
                        user.businessStamp || "",

                    bankDetails: {
                        bankName:
                            user.bankDetails?.bankName || "",

                        accountHolderName:
                            user.bankDetails
                                ?.accountHolderName || "",

                        accountNumber:
                            user.bankDetails
                                ?.accountNumber || "",

                        ifscCode:
                            user.bankDetails?.ifscCode || "",

                        branch:
                            user.bankDetails?.branch || "",

                        upiId:
                            user.bankDetails?.upiId || "",
                    },
                });
            } catch (error) {
                console.error(
                    "Profile loading error:",
                    error
                );

                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to load business profile.";

                alert(message);

                // If unauthorized, go to login
                if (
                    error.response?.status === 401 ||
                    error.response?.status === 403
                ) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    // =====================================================
    // NORMAL INPUT CHANGE
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =====================================================
    // BANK INPUT CHANGE
    // =====================================================

    const handleBankChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,

            bankDetails: {
                ...previous.bankDetails,
                [name]: value,
            },
        }));
    };

    // =====================================================
    // IMAGE TO BASE64
    // =====================================================

    const handleImageUpload = (e, fieldName) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // Allow only images
        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file.");

            e.target.value = "";
            return;
        }

        // Maximum 2MB
        if (file.size > 2 * 1024 * 1024) {
            alert("Image size should be less than 2MB.");

            e.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            setFormData((previous) => ({
                ...previous,
                [fieldName]: reader.result,
            }));
        };

        reader.onerror = () => {
            alert("Unable to read the image.");
        };

        reader.readAsDataURL(file);
    };

    // =====================================================
    // REMOVE SIGNATURE
    // =====================================================

    const removeSignature = () => {
        setFormData((previous) => ({
            ...previous,
            signature: "",
        }));
    };

    // =====================================================
    // REMOVE STAMP
    // =====================================================

    const removeStamp = () => {
        setFormData((previous) => ({
            ...previous,
            businessStamp: "",
        }));
    };

    // =====================================================
    // SAVE PROFILE
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.businessName.trim()) {
            alert("Please enter your business name.");
            return;
        }

        try {
            setSaving(true);

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await API.put(
                "/auth/profile",
                formData
            );

            // Axios already gives parsed JSON
            const data = response.data;

            // ==========================================
            // UPDATE LOCAL STORAGE
            // ==========================================

            if (data.user) {
                let oldUser = {};

                try {
                    oldUser =
                        JSON.parse(
                            localStorage.getItem("user")
                        ) || {};
                } catch {
                    oldUser = {};
                }

                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        ...oldUser,
                        ...data.user,
                    })
                );
            }

            alert(
                data.message ||
                "Business profile updated successfully!"
            );

            navigate("/dashboard");
        } catch (error) {
            console.error(
                "Profile update error:",
                error
            );

            const message =
                error.response?.data?.message ||
                error.message ||
                "Something went wrong while saving.";

            alert(message);

            // If token expired
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-center">
                    <div className="text-2xl mb-2">
                        ⏳
                    </div>

                    <p className="text-slate-600">
                        Loading business profile...
                    </p>
                </div>
            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4">
            <div className="max-w-4xl mx-auto">

                {/* HEADER */}

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Business Profile
                        </h1>

                        <p className="text-slate-500 mt-1">
                            Enter your business details for invoices
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className="text-indigo-600 hover:underline"
                    >
                        ← Dashboard
                    </button>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* ================================================= */}
                    {/* BUSINESS INFORMATION */}
                    {/* ================================================= */}

                    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">

                        <h2 className="text-xl font-semibold text-slate-800">
                            Business Information
                        </h2>

                        <p className="text-sm text-slate-500 mt-1 mb-6">
                            These details will appear on your invoices.
                        </p>

                        <div className="grid md:grid-cols-2 gap-5">

                            {/* BUSINESS NAME */}

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Business Name *
                                </label>

                                <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    placeholder="e.g. Umra Enterprises"
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            {/* BUSINESS TYPE */}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Business Type
                                </label>

                                <input
                                    type="text"
                                    name="businessType"
                                    value={formData.businessType}
                                    onChange={handleChange}
                                    placeholder="e.g. Manufacturer & Supplier"
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* BUSINESS DESCRIPTION */}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Business Description
                                </label>

                                <input
                                    type="text"
                                    name="businessDescription"
                                    value={formData.businessDescription}
                                    onChange={handleChange}
                                    placeholder="e.g. Traditional handmade products"
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* GSTIN */}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    GSTIN
                                </label>

                                <input
                                    type="text"
                                    name="gstin"
                                    value={formData.gstin}
                                    onChange={handleChange}
                                    placeholder="e.g. 09ABCDE1234F1Z5"
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 uppercase outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* MOBILE */}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Mobile Number
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="e.g. 9876543210"
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* ADDRESS */}

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Business Address
                                </label>

                                <textarea
                                    name="businessAddress"
                                    value={formData.businessAddress}
                                    onChange={handleChange}
                                    placeholder="Enter complete business / office address"
                                    rows="4"
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                            </div>

                        </div>
                    </div>

                    {/* ================================================= */}
                    {/* DIGITAL SIGNATURE & BUSINESS STAMP */}
                    {/* ================================================= */}

                    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">

                        <h2 className="text-xl font-semibold text-slate-800">
                            Digital Signature & Business Stamp
                        </h2>

                        <p className="text-sm text-slate-500 mt-1 mb-6">
                            Upload your signature and business stamp.
                            They will automatically appear on your invoices
                            and downloaded PDFs.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">

                            {/* SIGNATURE */}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Authorized Signature
                                </label>

                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-5">

                                    {formData.signature ? (
                                        <div>

                                            <div className="bg-slate-50 rounded-xl h-40 flex items-center justify-center overflow-hidden">

                                                <img
                                                    src={formData.signature}
                                                    alt="Signature Preview"
                                                    className="max-h-32 max-w-full object-contain"
                                                />

                                            </div>

                                            <div className="flex gap-3 mt-4">

                                                <label className="flex-1 cursor-pointer text-center bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-100">

                                                    Change Signature

                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) =>
                                                            handleImageUpload(
                                                                e,
                                                                "signature"
                                                            )
                                                        }
                                                        className="hidden"
                                                    />

                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={removeSignature}
                                                    className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100"
                                                >
                                                    Remove
                                                </button>

                                            </div>

                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block text-center">

                                            <div className="text-4xl mb-3">
                                                ✍️
                                            </div>

                                            <p className="font-medium text-slate-700">
                                                Upload Signature
                                            </p>

                                            <p className="text-xs text-slate-400 mt-1">
                                                PNG, JPG or JPEG • Max 2MB
                                            </p>

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    handleImageUpload(
                                                        e,
                                                        "signature"
                                                    )
                                                }
                                                className="hidden"
                                            />

                                        </label>
                                    )}

                                </div>
                            </div>

                            {/* BUSINESS STAMP */}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Business Stamp
                                </label>

                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-5">

                                    {formData.businessStamp ? (
                                        <div>

                                            <div className="bg-slate-50 rounded-xl h-40 flex items-center justify-center overflow-hidden">

                                                <img
                                                    src={formData.businessStamp}
                                                    alt="Business Stamp Preview"
                                                    className="max-h-32 max-w-full object-contain"
                                                />

                                            </div>

                                            <div className="flex gap-3 mt-4">

                                                <label className="flex-1 cursor-pointer text-center bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-100">

                                                    Change Stamp

                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) =>
                                                            handleImageUpload(
                                                                e,
                                                                "businessStamp"
                                                            )
                                                        }
                                                        className="hidden"
                                                    />

                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={removeStamp}
                                                    className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100"
                                                >
                                                    Remove
                                                </button>

                                            </div>

                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block text-center">

                                            <div className="text-4xl mb-3">
                                                🏷️
                                            </div>

                                            <p className="font-medium text-slate-700">
                                                Upload Business Stamp
                                            </p>

                                            <p className="text-xs text-slate-400 mt-1">
                                                PNG, JPG or JPEG • Max 2MB
                                            </p>

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    handleImageUpload(
                                                        e,
                                                        "businessStamp"
                                                    )
                                                }
                                                className="hidden"
                                            />

                                        </label>
                                    )}

                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ================================================= */}
                    {/* BANK DETAILS */}
                    {/* ================================================= */}

                    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">

                        <h2 className="text-xl font-semibold text-slate-800">
                            Bank Details
                        </h2>

                        <p className="text-sm text-slate-500 mt-1 mb-6">
                            These details can be displayed on your invoices.
                        </p>

                        <div className="grid md:grid-cols-2 gap-5">

                            {/* BANK NAME */}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Bank Name
                                </label>

                                <input
                                    type="text"
                                    name="bankName"
                                    value={formData.bankDetails.bankName}
                                    onChange={handleBankChange}
                                    placeholder="e.g. State Bank of India"
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* ACCOUNT HOLDER */}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Account Holder Name
                                </label>

                                <input
                                    type="text"
                                    name="accountHolderName"
                                    value={
                                        formData.bankDetails
                                            .accountHolderName
                                    }
                                    onChange={handleBankChange}
                                    placeholder="Account holder name"
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* ACCOUNT NUMBER */}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Account Number
                                </label>

                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={
                                        formData.bankDetails
                                            .accountNumber
                                    }
                                    onChange={handleBankChange}
                                    placeholder="Bank account number"
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* IFSC */}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    IFSC Code
                                </label>

                                <input
                                    type="text"
                                    name="ifscCode"
                                    value={
                                        formData.bankDetails
                                            .ifscCode
                                    }
                                    onChange={handleBankChange}
                                    placeholder="e.g. SBIN0001234"
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 uppercase outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* BRANCH */}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Branch
                                </label>

                                <input
                                    type="text"
                                    name="branch"
                                    value={
                                        formData.bankDetails.branch
                                    }
                                    onChange={handleBankChange}
                                    placeholder="Branch name"
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* UPI */}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    UPI ID
                                </label>

                                <input
                                    type="text"
                                    name="upiId"
                                    value={
                                        formData.bankDetails.upiId
                                    }
                                    onChange={handleBankChange}
                                    placeholder="e.g. business@upi"
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                        </div>
                    </div>

                    {/* ================================================= */}
                    {/* BUTTONS */}
                    {/* ================================================= */}

                    <div className="flex justify-end gap-4">

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/dashboard")
                            }
                            className="px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-60"
                        >
                            {saving
                                ? "Saving..."
                                : "Save Business Details"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default BusinessProfile;