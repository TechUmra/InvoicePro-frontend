import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Invoices() {
    const navigate = useNavigate();

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // LOAD INVOICES
    // =====================================================

    const fetchInvoices = async () => {
        try {
            setLoading(true);

            const response = await API.get("/invoices");

            setInvoices(
                response.data.invoices ||
                    response.data ||
                    []
            );
        } catch (error) {
            console.error(
                "Invoice fetch error:",
                error
            );

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
    // UPDATE STATUS
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
                "Status update error:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Failed to update invoice status."
            );
        }
    };

    // =====================================================
    // DELETE INVOICE
    // =====================================================

    const deleteInvoice = async (invoiceId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this invoice?"
        );

        if (!confirmDelete) return;

        try {
            await API.delete(
                `/invoices/${invoiceId}`
            );

            await fetchInvoices();
        } catch (error) {
            console.error(
                "Delete invoice error:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Failed to delete invoice."
            );
        }
    };

    // =====================================================
    // EDIT INVOICE
    // =====================================================

    const editInvoice = (invoice) => {
        navigate("/create-invoice", {
            state: {
                editInvoice: invoice,
            },
        });
    };

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
        <div className="min-h-screen bg-slate-50">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="bg-white border-b border-slate-200">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/dashboard"
                                    )
                                }
                                className="text-sm text-slate-500 hover:text-indigo-600 mb-2"
                            >
                                ← Back to Dashboard
                            </button>

                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                                Invoices
                            </h1>

                            <p className="text-sm text-slate-500 mt-1">
                                Manage all your invoices
                            </p>

                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/create-invoice"
                                )
                            }
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-medium shadow-sm"
                        >
                            + Create Invoice
                        </button>

                    </div>

                </div>

            </div>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* ERROR */}

                {error && (
                    <div className="mb-5 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <p className="text-sm text-slate-500">
                            Total Invoices
                        </p>

                        <h2 className="text-2xl font-bold text-slate-800 mt-2">
                            {invoices.length}
                        </h2>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <p className="text-sm text-slate-500">
                            Paid
                        </p>

                        <h2 className="text-2xl font-bold text-green-600 mt-2">
                            {
                                invoices.filter(
                                    (invoice) =>
                                        invoice.status ===
                                        "Paid"
                                ).length
                            }
                        </h2>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <p className="text-sm text-slate-500">
                            Pending / Overdue
                        </p>

                        <h2 className="text-2xl font-bold text-red-500 mt-2">
                            {
                                invoices.filter(
                                    (invoice) =>
                                        invoice.status !==
                                        "Paid"
                                ).length
                            }
                        </h2>
                    </div>

                </div>

                {/* =================================================
                    INVOICE LIST
                ================================================= */}

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

                    <div className="px-5 sm:px-6 py-5 border-b border-slate-100">

                        <h2 className="text-lg font-semibold text-slate-800">
                            All Invoices
                        </h2>

                    </div>

                    {loading ? (
                        <div className="py-16 text-center">
                            <p className="text-sm text-slate-500">
                                Loading invoices...
                            </p>
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="py-16 text-center px-5">

                            <div className="text-4xl mb-3">
                                🧾
                            </div>

                            <h3 className="text-lg font-semibold text-slate-700">
                                No invoices yet
                            </h3>

                            <p className="text-sm text-slate-400 mt-1">
                                Create your first invoice
                                to get started.
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/create-invoice"
                                    )
                                }
                                className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
                            >
                                + Create Invoice
                            </button>

                        </div>
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[900px] text-left">

                                <thead>

                                    <tr className="border-b border-slate-100 text-sm text-slate-500">

                                        <th className="px-5 sm:px-6 py-4">
                                            Invoice
                                        </th>

                                        <th className="px-5 py-4">
                                            Customer
                                        </th>

                                        <th className="px-5 py-4">
                                            Date
                                        </th>

                                        <th className="px-5 py-4">
                                            Amount
                                        </th>

                                        <th className="px-5 py-4">
                                            Status
                                        </th>

                                        <th className="px-5 sm:px-6 py-4 text-right">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {invoices.map(
                                        (invoice) => (
                                            <tr
                                                key={
                                                    invoice._id
                                                }
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                            >

                                                <td className="px-5 sm:px-6 py-4 font-medium text-slate-800">
                                                    {invoice.invoiceNumber ||
                                                        "Invoice"}
                                                </td>

                                                <td className="px-5 py-4 text-slate-600">
                                                    {
                                                        invoice
                                                            .customer
                                                            ?.name ||
                                                        "-"
                                                    }
                                                </td>

                                                <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                                                    {formatDate(
                                                        invoice.invoiceDate ||
                                                            invoice.createdAt
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 font-medium text-slate-700 whitespace-nowrap">
                                                    {formatCurrency(
                                                        invoice.total
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">

                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusStyle(
                                                            invoice.status
                                                        )}`}
                                                    >
                                                        {invoice.status ||
                                                            "Pending"}
                                                    </span>

                                                </td>

                                                <td className="px-5 sm:px-6 py-4">

                                                    <div className="flex justify-end gap-2 flex-wrap">

                                                        {/* EDIT */}

                                                        <button
                                                            onClick={() =>
                                                                editInvoice(
                                                                    invoice
                                                                )
                                                            }
                                                            className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-medium"
                                                        >
                                                            ✏️ Edit
                                                        </button>

                                                        {/* PAID / UNPAID */}

                                                        {invoice.status ===
                                                        "Paid" ? (
                                                            <button
                                                                onClick={() =>
                                                                    updateInvoiceStatus(
                                                                        invoice._id,
                                                                        "Pending"
                                                                    )
                                                                }
                                                                className="px-3 py-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 text-xs font-medium"
                                                            >
                                                                ↩ Unpaid
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    updateInvoiceStatus(
                                                                        invoice._id,
                                                                        "Paid"
                                                                    )
                                                                }
                                                                className="px-3 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-xs font-medium"
                                                            >
                                                                ✓ Mark as Paid
                                                            </button>
                                                        )}

                                                        {/* OVERDUE */}

                                                        {invoice.status !==
                                                            "Overdue" && (
                                                            <button
                                                                onClick={() =>
                                                                    updateInvoiceStatus(
                                                                        invoice._id,
                                                                        "Overdue"
                                                                    )
                                                                }
                                                                className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium"
                                                            >
                                                                ⚠️ Overdue
                                                            </button>
                                                        )}

                                                        {/* DELETE */}

                                                        <button
                                                            onClick={() =>
                                                                deleteInvoice(
                                                                    invoice._id
                                                                )
                                                            }
                                                            className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 text-xs font-medium"
                                                        >
                                                            🗑️ Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>

            </main>

        </div>
    );
}

export default Invoices;