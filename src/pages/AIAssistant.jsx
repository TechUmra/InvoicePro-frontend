import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AIAssistant() {
    const navigate = useNavigate();

    const [messages, setMessages] = useState([
        {
            type: "bot",
            text: "👋 Hello! I'm your InvoicePro Assistant. I can help you with:\n\n📊 Analytics: Ask about sales, revenue, pending amounts\n👥 Customers: Information about your customers\n📦 Products: Details about your products\n📑 Invoices: Invoice statistics and details\n\nWhat would you like to know?",
        },
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    // =====================================================
    // FETCH DATA
    // =====================================================

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [
                invoiceRes,
                customerRes,
                productRes,
            ] = await Promise.all([
                API.get("/invoices"),
                API.get("/customers"),
                API.get("/products"),
            ]);

            setInvoices(
                invoiceRes.data.invoices ||
                    invoiceRes.data ||
                    []
            );
            setCustomers(
                customerRes.data.customers || []
            );
            setProducts(
                productRes.data.products || []
            );
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // =====================================================
    // PROCESS USER QUERY
    // =====================================================

    const processQuery = (query) => {
        const q = query.toLowerCase();

        // Sales & Revenue Queries
        if (
            q.includes("total sales") ||
            q.includes("revenue") ||
            q.includes("how much")
        ) {
            const total = invoices.reduce(
                (sum, inv) =>
                    sum + Number(inv.total || 0),
                0
            );
            return `💰 Your total sales: ₹${total.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })} from ${invoices.length} invoices.`;
        }

        // Paid Amount
        if (
            q.includes("paid") &&
            !q.includes("pending") &&
            !q.includes("overdue")
        ) {
            const paidInvoices = invoices.filter(
                (inv) => inv.status === "Paid"
            );
            const paidAmount = paidInvoices.reduce(
                (sum, inv) =>
                    sum + Number(inv.total || 0),
                0
            );
            return `✅ Amount Paid: ₹${paidAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })} from ${paidInvoices.length} invoices.`;
        }

        // Pending Amount
        if (q.includes("pending")) {
            const pendingInvoices = invoices.filter(
                (inv) => inv.status === "Pending"
            );
            const pendingAmount = pendingInvoices.reduce(
                (sum, inv) =>
                    sum + Number(inv.total || 0),
                0
            );
            return `⏳ Amount Pending: ₹${pendingAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })} from ${pendingInvoices.length} invoices.`;
        }

        // Overdue Amount
        if (q.includes("overdue")) {
            const overdueInvoices = invoices.filter(
                (inv) => inv.status === "Overdue"
            );
            const overdueAmount = overdueInvoices.reduce(
                (sum, inv) =>
                    sum + Number(inv.total || 0),
                0
            );
            return `⚠️ Amount Overdue: ₹${overdueAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })} from ${overdueInvoices.length} invoices. Please follow up with customers!`;
        }

        // Total Invoices
        if (
            q.includes("how many") &&
            q.includes("invoice")
        ) {
            return `📑 You have ${invoices.length} invoices in total.`;
        }

        // Customers Info
        if (
            q.includes("customer") ||
            q.includes("customers")
        ) {
            if (q.includes("how many")) {
                return `👥 You have ${customers.length} customers.`;
            }
            if (customers.length > 0) {
                const customerNames = customers
                    .slice(0, 5)
                    .map((c) => c.name)
                    .join(", ");
                return `👥 Some of your customers: ${customerNames}${
                    customers.length > 5
                        ? ` and ${
                              customers.length - 5
                          } more...`
                        : ""
                }`;
            }
            return "👥 No customers yet. Add some customers to track them.";
        }

        // Products Info
        if (q.includes("product")) {
            if (q.includes("how many")) {
                return `📦 You have ${products.length} products.`;
            }
            if (products.length > 0) {
                const productNames = products
                    .slice(0, 5)
                    .map((p) => p.name)
                    .join(", ");
                return `📦 Some of your products: ${productNames}${
                    products.length > 5
                        ? ` and ${
                              products.length - 5
                          } more...`
                        : ""
                }`;
            }
            return "📦 No products yet. Add some products to your catalog.";
        }

        // GST Info
        if (q.includes("gst") || q.includes("tax")) {
            const totalGST = invoices.reduce(
                (sum, inv) =>
                    sum +
                    (Number(inv.cgst || 0) +
                        Number(inv.sgst || 0)),
                0
            );
            return `💳 Total GST collected: ₹${totalGST.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })} (CGST + SGST)`;
        }

        // Collection Rate
        if (
            q.includes("collection") ||
            q.includes("collection rate")
        ) {
            const totalSales = invoices.reduce(
                (sum, inv) =>
                    sum + Number(inv.total || 0),
                0
            );
            const paidInvoices = invoices.filter(
                (inv) => inv.status === "Paid"
            );
            const paidAmount = paidInvoices.reduce(
                (sum, inv) =>
                    sum + Number(inv.total || 0),
                0
            );
            const rate =
                totalSales > 0
                    ? Math.round(
                          (paidAmount / totalSales) *
                              100
                      )
                    : 0;
            return `📊 Your collection rate is ${rate}%. Keep up the good work!`;
        }

        // High-value invoices
        if (
            q.includes("highest") ||
            q.includes("largest")
        ) {
            if (invoices.length === 0) {
                return "No invoices yet.";
            }
            const highest = invoices.reduce((max, inv) =>
                Number(inv.total || 0) >
                Number(max.total || 0)
                    ? inv
                    : max
            );
            return `💎 Your highest invoice: ₹${Number(
                highest.total || 0
            ).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })} (Invoice #${highest.invoiceNumber})`;
        }

        // Default response
        return `I can help you with analytics, customers, products, and invoices. Try asking about:\n\n• "What's my total sales?"\n• "How many customers do I have?"\n• "What's my collection rate?"\n• "Show me pending invoices"\n• "What's the GST collected?"\n\nWhat would you like to know?`;
    };

    // =====================================================
    // SEND MESSAGE
    // =====================================================

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [
            ...prev,
            {
                type: "user",
                text: userMessage,
            },
        ]);

        setLoading(true);

        // Simulate processing delay
        await new Promise((resolve) =>
            setTimeout(resolve, 500)
        );

        const response = processQuery(userMessage);
        setMessages((prev) => [
            ...prev,
            {
                type: "bot",
                text: response,
            },
        ]);

        setLoading(false);
    };

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                {/* HEADER */}

                <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            🤖 AI Assistant
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Ask about your business
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

                {/* CHAT CONTAINER */}

                <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 h-[600px] flex flex-col">
                    {/* MESSAGES */}

                    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                        {messages.map(
                            (msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${
                                        msg.type ===
                                        "user"
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl whitespace-pre-wrap break-words ${
                                            msg.type ===
                                            "user"
                                                ? "bg-indigo-600 text-white"
                                                : "bg-slate-100 text-slate-800"
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            )
                        )}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 text-slate-800 px-4 py-3 rounded-2xl">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* INPUT */}

                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) =>
                                setInput(e.target.value)
                            }
                            onKeyPress={(e) => {
                                if (
                                    e.key === "Enter"
                                ) {
                                    handleSend();
                                }
                            }}
                            placeholder="Ask me anything..."
                            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={
                                loading || !input.trim()
                            }
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-60"
                        >
                            Send
                        </button>
                    </div>
                </div>

                {/* QUICK TIPS */}

                <div className="mt-6 bg-indigo-50 rounded-2xl p-4 border border-indigo-200">
                    <p className="text-sm font-medium text-indigo-900 mb-2">
                        💡 Try asking:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-indigo-800">
                        <button
                            onClick={() => {
                                setInput(
                                    "What's my total sales?"
                                );
                            }}
                            className="text-left hover:bg-indigo-100 p-2 rounded"
                        >
                            "What's my total sales?"
                        </button>
                        <button
                            onClick={() => {
                                setInput(
                                    "How many customers do I have?"
                                );
                            }}
                            className="text-left hover:bg-indigo-100 p-2 rounded"
                        >
                            "How many customers?"
                        </button>
                        <button
                            onClick={() => {
                                setInput(
                                    "What's my collection rate?"
                                );
                            }}
                            className="text-left hover:bg-indigo-100 p-2 rounded"
                        >
                            "What's my collection rate?"
                        </button>
                        <button
                            onClick={() => {
                                setInput(
                                    "What's overdue?"
                                );
                            }}
                            className="text-left hover:bg-indigo-100 p-2 rounded"
                        >
                            "What's overdue?"
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AIAssistant;
