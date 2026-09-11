import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Analytics() {
    const navigate = useNavigate();

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    // =====================================================
    // FETCH INVOICES
    // =====================================================

    useEffect(() => {
        fetchInvoices();
    }, []);

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
            console.error("Error fetching invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // CALCULATIONS
    // =====================================================

    const totalSales = invoices.reduce(
        (sum, inv) => sum + Number(inv.total || 0),
        0
    );

    const paidInvoices = invoices.filter(
        (inv) => inv.status === "Paid"
    );

    const pendingInvoices = invoices.filter(
        (inv) => inv.status === "Pending"
    );

    const overdueInvoices = invoices.filter(
        (inv) => inv.status === "Overdue"
    );

    const paidAmount = paidInvoices.reduce(
        (sum, inv) => sum + Number(inv.total || 0),
        0
    );

    const pendingAmount = pendingInvoices.reduce(
        (sum, inv) => sum + Number(inv.total || 0),
        0
    );

    const overdueAmount = overdueInvoices.reduce(
        (sum, inv) => sum + Number(inv.total || 0),
        0
    );

    const totalGST = invoices.reduce(
        (sum, inv) =>
            sum +
            (Number(inv.cgst || 0) +
                Number(inv.sgst || 0)),
        0
    );

    const collectedPercentage =
        totalSales > 0
            ? Math.round((paidAmount / totalSales) * 100)
            : 0;

    // =====================================================
    // FORMAT CURRENCY
    // =====================================================

    const formatCurrency = (amount) => {
        return `₹${Number(amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* HEADER */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            📊 Analytics
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Your business insights
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className="text-indigo-600 hover:underline"
                    >
                        ← Dashboard
                    </button>
                </div>

                {/* LOADING */}

                {loading ? (
                    <p className="text-center text-slate-500">
                        Loading analytics...
                    </p>
                ) : invoices.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-slate-500">
                            No invoices yet. Create
                            one to see analytics
                        </p>
                    </div>
                ) : (
                    <>
                        {/* KEY METRICS */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {/* TOTAL SALES */}

                            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                <p className="text-sm text-slate-500">
                                    Total Sales
                                </p>
                                <h3 className="text-2xl font-bold text-slate-800 mt-2">
                                    {formatCurrency(
                                        totalSales
                                    )}
                                </h3>
                                <p className="text-sm text-indigo-600 mt-2">
                                    {invoices.length}{" "}
                                    invoice
                                    {invoices.length !==
                                    1
                                        ? "s"
                                        : ""}
                                </p>
                            </div>

                            {/* PAID */}

                            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                <p className="text-sm text-slate-500">
                                    Paid
                                </p>
                                <h3 className="text-2xl font-bold text-green-600 mt-2">
                                    {formatCurrency(
                                        paidAmount
                                    )}
                                </h3>
                                <p className="text-sm text-green-600 mt-2">
                                    {paidInvoices.length}{" "}
                                    invoice
                                    {paidInvoices.length !==
                                    1
                                        ? "s"
                                        : ""}
                                </p>
                            </div>

                            {/* PENDING */}

                            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                <p className="text-sm text-slate-500">
                                    Pending
                                </p>
                                <h3 className="text-2xl font-bold text-yellow-600 mt-2">
                                    {formatCurrency(
                                        pendingAmount
                                    )}
                                </h3>
                                <p className="text-sm text-yellow-600 mt-2">
                                    {
                                        pendingInvoices.length
                                    }{" "}
                                    invoice
                                    {pendingInvoices.length !==
                                    1
                                        ? "s"
                                        : ""}
                                </p>
                            </div>

                            {/* OVERDUE */}

                            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                <p className="text-sm text-slate-500">
                                    Overdue
                                </p>
                                <h3 className="text-2xl font-bold text-red-600 mt-2">
                                    {formatCurrency(
                                        overdueAmount
                                    )}
                                </h3>
                                <p className="text-sm text-red-600 mt-2">
                                    {
                                        overdueInvoices.length
                                    }{" "}
                                    invoice
                                    {overdueInvoices.length !==
                                    1
                                        ? "s"
                                        : ""}
                                </p>
                            </div>
                        </div>

                        {/* ADDITIONAL METRICS */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {/* COLLECTION RATE */}

                            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                <p className="text-sm font-medium text-slate-700">
                                    Collection Rate
                                </p>
                                <h3 className="text-3xl font-bold text-indigo-600 mt-3">
                                    {collectedPercentage}%
                                </h3>
                                <div className="mt-4 bg-slate-100 rounded-full h-2">
                                    <div
                                        className="bg-indigo-600 rounded-full h-2 transition-all"
                                        style={{
                                            width: `${collectedPercentage}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* TOTAL GST */}

                            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                <p className="text-sm font-medium text-slate-700">
                                    Total GST
                                    Collected
                                </p>
                                <h3 className="text-3xl font-bold text-slate-800 mt-3">
                                    {formatCurrency(
                                        totalGST
                                    )}
                                </h3>
                                <p className="text-xs text-slate-400 mt-2">
                                    CGST + SGST
                                </p>
                            </div>

                            {/* AVERAGE INVOICE */}

                            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                <p className="text-sm font-medium text-slate-700">
                                    Avg Invoice
                                    Value
                                </p>
                                <h3 className="text-3xl font-bold text-slate-800 mt-3">
                                    {formatCurrency(
                                        totalSales /
                                            invoices.length
                                    )}
                                </h3>
                                <p className="text-xs text-slate-400 mt-2">
                                    Per invoice
                                </p>
                            </div>
                        </div>

                        {/* STATUS BREAKDOWN */}

                        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
                            <h3 className="text-lg font-semibold text-slate-800 mb-6">
                                Invoice Status
                                Breakdown
                            </h3>

                            <div className="space-y-4">
                                {/* PAID */}

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-green-600">
                                            Paid (
                                            {
                                                paidInvoices.length
                                            }
                                            )
                                        </span>
                                        <span className="text-sm font-semibold text-slate-800">
                                            {formatCurrency(
                                                paidAmount
                                            )}
                                        </span>
                                    </div>
                                    <div className="bg-slate-100 rounded-full h-3">
                                        <div
                                            className="bg-green-500 rounded-full h-3 transition-all"
                                            style={{
                                                width: `${
                                                    totalSales >
                                                    0
                                                        ? (paidAmount /
                                                              totalSales) *
                                                          100
                                                        : 0
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* PENDING */}

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-yellow-600">
                                            Pending
                                            (
                                            {
                                                pendingInvoices.length
                                            }
                                            )
                                        </span>
                                        <span className="text-sm font-semibold text-slate-800">
                                            {formatCurrency(
                                                pendingAmount
                                            )}
                                        </span>
                                    </div>
                                    <div className="bg-slate-100 rounded-full h-3">
                                        <div
                                            className="bg-yellow-500 rounded-full h-3 transition-all"
                                            style={{
                                                width: `${
                                                    totalSales >
                                                    0
                                                        ? (pendingAmount /
                                                              totalSales) *
                                                          100
                                                        : 0
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* OVERDUE */}

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-red-600">
                                            Overdue
                                            (
                                            {
                                                overdueInvoices.length
                                            }
                                            )
                                        </span>
                                        <span className="text-sm font-semibold text-slate-800">
                                            {formatCurrency(
                                                overdueAmount
                                            )}
                                        </span>
                                    </div>
                                    <div className="bg-slate-100 rounded-full h-3">
                                        <div
                                            className="bg-red-500 rounded-full h-3 transition-all"
                                            style={{
                                                width: `${
                                                    totalSales >
                                                    0
                                                        ? (overdueAmount /
                                                              totalSales) *
                                                          100
                                                        : 0
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SUMMARY TABLE */}

                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-6">
                                Quick Summary
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-600">
                                        Total Invoices
                                    </span>
                                    <span className="font-semibold">
                                        {invoices.length}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-600">
                                        Total Amount
                                    </span>
                                    <span className="font-semibold">
                                        {formatCurrency(
                                            totalSales
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-600">
                                        Amount Collected
                                    </span>
                                    <span className="font-semibold text-green-600">
                                        {formatCurrency(
                                            paidAmount
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-600">
                                        Amount Pending
                                    </span>
                                    <span className="font-semibold text-yellow-600">
                                        {formatCurrency(
                                            pendingAmount
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-600">
                                        Amount Overdue
                                    </span>
                                    <span className="font-semibold text-red-600">
                                        {formatCurrency(
                                            overdueAmount
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <span className="text-slate-600">
                                        Total GST
                                    </span>
                                    <span className="font-semibold">
                                        {formatCurrency(
                                            totalGST
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Analytics;
