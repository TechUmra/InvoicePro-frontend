import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        businessName: "",
        businessType: "",
        businessDescription: "",
        businessAddress: "",
        gstin: "",
        phone: "",
    });

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]:
                e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response =
                await API.post(
                    "/auth/register",
                    formData
                );

            setMessage(
                response.data.message ||
                    "Account created successfully!"
            );

            setFormData({
                name: "",
                email: "",
                password: "",
                businessName: "",
                businessType: "",
                businessDescription: "",
                businessAddress: "",
                gstin: "",
                phone: "",
            });

            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (error) {
            setError(
                error.response?.data
                    ?.message ||
                    "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

                <div className="text-center mb-8">

                    <h1 className="text-3xl font-bold text-indigo-600">
                        InvoicePro
                    </h1>

                    <h2 className="text-2xl font-bold text-slate-800 mt-4">
                        Create Your Account
                    </h2>

                    <p className="text-slate-500 mt-2">
                        Enter your business details to start creating invoices.
                    </p>

                </div>

                {message && (
                    <div className="mb-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* PERSONAL DETAILS */}

                    <div>

                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                            Personal Details
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Your Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                />

                            </div>

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                />

                            </div>

                        </div>

                    </div>

                    {/* PASSWORD */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Minimum 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                        />

                    </div>

                    {/* BUSINESS DETAILS */}

                    <div className="pt-3">

                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                            Business Details
                        </h3>

                        <div className="space-y-4">

                            {/* BUSINESS NAME */}

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Business Name *
                                </label>

                                <input
                                    type="text"
                                    name="businessName"
                                    placeholder="e.g. Umra Enterprises"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                />

                            </div>

                            {/* BUSINESS TYPE */}

                            <div>

                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Business Type
                                </label>

                                <input
                                    type="text"
                                    name="businessType"
                                    placeholder="e.g. Handloom Manufacturer & Supplier"
                                    value={formData.businessType}
                                    onChange={handleChange}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                />

                            </div>

                            {/* BUSINESS DESCRIPTION */}

                            <div>

                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Business Description
                                </label>

                                <textarea
                                    name="businessDescription"
                                    placeholder="e.g. Traditional handmade cotton and silk products"
                                    value={formData.businessDescription}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                                />

                            </div>

                            {/* ADDRESS */}

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Business Address
                                </label>

                                <textarea
                                    name="businessAddress"
                                    placeholder="Enter complete business address"
                                    value={formData.businessAddress}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                                />

                            </div>

                            {/* GSTIN + PHONE */}

                            <div className="grid md:grid-cols-2 gap-4">

                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        GSTIN
                                    </label>

                                    <input
                                        type="text"
                                        name="gstin"
                                        placeholder="Enter GSTIN"
                                        value={formData.gstin}
                                        onChange={handleChange}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                    />

                                </div>

                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Mobile Number
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Enter mobile number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* BUTTON */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3.5 rounded-xl font-semibold transition"
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>

                <p className="text-center text-sm text-slate-500 mt-6">

                    Already have an account?{" "}

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/login")
                        }
                        className="text-indigo-600 font-medium hover:underline"
                    >
                        Login
                    </button>

                </p>

            </div>

        </div>
    );
}

export default Signup;