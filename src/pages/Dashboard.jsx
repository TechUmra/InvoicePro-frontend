import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // LOAD USER
    // =====================================================

    useEffect(() => {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    // =====================================================
    // LOAD INVOICES
    // =====================================================

    const fetchInvoices = async () => {
        try {
            const response = await API.get("/invoices");

            setInvoices(
                response.data.invoices ||
                    response.data ||
                    []
            );
        } catch (error) {
            console.error("Invoice fetch error:", error);

            setError(
                error.response?.data?.message ||
                    "Failed to load invoices."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    // =====================================================
    // UPDATE INVOICE STATUS
    // =====================================================

    const updateInvoiceStatus = async (
        invoiceId,
        nextStatus
    ) => {
        try {
            await API.patch(
                `/invoices/${invoiceId}/status`,
                {
                    status: nextStatus,
                }
            );

            await fetchInvoices();
        } catch (error) {
            console.error(
                "Update invoice status error:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Failed to update invoice status."
            );
        }
    };

    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/";
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <p className="text-slate-500 text-sm">
                    Loading...
                </p>
            </div>
        );
    }

    // =====================================================
    // DASHBOARD STATISTICS
    // =====================================================

    const totalSales = invoices.reduce(
        (sum, invoice) =>
            sum + Number(invoice.total || 0),
        0
    );

    const paidInvoices = invoices.filter(
        (invoice) => invoice.status === "Paid"
    );

    const pendingInvoices = invoices.filter(
        (invoice) => invoice.status === "Pending"
    );

    const overdueInvoices = invoices.filter(
        (invoice) => invoice.status === "Overdue"
    );

    const paidAmount = paidInvoices.reduce(
        (sum, invoice) =>
            sum + Number(invoice.total || 0),
        0
    );

    const pendingAmount = pendingInvoices.reduce(
        (sum, invoice) =>
            sum + Number(invoice.total || 0),
        0
    );

    const overdueAmount = overdueInvoices.reduce(
        (sum, invoice) =>
            sum + Number(invoice.total || 0),
        0
    );

    const collectedPercentage =
        totalSales > 0
            ? ((paidAmount / totalSales) * 100).toFixed(1)
            : "0.0";

    // =====================================================
    // RECENT INVOICES
    // =====================================================

    const recentInvoices = [...invoices]
        .sort(
            (a, b) =>
                new Date(
                    b.invoiceDate || b.createdAt
                ) -
                new Date(
                    a.invoiceDate || a.createdAt
                )
        )
        .slice(0, 5);

    // =====================================================
    // FORMAT CURRENCY
    // =====================================================

    const formatCurrency = (amount) => {
        return `₹${Number(
            amount || 0
        ).toLocaleString("en-IN")}`;
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =====================================================
    // STATUS STYLE
    // =====================================================

    const getStatusStyle = (status) => {
        if (status === "Paid") {
            return "bg-green-50 text-green-600";
        }

        if (status === "Overdue") {
            return "bg-red-50 text-red-600";
        }

        return "bg-yellow-50 text-yellow-600";
    };

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

            {/* =================================================
                MOBILE TOP HEADER
            ================================================= */}

            <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-30">

                <div className="flex items-center justify-between">

                    <div>
                        <h1 className="text-xl font-bold text-indigo-600">
                            InvoicePro
                        </h1>

                        <p className="text-[10px] text-slate-400">
                            AI-Powered Invoicing
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate("/business-profile")
                        }
                        className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg"
                    >
                        ⚙️
                    </button>

                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className="py-2 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium"
                    >
                        🏠 Home
                    </button>

                    <button
                        onClick={() =>
                            navigate("/create-invoice")
                        }
                        className="py-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium"
                    >
                        ➕ Invoice
                    </button>

                    <button
                        onClick={() =>
                            navigate("/customers")
                        }
                        className="py-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium"
                    >
                        👥 Customers
                    </button>

                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">

                    <button
                        onClick={() =>
                            navigate("/products")
                        }
                        className="py-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium"
                    >
                        📦 Products
                    </button>

                    <button
                        onClick={() =>
                            navigate("/analytics")
                        }
                        className="py-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium"
                    >
                        📊 Analytics
                    </button>

                    <button
                        onClick={() =>
                            navigate("/ai-assistant")
                        }
                        className="py-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium"
                    >
                        🤖 AI
                    </button>

                </div>

                <button
                    onClick={handleLogout}
                    className="w-full mt-4 py-2 rounded-lg bg-red-50 text-red-500 text-xs font-medium"
                >
                    🚪 Logout
                </button>

            </div>

            {/* =================================================
                DESKTOP SIDEBAR
            ================================================= */}

            <aside className="w-64 bg-white border-r border-slate-200 p-5 hidden md:flex flex-col min-h-screen">

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-indigo-600">
                        InvoicePro
                    </h1>

                    <p className="text-xs text-slate-400 mt-1">
                        AI-Powered Invoicing
                    </p>
                </div>

                <nav className="space-y-2">

                    {/* DASHBOARD */}

                    <button
                        className="w-full text-left px-4 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-medium"
                    >
                        🏠 Dashboard
                    </button>

                    {/* INVOICES */}

                    <button
                        onClick={() =>
                            navigate("/invoices")
                        }
                        className="w-full text-left px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50"
                    >
                        🧾 Invoices
                    </button>

                    {/* CUSTOMERS */}

                    <button
                        onClick={() =>
                            navigate("/customers")
                        }
                        className="w-full text-left px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50"
                    >
                        👥 Customers
                    </button>

                    {/* PRODUCTS */}

                    <button
                        onClick={() =>
                            navigate("/products")
                        }
                        className="w-full text-left px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50"
                    >
                        📦 Products
                    </button>

                    {/* ANALYTICS */}

                    <button
                        onClick={() =>
                            navigate("/analytics")
                        }
                        className="w-full text-left px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50"
                    >
                        📊 Analytics
                    </button>

                    {/* AI ASSISTANT */}

                    <button
                        onClick={() =>
                            navigate("/ai-assistant")
                        }
                        className="w-full text-left px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50"
                    >
                        🤖 AI Assistant
                    </button>

                </nav>

                <div className="mt-auto">

                    {/* BUSINESS PROFILE */}

                    <button
                        onClick={() =>
                            navigate("/business-profile")
                        }
                        className="w-full text-left px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50"
                    >
                        ⚙️ Business Profile
                    </button>

                    {/* LOGOUT */}

                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-50"
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-10">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">

                    <div className="min-w-0">

                        <p className="text-xs sm:text-sm text-slate-500">
                            Dashboard
                        </p>

                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1 break-words">
                            Good evening,{" "}
                            {user.name} 👋
                        </h2>

                        <p className="text-sm sm:text-base text-slate-500 mt-1">
                            Here's what's happening
                            with your business.
                        </p>

                    </div>

                    <button
                        onClick={() =>
                            navigate("/create-invoice")
                        }
                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-medium shadow-sm text-sm sm:text-base"
                    >
                        + Create Invoice
                    </button>

                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm break-words">
                        {error}
                    </div>
                )}

                {/* =================================================
                    STATS
                ================================================= */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 md:mb-8">

                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200">

                        <p className="text-sm text-slate-500">
                            Total Sales
                        </p>

                        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-2 break-words">
                            {loading
                                ? "Loading..."
                                : formatCurrency(
                                      totalSales
                                  )}
                        </h3>

                        <p className="text-sm text-indigo-600 mt-2">
                            {invoices.length} invoice
                            {invoices.length !== 1
                                ? "s"
                                : ""}
                        </p>

                    </div>

                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200">

                        <p className="text-sm text-slate-500">
                            Paid
                        </p>

                        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-2 break-words">
                            {loading
                                ? "Loading..."
                                : formatCurrency(
                                      paidAmount
                                  )}
                        </h3>

                        <p className="text-sm text-green-600 mt-2">
                            {collectedPercentage}% collected
                        </p>

                    </div>

                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200">

                        <p className="text-sm text-slate-500">
                            Pending
                        </p>

                        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-2 break-words">
                            {loading
                                ? "Loading..."
                                : formatCurrency(
                                      pendingAmount
                                  )}
                        </h3>

                        <p className="text-sm text-yellow-600 mt-2">
                            {pendingInvoices.length}{" "}
                            invoice
                            {pendingInvoices.length !==
                            1
                                ? "s"
                                : ""}
                        </p>

                    </div>

                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200">

                        <p className="text-sm text-slate-500">
                            Overdue
                        </p>

                        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-2 break-words">
                            {loading
                                ? "Loading..."
                                : formatCurrency(
                                      overdueAmount
                                  )}
                        </h3>

                        <p className="text-sm text-red-600 mt-2">
                            {overdueInvoices.length}{" "}
                            invoice
                            {overdueInvoices.length !==
                            1
                                ? "s"
                                : ""}
                        </p>

                    </div>

                </div>

                {/* =================================================
                    CONTENT GRID
                ================================================= */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">

                    {/* REVENUE */}

                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 overflow-hidden">

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">

                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">
                                    Revenue Overview
                                </h3>

                                <p className="text-sm text-slate-500">
                                    Monthly revenue
                                </p>
                            </div>

                            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-full sm:w-auto bg-white">
                                <option>
                                    2026
                                </option>

                                <option>
                                    2025
                                </option>
                            </select>

                        </div>

                        <div className="overflow-x-auto">

                            <div className="h-56 sm:h-64 min-w-[500px] flex items-end gap-3 sm:gap-4 px-2 sm:px-4">

                                {[
                                    45,
                                    65,
                                    50,
                                    80,
                                    60,
                                    90,
                                    72,
                                    85,
                                    55,
                                    75,
                                    95,
                                    88,
                                ].map(
                                    (
                                        height,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                index
                                            }
                                            className="flex-1 min-w-[20px] bg-indigo-100 rounded-t-lg hover:bg-indigo-200 transition"
                                            style={{
                                                height: `${height}%`,
                                            }}
                                        />
                                    )
                                )}

                            </div>

                        </div>

                        <div className="min-w-[500px] flex justify-between text-xs text-slate-400 mt-3 px-2 sm:px-4">

                            <span>Jan</span>
                            <span>Mar</span>
                            <span>May</span>
                            <span>Jul</span>
                            <span>Sep</span>
                            <span>Nov</span>

                        </div>

                    </div>

                    {/* QUICK ACTIONS */}

                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">

                        <h3 className="text-lg font-semibold text-slate-800">
                            Quick Actions
                        </h3>

                        <div className="space-y-3 mt-5">

                            <button
                                onClick={() =>
                                    navigate(
                                        "/create-invoice"
                                    )
                                }
                                className="w-full p-4 rounded-xl bg-indigo-50 text-indigo-600 text-left hover:bg-indigo-100 text-sm sm:text-base"
                            >
                                🧾 Create Invoice
                            </button>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/business-profile"
                                    )
                                }
                                className="w-full p-4 rounded-xl bg-slate-50 text-slate-700 text-left hover:bg-slate-100 text-sm sm:text-base"
                            >
                                ⚙️ Business Profile
                            </button>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    RECENT INVOICES
                ================================================= */}

                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 mt-5 md:mt-6">

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">

                        <h3 className="text-lg font-semibold text-slate-800">
                            Recent Invoices
                        </h3>

                        <button
                            onClick={() =>
                                navigate(
                                    "/create-invoice"
                                )
                            }
                            className="text-sm text-indigo-600 hover:underline self-start sm:self-auto"
                        >
                            Create New
                        </button>

                    </div>

                    <div className="overflow-x-auto -mx-4 sm:mx-0">

                        <div className="min-w-[650px] px-4 sm:px-0">

                            {loading ? (
                                <p className="text-slate-500 py-6 text-sm">
                                    Loading invoices...
                                </p>
                            ) : recentInvoices.length ===
                              0 ? (
                                <div className="py-10 text-center px-4">

                                    <p className="text-slate-500">
                                        No invoices yet.
                                    </p>

                                    <button
                                        onClick={() =>
                                            navigate(
                                                "/create-invoice"
                                            )
                                        }
                                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm"
                                    >
                                        Create your first invoice
                                    </button>

                                </div>
                            ) : (
                                <table className="w-full text-left">

                                    <thead>
                                        <tr className="border-b border-slate-100 text-sm text-slate-500">

                                            <th className="pb-3 pr-4">
                                                Invoice
                                            </th>

                                            <th className="pb-3 pr-4">
                                                Customer
                                            </th>

                                            <th className="pb-3 pr-4">
                                                Date
                                            </th>

                                            <th className="pb-3 pr-4">
                                                Amount
                                            </th>

                                            <th className="pb-3 pr-4">
                                                Status
                                            </th>

                                            <th className="pb-3 text-right">
                                                Action
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {recentInvoices.map(
                                            (
                                                invoice
                                            ) => (
                                                <tr
                                                    key={
                                                        invoice._id
                                                    }
                                                    className="border-b border-slate-100 last:border-0"
                                                >

                                                    <td className="py-4 pr-4 font-medium">
                                                        {
                                                            invoice.invoiceNumber
                                                        }
                                                    </td>

                                                    <td className="pr-4">
                                                        {
                                                            invoice
                                                                .customer
                                                                ?.name ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td className="pr-4 whitespace-nowrap">
                                                        {formatDate(
                                                            invoice.invoiceDate ||
                                                                invoice.createdAt
                                                        )}
                                                    </td>

                                                    <td className="pr-4 whitespace-nowrap">
                                                        {formatCurrency(
                                                            invoice.total
                                                        )}
                                                    </td>

                                                    <td className="pr-4">

                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${getStatusStyle(
                                                                invoice.status
                                                            )}`}
                                                        >
                                                            {
                                                                invoice.status
                                                            }
                                                        </span>

                                                    </td>

                                                    <td className="py-4 text-right">

                                                        {invoice.status ===
                                                        "Paid" ? (
                                                            <span className="text-xs text-green-600 font-medium">
                                                                Paid
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    updateInvoiceStatus(
                                                                        invoice._id,
                                                                        "Paid"
                                                                    )
                                                                }
                                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-medium"
                                                            >
                                                                Mark as Paid
                                                            </button>
                                                        )}

                                                    </td>

                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>
                            )}

                        </div>

                    </div>

                    {!loading &&
                        recentInvoices.length >
                            0 && (
                            <p className="md:hidden text-[11px] text-slate-400 mt-3 text-center">
                                ← Swipe left/right to
                                view all invoice
                                details →
                            </p>
                        )}

                </div>

            </main>

        </div>
    );
}

export default Dashboard;