import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function CreateInvoice() {
    const navigate = useNavigate();

    // =============================
    // INVOICE DETAILS
    // =============================

    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [saleType, setSaleType] = useState("Sale");
    const [orderNo, setOrderNo] = useState("");
    const [ewayBillNo, setEwayBillNo] = useState("");

    // =============================
    // CUSTOMER DETAILS
    // =============================

    const [customer, setCustomer] = useState({
        name: "",
        gstin: "",
        address: "",
        phone: "",
        email: "",
    });

    // =============================
    // PRODUCTS
    // =============================

    const [items, setItems] = useState([
        {
            description: "",
            hsn: "",
            gstRate: 18,
            quantity: 1,
            unit: "Piece",
            rate: 0,
        },
    ]);

    // =============================
    // TERMS & CONDITIONS
    // =============================

    const [termsAndConditions, setTermsAndConditions] =
        useState("");

    // =============================
    // UI STATES
    // =============================

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // =============================
    // CUSTOMER CHANGE
    // =============================

    const handleCustomerChange = (e) => {
        setCustomer({
            ...customer,
            [e.target.name]: e.target.value,
        });
    };

    // =============================
    // ITEM CHANGE
    // =============================

    const handleItemChange = (index, e) => {
        const updatedItems = [...items];

        updatedItems[index] = {
            ...updatedItems[index],
            [e.target.name]: e.target.value,
        };

        setItems(updatedItems);
    };

    // =============================
    // ADD ITEM
    // =============================

    const addItem = () => {
        setItems([
            ...items,
            {
                description: "",
                hsn: "",
                gstRate: 18,
                quantity: 1,
                unit: "Piece",
                rate: 0,
            },
        ]);
    };

    // =============================
    // REMOVE ITEM
    // =============================

    const removeItem = (index) => {
        if (items.length === 1) return;

        setItems(
            items.filter(
                (_, itemIndex) => itemIndex !== index
            )
        );
    };

    // =============================
    // CALCULATIONS
    // =============================

    const calculatedItems = items.map((item) => {
        const quantity = Number(item.quantity) || 0;
        const rate = Number(item.rate) || 0;
        const gstRate = Number(item.gstRate) || 0;

        const baseAmount = quantity * rate;

        const gstAmount =
            (baseAmount * gstRate) / 100;

        const totalAmount =
            baseAmount + gstAmount;

        return {
            ...item,
            quantity,
            rate,
            gstRate,
            amount: baseAmount,
            gstAmount,
            totalAmount,
        };
    });

    const subtotal = calculatedItems.reduce(
        (sum, item) => sum + item.amount,
        0
    );

    const totalGST = calculatedItems.reduce(
        (sum, item) => sum + item.gstAmount,
        0
    );

    const cgst = totalGST / 2;
    const sgst = totalGST / 2;

    const total = subtotal + totalGST;

    // =============================
    // FORMAT CURRENCY
    // =============================

    const formatCurrency = (amount) => {
        return `₹${Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;
    };

    // =============================
    // CREATE INVOICE
    // =============================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        // Invoice number validation
        if (!invoiceNumber.trim()) {
            setError(
                "Please enter invoice number."
            );
            return;
        }

        // Customer validation
        if (!customer.name.trim()) {
            setError(
                "Please enter customer name."
            );
            return;
        }

        // Product validation
        if (
            items.some(
                (item) =>
                    !item.description.trim() ||
                    Number(item.quantity) <= 0 ||
                    Number(item.rate) < 0
            )
        ) {
            setError(
                "Please complete all product details."
            );
            return;
        }

        setLoading(true);

        try {
            const invoiceData = {
                invoiceNumber,
                invoiceDate,

                saleType,
                orderNo,
                ewayBillNo,

                customer,

                items: calculatedItems.map(
                    (item) => ({
                        description:
                            item.description,
                        hsn: item.hsn,
                        gstRate: item.gstRate,
                        quantity: item.quantity,
                        unit: item.unit,
                        rate: item.rate,

                        amount: item.amount,
                        gstAmount:
                            item.gstAmount,
                        totalAmount:
                            item.totalAmount,
                    })
                ),

                subtotal,
                cgst,
                sgst,
                total,

                // =============================
                // TERMS & CONDITIONS
                // =============================

                termsAndConditions:
                    termsAndConditions.trim(),
            };

            const response = await API.post(
                "/invoices",
                invoiceData
            );

            setMessage(
                "Invoice created successfully! 🎉"
            );

            navigate("/invoice-preview", {
                state: {
                    invoice:
                        response.data.invoice,
                },
            });
        } catch (error) {
            console.error(
                "Create invoice error:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Failed to create invoice."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">

            {/* HEADER */}

            <div className="max-w-7xl mx-auto mb-8">

                <button
                    onClick={() =>
                        navigate("/dashboard")
                    }
                    className="text-sm text-indigo-600 hover:underline mb-4"
                >
                    ← Back to Dashboard
                </button>

                <h1 className="text-3xl font-bold text-slate-800">
                    Create Invoice 🧾
                </h1>

                <p className="text-slate-500 mt-1">
                    Create a professional invoice
                    for your customer.
                </p>

            </div>

            {/* MESSAGES */}

            <div className="max-w-7xl mx-auto">

                {message && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* =============================
                        INVOICE DETAILS
                    ============================= */}

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">

                        <h2 className="text-xl font-semibold text-slate-800 mb-5">
                            Invoice Details 🧾
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">

                            {/* Invoice Number */}

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Invoice Number
                                </label>

                                <input
                                    type="text"
                                    value={invoiceNumber}
                                    onChange={(e) =>
                                        setInvoiceNumber(
                                            e.target.value
                                        )
                                    }
                                    placeholder="INV-0001"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                    required
                                />
                            </div>

                            {/* Date */}

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Invoice Date
                                </label>

                                <input
                                    type="date"
                                    value={invoiceDate}
                                    onChange={(e) =>
                                        setInvoiceDate(
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                    required
                                />
                            </div>

                            {/* Sale Type */}

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Sale Type
                                </label>

                                <select
                                    value={saleType}
                                    onChange={(e) =>
                                        setSaleType(
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                >
                                    <option value="Sale">
                                        Sale
                                    </option>

                                    <option value="Export">
                                        Export
                                    </option>

                                    <option value="Retail">
                                        Retail
                                    </option>

                                    <option value="Wholesale">
                                        Wholesale
                                    </option>
                                </select>
                            </div>

                            {/* Order Number */}

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Order No.
                                </label>

                                <input
                                    type="text"
                                    value={orderNo}
                                    onChange={(e) =>
                                        setOrderNo(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Order Number"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                />
                            </div>

                            {/* E-Way Bill */}

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    E-Way Bill No.
                                </label>

                                <input
                                    type="text"
                                    value={ewayBillNo}
                                    onChange={(e) =>
                                        setEwayBillNo(
                                            e.target.value
                                        )
                                    }
                                    placeholder="E-Way Bill Number"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                />
                            </div>

                        </div>

                    </div>

                    {/* =============================
                        CUSTOMER DETAILS
                    ============================= */}

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">

                        <h2 className="text-xl font-semibold text-slate-800 mb-5">
                            Customer Details 👤
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Customer Name
                                </label>

                                <input
                                    name="name"
                                    value={customer.name}
                                    onChange={
                                        handleCustomerChange
                                    }
                                    placeholder="Customer / Business Name"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    GSTIN
                                </label>

                                <input
                                    name="gstin"
                                    value={customer.gstin}
                                    onChange={
                                        handleCustomerChange
                                    }
                                    placeholder="GSTIN"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Phone
                                </label>

                                <input
                                    name="phone"
                                    value={customer.phone}
                                    onChange={
                                        handleCustomerChange
                                    }
                                    placeholder="Phone Number"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={customer.email}
                                    onChange={
                                        handleCustomerChange
                                    }
                                    placeholder="customer@email.com"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                />
                            </div>

                            <div className="md:col-span-2">

                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Address
                                </label>

                                <textarea
                                    name="address"
                                    value={
                                        customer.address
                                    }
                                    onChange={
                                        handleCustomerChange
                                    }
                                    placeholder="Customer Address"
                                    rows="3"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                />

                            </div>

                        </div>

                    </div>

                    {/* =============================
                        PRODUCTS
                    ============================= */}

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">

                            <div>

                                <h2 className="text-xl font-semibold text-slate-800">
                                    Products / Services 📦
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Add one or more products
                                    to this invoice.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={addItem}
                                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2.5 rounded-xl font-medium"
                            >
                                + Add Item
                            </button>

                        </div>

                        <div className="space-y-5">

                            {calculatedItems.map(
                                (item, index) => (

                                    <div
                                        key={index}
                                        className="border border-slate-200 rounded-2xl p-5"
                                    >

                                        <div className="flex justify-between items-center mb-4">

                                            <h3 className="font-semibold text-slate-700">
                                                Item{" "}
                                                {index + 1}
                                            </h3>

                                            {items.length >
                                                1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeItem(
                                                            index
                                                        )
                                                    }
                                                    className="text-red-500 text-sm hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            )}

                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                                            {/* Description */}

                                            <div className="lg:col-span-2">

                                                <label className="block text-xs font-medium text-slate-500 mb-2">
                                                    Product / Service
                                                </label>

                                                <input
                                                    name="description"
                                                    value={
                                                        item.description
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        handleItemChange(
                                                            index,
                                                            e
                                                        )
                                                    }
                                                    placeholder="Product name"
                                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-200"
                                                    required
                                                />

                                            </div>

                                            {/* HSN */}

                                            <div>

                                                <label className="block text-xs font-medium text-slate-500 mb-2">
                                                    HSN
                                                </label>

                                                <input
                                                    name="hsn"
                                                    value={
                                                        item.hsn
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        handleItemChange(
                                                            index,
                                                            e
                                                        )
                                                    }
                                                    placeholder="HSN"
                                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-200"
                                                />

                                            </div>

                                            {/* GST */}

                                            <div>

                                                <label className="block text-xs font-medium text-slate-500 mb-2">
                                                    GST Rate
                                                </label>

                                                <select
                                                    name="gstRate"
                                                    value={
                                                        item.gstRate
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        handleItemChange(
                                                            index,
                                                            e
                                                        )
                                                    }
                                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-200"
                                                >
                                                    <option value="0">
                                                        0%
                                                    </option>

                                                    <option value="5">
                                                        5%
                                                    </option>

                                                    <option value="12">
                                                        12%
                                                    </option>

                                                    <option value="18">
                                                        18%
                                                    </option>

                                                    <option value="28">
                                                        28%
                                                    </option>
                                                </select>

                                            </div>

                                            {/* Quantity */}

                                            <div>

                                                <label className="block text-xs font-medium text-slate-500 mb-2">
                                                    Quantity
                                                </label>

                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    min="1"
                                                    value={
                                                        item.quantity
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        handleItemChange(
                                                            index,
                                                            e
                                                        )
                                                    }
                                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-200"
                                                />

                                            </div>

                                            {/* Unit */}

                                            <div>

                                                <label className="block text-xs font-medium text-slate-500 mb-2">
                                                    Unit
                                                </label>

                                                <input
                                                    name="unit"
                                                    value={
                                                        item.unit
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        handleItemChange(
                                                            index,
                                                            e
                                                        )
                                                    }
                                                    placeholder="Piece"
                                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-200"
                                                />

                                            </div>

                                            {/* Rate */}

                                            <div>

                                                <label className="block text-xs font-medium text-slate-500 mb-2">
                                                    Rate
                                                </label>

                                                <input
                                                    type="number"
                                                    name="rate"
                                                    min="0"
                                                    value={
                                                        item.rate
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        handleItemChange(
                                                            index,
                                                            e
                                                        )
                                                    }
                                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-200"
                                                />

                                            </div>

                                            {/* Amount */}

                                            <div>

                                                <label className="block text-xs font-medium text-slate-500 mb-2">
                                                    Amount
                                                </label>

                                                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700">
                                                    {formatCurrency(
                                                        item.amount
                                                    )}
                                                </div>

                                            </div>

                                            {/* GST Amount */}

                                            <div>

                                                <label className="block text-xs font-medium text-slate-500 mb-2">
                                                    GST Amount
                                                </label>

                                                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700">
                                                    {formatCurrency(
                                                        item.gstAmount
                                                    )}
                                                </div>

                                            </div>

                                            {/* Total */}

                                            <div>

                                                <label className="block text-xs font-medium text-slate-500 mb-2">
                                                    Total Amount
                                                </label>

                                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 font-semibold text-indigo-600">
                                                    {formatCurrency(
                                                        item.totalAmount
                                                    )}
                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    </div>

                    {/* =============================
                        BOTTOM SECTION
                    ============================= */}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* TERMS & CONDITIONS */}

                        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">

                            <h2 className="text-xl font-semibold text-slate-800 mb-5">
                                Terms & Conditions
                            </h2>

                            <textarea
                                value={
                                    termsAndConditions
                                }
                                onChange={(e) =>
                                    setTermsAndConditions(
                                        e.target.value
                                    )
                                }
                                rows="6"
                                placeholder="Enter your terms and conditions..."
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
                            />

                            <p className="text-xs text-slate-400 mt-2">
                                Enter each term on a new
                                line if you want multiple
                                terms.
                            </p>

                        </div>

                        {/* SUMMARY */}

                        <div className="bg-white rounded-2xl border border-slate-200 p-6">

                            <h2 className="text-xl font-semibold text-slate-800 mb-5">
                                Invoice Summary
                            </h2>

                            <div className="space-y-4">

                                <div className="flex justify-between text-slate-600">
                                    <span>
                                        Subtotal
                                    </span>

                                    <span>
                                        {formatCurrency(
                                            subtotal
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between text-slate-600">
                                    <span>
                                        CGST
                                    </span>

                                    <span>
                                        {formatCurrency(
                                            cgst
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between text-slate-600">
                                    <span>
                                        SGST
                                    </span>

                                    <span>
                                        {formatCurrency(
                                            sgst
                                        )}
                                    </span>
                                </div>

                                <div className="border-t border-slate-200 pt-4 flex justify-between">

                                    <span className="text-lg font-semibold text-slate-800">
                                        Total
                                    </span>

                                    <span className="text-2xl font-bold text-indigo-600">
                                        {formatCurrency(
                                            total
                                        )}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/dashboard"
                                )
                            }
                            className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm disabled:opacity-60"
                        >
                            {loading
                                ? "Creating Invoice..."
                                : "Create Invoice 🧾"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default CreateInvoice;