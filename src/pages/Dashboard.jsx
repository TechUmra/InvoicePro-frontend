import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load user
    useEffect(() => {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    // Load invoices
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await API.get("/invoices");

                setInvoices(response.data.invoices || response.data);
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

        fetchInvoices();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/";
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500">Loading...</p>
            </div>
        );
    }

    // -----------------------------
    // CALCULATE DASHBOARD STATISTICS
    // -----------------------------

    const totalSales = invoices.reduce(
        (sum, invoice) => sum + Number(invoice.total || 0),
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
        (sum, invoice) => sum + Number(invoice.total || 0),
        0
    );

    const pendingAmount = pendingInvoices.reduce(
        (sum, invoice) => sum + Number(invoice.total || 0),
        0
    );

    const overdueAmount = overdueInvoices.reduce(
        (sum, invoice) => sum + Number(invoice.total || 0),
        0
    );

    const collectedPercentage =
        totalSales > 0
            ? ((paidAmount / totalSales) * 100).toFixed(1)
            : "0.0";

    // Latest 5 invoices
    const recentInvoices = [...invoices]
        .sort(
            (a, b) =>
                new Date(b.invoiceDate || b.createdAt) -
                new Date(a.invoiceDate || a.createdAt)
        )
        .slice(0, 5);

    // -----------------------------
    // FORMAT CURRENCY
    // -----------------------------

    const formatCurrency = (amount) => {
        return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
    };

    // -----------------------------
    // FORMAT DATE
    // -----------------------------

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // -----------------------------
    // STATUS STYLE
    // -----------------------------

    const getStatusStyle = (status) => {
        if (status === "Paid") {
            return "bg-green-50 text-green-600";
        }

        if (status === "Overdue") {
            return "bg-red-50 text-red-600";
        }

        return "bg-yellow-50 text-yellow-600";
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">

            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r border-slate-200 p-5 hidden md:flex flex-col">

                <div className="mb-10">
                    <h1 className="text-2xl font-bold text-indigo-600">
                        InvoicePro
                    </h1>

                    <p className="text-xs text-slate-400 mt-1">
                        AI-Powered Invoicing
                    </p>
                </div>

                <nav className="space-y-2">

                    <button
                        className="w-full text-left px-4 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-medium"
                    >
                        🏠 Dashboard
                    </button>

                    <button
                        onClick={() => navigate("/invoices")}
                        className="w-full text-left px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50"
                    >
                        🧾 Invoices
                    </button>

                    <button
                        className="w-full text-left px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50"
                    >
                        👥 Customers
                    </button>

                    <button
                        className="w-full text-left px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50"
                    >
                        📦 Products
                    </button>

                    <button
                        className="w-full text-left px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50"
                    >
                        📊 Analytics
                    </button>

                </nav>

                <div className="mt-auto">

                    <button
    onClick={() => navigate("/business-profile")}
    className="w-full text-left px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50"
>
    ⚙️ Business Profile
</button>

                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-50"
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-6 md:p-10">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                    <div>

                        <p className="text-sm text-slate-500">
                            Dashboard
                        </p>

                        <h2 className="text-3xl font-bold text-slate-800 mt-1">
                            Good evening, {user.name} 👋
                        </h2>

                        <p className="text-slate-500 mt-1">
                            Here's what's happening with your business.
                        </p>

                    </div>

                    <button
                        onClick={() => navigate("/create-invoice")}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-medium shadow-sm"
                    >
                        + Create Invoice
                    </button>

                </div>

                {/* ERROR */}
                {error && (
                    <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

                    {/* TOTAL SALES */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200">

                        <p className="text-sm text-slate-500">
                            Total Sales
                        </p>

                        <h3 className="text-2xl font-bold text-slate-800 mt-2">
                            {loading
                                ? "Loading..."
                                : formatCurrency(totalSales)}
                        </h3>

                        <p className="text-sm text-indigo-600 mt-2">
                            {invoices.length} invoice
                            {invoices.length !== 1 ? "s" : ""}
                        </p>

                    </div>

                    {/* PAID */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200">

                        <p className="text-sm text-slate-500">
                            Paid
                        </p>

                        <h3 className="text-2xl font-bold text-slate-800 mt-2">
                            {loading
                                ? "Loading..."
                                : formatCurrency(paidAmount)}
                        </h3>

                        <p className="text-sm text-green-600 mt-2">
                            {collectedPercentage}% collected
                        </p>

                    </div>

                    {/* PENDING */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200">

                        <p className="text-sm text-slate-500">
                            Pending
                        </p>

                        <h3 className="text-2xl font-bold text-slate-800 mt-2">
                            {loading
                                ? "Loading..."
                                : formatCurrency(pendingAmount)}
                        </h3>

                        <p className="text-sm text-yellow-600 mt-2">
                            {pendingInvoices.length} invoice
                            {pendingInvoices.length !== 1 ? "s" : ""}
                        </p>

                    </div>

                    {/* OVERDUE */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200">

                        <p className="text-sm text-slate-500">
                            Overdue
                        </p>

                        <h3 className="text-2xl font-bold text-slate-800 mt-2">
                            {loading
                                ? "Loading..."
                                : formatCurrency(overdueAmount)}
                        </h3>

                        <p className="text-sm text-red-600 mt-2">
                            {overdueInvoices.length} invoice
                            {overdueInvoices.length !== 1 ? "s" : ""}
                        </p>

                    </div>

                </div>

                {/* CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* REVENUE */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">

                        <div className="flex justify-between items-center mb-6">

                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">
                                    Revenue Overview
                                </h3>

                                <p className="text-sm text-slate-500">
                                    Monthly revenue
                                </p>
                            </div>

                            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                <option>2026</option>
                                <option>2025</option>
                            </select>

                        </div>

                        <div className="h-64 flex items-end gap-4 px-4">

                            {[45, 65, 50, 80, 60, 90, 72, 85, 55, 75, 95, 88].map(
                                (height, index) => (
                                    <div
                                        key={index}
                                        className="flex-1 bg-indigo-100 rounded-t-lg hover:bg-indigo-200 transition"
                                        style={{ height: `${height}%` }}
                                    />
                                )
                            )}

                        </div>

                        <div className="flex justify-between text-xs text-slate-400 mt-3">
                            <span>Jan</span>
                            <span>Mar</span>
                            <span>May</span>
                            <span>Jul</span>
                            <span>Sep</span>
                            <span>Nov</span>
                        </div>

                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">

                        <h3 className="text-lg font-semibold text-slate-800">
                            Quick Actions
                        </h3>

                        <div className="space-y-3 mt-5">

                            <button
                                onClick={() => navigate("/create-invoice")}
                                className="w-full p-4 rounded-xl bg-indigo-50 text-indigo-600 text-left hover:bg-indigo-100"
                            >
                                🧾 Create Invoice
                            </button>

                            <button className="w-full p-4 rounded-xl bg-slate-50 text-slate-700 text-left hover:bg-slate-100">
                                👥 Add Customer
                            </button>

                            <button className="w-full p-4 rounded-xl bg-slate-50 text-slate-700 text-left hover:bg-slate-100">
                                📦 Add Product
                            </button>

                            <button className="w-full p-4 rounded-xl bg-slate-50 text-slate-700 text-left hover:bg-slate-100">
                                🤖 Ask AI Assistant
                            </button>

                        </div>

                    </div>

                </div>

                {/* RECENT INVOICES */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-6">

                    <div className="flex justify-between items-center mb-5">

                        <h3 className="text-lg font-semibold text-slate-800">
                            Recent Invoices
                        </h3>

                        <button
                            onClick={() => navigate("/invoices")}
                            className="text-sm text-indigo-600 hover:underline"
                        >
                            View All
                        </button>

                    </div>

                    <div className="overflow-x-auto">

                        {loading ? (
                            <p className="text-slate-500 py-6">
                                Loading invoices...
                            </p>
                        ) : recentInvoices.length === 0 ? (
                            <div className="py-10 text-center">

                                <p className="text-slate-500">
                                    No invoices yet.
                                </p>

                                <button
                                    onClick={() =>
                                        navigate("/create-invoice")
                                    }
                                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
                                >
                                    Create your first invoice
                                </button>

                            </div>
                        ) : (
                            <table className="w-full text-left">

                                <thead>
                                    <tr className="border-b border-slate-100 text-sm text-slate-500">

                                        <th className="pb-3">
                                            Invoice
                                        </th>

                                        <th className="pb-3">
                                            Customer
                                        </th>

                                        <th className="pb-3">
                                            Date
                                        </th>

                                        <th className="pb-3">
                                            Amount
                                        </th>

                                        <th className="pb-3">
                                            Status
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {recentInvoices.map((invoice) => (

                                        <tr
                                            key={invoice._id}
                                            className="border-b border-slate-100 last:border-0"
                                        >

                                            <td className="py-4 font-medium">
                                                {invoice.invoiceNumber}
                                            </td>

                                            <td>
                                                {invoice.customer?.name || "-"}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    invoice.invoiceDate ||
                                                        invoice.createdAt
                                                )}
                                            </td>

                                            <td>
                                                {formatCurrency(
                                                    invoice.total
                                                )}
                                            </td>

                                            <td>

                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs ${getStatusStyle(
                                                        invoice.status
                                                    )}`}
                                                >
                                                    {invoice.status}
                                                </span>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>
                        )}

                    </div>

                </div>

            </main>

        </div>
    );
}

export default Dashboard;