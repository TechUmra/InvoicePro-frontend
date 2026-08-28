import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function InvoicePreview() {
    const navigate = useNavigate();
    const location = useLocation();

    const [invoice, setInvoice] = useState(null);
    const [user, setUser] = useState(null);

    // =====================================================
    // LOAD INVOICE + USER
    // =====================================================

    useEffect(() => {
        const loadData = async () => {
            const savedInvoice = location.state?.invoice;

            if (savedInvoice) {
                setInvoice(savedInvoice);
            }

            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    const savedUser =
                        localStorage.getItem("user");

                    if (savedUser) {
                        setUser(JSON.parse(savedUser));
                    }

                    return;
                }

                const response = await fetch(
                    "http://localhost:5000/api/auth/me",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (response.ok && data.user) {
                    setUser(data.user);

                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );
                } else {
                    const savedUser =
                        localStorage.getItem("user");

                    if (savedUser) {
                        setUser(JSON.parse(savedUser));
                    }
                }
            } catch (error) {
                console.error(
                    "Invoice preview loading error:",
                    error
                );

                const savedUser =
                    localStorage.getItem("user");

                if (savedUser) {
                    try {
                        setUser(JSON.parse(savedUser));
                    } catch (err) {
                        console.error(
                            "User parse error:",
                            err
                        );
                    }
                }
            }
        };

        loadData();
    }, [location.state]);

    // =====================================================
    // CURRENCY
    // =====================================================

    const formatCurrency = (amount) => {
        return `₹${Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;
    };

    const formatPDFCurrency = (amount) => {
        return `Rs. ${Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;
    };

    // =====================================================
    // NUMBER TO WORDS
    // =====================================================

    const numberToWords = (num) => {
        num = Math.floor(Number(num || 0));

        if (num === 0) {
            return "Zero Rupees Only";
        }

        const ones = [
            "",
            "One",
            "Two",
            "Three",
            "Four",
            "Five",
            "Six",
            "Seven",
            "Eight",
            "Nine",
            "Ten",
            "Eleven",
            "Twelve",
            "Thirteen",
            "Fourteen",
            "Fifteen",
            "Sixteen",
            "Seventeen",
            "Eighteen",
            "Nineteen",
        ];

        const tens = [
            "",
            "",
            "Twenty",
            "Thirty",
            "Forty",
            "Fifty",
            "Sixty",
            "Seventy",
            "Eighty",
            "Ninety",
        ];

        const convertBelowThousand = (number) => {
            let result = "";

            if (number >= 100) {
                result +=
                    ones[Math.floor(number / 100)] +
                    " Hundred ";

                number %= 100;
            }

            if (number >= 20) {
                result +=
                    tens[Math.floor(number / 10)] +
                    " ";

                number %= 10;
            }

            if (number > 0) {
                result += ones[number] + " ";
            }

            return result.trim();
        };

        let result = "";

        const crore = Math.floor(num / 10000000);
        num %= 10000000;

        const lakh = Math.floor(num / 100000);
        num %= 100000;

        const thousand = Math.floor(num / 1000);
        num %= 1000;

        if (crore) {
            result +=
                convertBelowThousand(crore) +
                " Crore ";
        }

        if (lakh) {
            result +=
                convertBelowThousand(lakh) +
                " Lakh ";
        }

        if (thousand) {
            result +=
                convertBelowThousand(thousand) +
                " Thousand ";
        }

        if (num) {
            result += convertBelowThousand(num);
        }

        return `${result.trim()} Rupees Only`;
    };

    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = (date) => {
        if (!date) return "-";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString("en-IN");
    };

    // =====================================================
    // SUPPORT DIFFERENT FIELD NAMES
    // =====================================================

    const saleType =
        invoice?.saleType ||
        invoice?.sale_type ||
        invoice?.type ||
        "Sale";

    const orderNo =
        invoice?.orderNo ||
        invoice?.orderNumber ||
        invoice?.order_no ||
        "";

    const ewayBillNo =
        invoice?.ewayBillNo ||
        invoice?.eWayBillNo ||
        invoice?.ewayBillNumber ||
        invoice?.eway_bill_no ||
        "";

    const termsAndConditions =
        invoice?.termsAndConditions ||
        invoice?.terms ||
        "";

    // =====================================================
    // CALCULATE TOTALS
    // =====================================================

    const items = invoice?.items || [];

    const calculatedSubtotal =
        items.reduce((sum, item) => {
            const quantity =
                Number(item.quantity) || 0;

            const rate =
                Number(item.rate) || 0;

            return sum + quantity * rate;
        }, 0);

    const calculatedGST =
        items.reduce((sum, item) => {
            const quantity =
                Number(item.quantity) || 0;

            const rate =
                Number(item.rate) || 0;

            const gstRate =
                Number(item.gstRate) || 0;

            const amount =
                quantity * rate;

            return (
                sum +
                (amount * gstRate) / 100
            );
        }, 0);

    const subtotal =
        invoice?.subtotal !== undefined
            ? Number(invoice.subtotal)
            : calculatedSubtotal;

    const totalGST =
        calculatedGST;

    const cgst =
        invoice?.cgst !== undefined
            ? Number(invoice.cgst)
            : totalGST / 2;

    const sgst =
        invoice?.sgst !== undefined
            ? Number(invoice.sgst)
            : totalGST / 2;

    const total =
        invoice?.total !== undefined
            ? Number(invoice.total)
            : subtotal + cgst + sgst;

    // =====================================================
    // PDF GENERATION
    // =====================================================

    const generatePDF = () => {
        if (!invoice) return;

        const doc = new jsPDF(
            "p",
            "mm",
            "a4"
        );

        const pageWidth =
            doc.internal.pageSize.getWidth();

        const pageHeight =
            doc.internal.pageSize.getHeight();

        const left = 14;
        const right = pageWidth - 14;

        const primary = [
            79,
            70,
            229,
        ];

        const dark = [
            30,
            41,
            59,
        ];

        const gray = [
            100,
            116,
            139,
        ];

        const lightGray = [
            226,
            232,
            240,
        ];

        // =================================================
        // BORDER
        // =================================================

        doc.setDrawColor(...lightGray);
        doc.setLineWidth(0.4);

        doc.rect(
            10,
            10,
            pageWidth - 20,
            pageHeight - 20
        );

        // =================================================
        // GSTIN + MOBILE
        // =================================================

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(8);
        doc.setTextColor(...gray);

        doc.text(
            `GSTIN: ${
                user?.gstin || "N/A"
            }`,
            left,
            18
        );

        doc.text(
            `Mobile: ${
                user?.phone || "N/A"
            }`,
            right,
            18,
            {
                align: "right",
            }
        );

        // =================================================
        // TAX INVOICE
        // =================================================

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(15);
        doc.setTextColor(...dark);

        doc.text(
            "TAX INVOICE",
            pageWidth / 2,
            29,
            {
                align: "center",
            }
        );

        // =================================================
        // BUSINESS NAME
        // =================================================

        doc.setFontSize(18);
        doc.setTextColor(...primary);

        doc.text(
            user?.businessName ||
                "Business Name",
            pageWidth / 2,
            39,
            {
                align: "center",
            }
        );

        doc.setDrawColor(...primary);
        doc.setLineWidth(1);

        doc.line(
            pageWidth / 2 - 35,
            42,
            pageWidth / 2 + 35,
            42
        );

        // =================================================
        // BUSINESS INFO
        // =================================================

        let businessInfoY = 48;

        if (user?.businessType) {
            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(9);
            doc.setTextColor(...dark);

            doc.text(
                user.businessType,
                pageWidth / 2,
                businessInfoY,
                {
                    align: "center",
                }
            );

            businessInfoY += 5;
        }

        if (user?.businessDescription) {
            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(8);
            doc.setTextColor(...gray);

            const descriptionLines =
                doc.splitTextToSize(
                    user.businessDescription,
                    150
                );

            doc.text(
                descriptionLines,
                pageWidth / 2,
                businessInfoY,
                {
                    align: "center",
                }
            );

            businessInfoY +=
                descriptionLines.length * 4;
        }

        if (user?.businessAddress) {
            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(8);
            doc.setTextColor(...gray);

            const addressLines =
                doc.splitTextToSize(
                    user.businessAddress,
                    150
                );

            doc.text(
                addressLines,
                pageWidth / 2,
                businessInfoY + 1,
                {
                    align: "center",
                }
            );

            businessInfoY +=
                addressLines.length * 4 +
                2;
        }

        // =================================================
        // HEADER LINE
        // =================================================

        const headerLineY =
            Math.max(
                businessInfoY + 4,
                68
            );

        doc.setDrawColor(...lightGray);
        doc.setLineWidth(0.5);

        doc.line(
            left,
            headerLineY,
            right,
            headerLineY
        );

        // =================================================
        // INVOICE DETAILS + BILL TO
        // =================================================

        const infoTop =
            headerLineY + 6;

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(9);
        doc.setTextColor(...dark);

        doc.text(
            "INVOICE DETAILS",
            left,
            infoTop
        );

        doc.text(
            "BILL TO",
            pageWidth / 2 + 5,
            infoTop
        );

        // =================================================
        // INVOICE DETAILS
        // =================================================

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(8);
        doc.setTextColor(...gray);

        doc.text(
            `Invoice No: ${
                invoice.invoiceNumber ||
                "-"
            }`,
            left,
            infoTop + 7
        );

        doc.text(
            `Date: ${formatDate(
                invoice.invoiceDate
            )}`,
            left,
            infoTop + 14
        );

        doc.text(
            `Sale Type: ${saleType}`,
            left,
            infoTop + 21
        );

        let extraInfoY =
            infoTop + 28;

        if (orderNo) {
            doc.text(
                `Order No: ${orderNo}`,
                left,
                extraInfoY
            );

            extraInfoY += 6;
        }

        if (ewayBillNo) {
            doc.text(
                `E-Way Bill No: ${ewayBillNo}`,
                left,
                extraInfoY
            );
        }

        // =================================================
        // BILL TO
        // =================================================

        const customerX =
            pageWidth / 2 + 5;

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setTextColor(...dark);

        doc.text(
            invoice.customer?.name ||
                "-",
            customerX,
            infoTop + 7
        );

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setTextColor(...gray);

        let customerY =
            infoTop + 13;

        if (invoice.customer?.address) {
            const addressLines =
                doc.splitTextToSize(
                    invoice.customer.address,
                    75
                );

            doc.text(
                addressLines,
                customerX,
                customerY
            );

            customerY +=
                addressLines.length * 4;
        }

        if (invoice.customer?.gstin) {
            doc.text(
                `GSTIN: ${invoice.customer.gstin}`,
                customerX,
                customerY
            );

            customerY += 4.5;
        }

        if (invoice.customer?.phone) {
            doc.text(
                `Mobile: ${invoice.customer.phone}`,
                customerX,
                customerY
            );

            customerY += 4.5;
        }

        if (invoice.customer?.email) {
            doc.text(
                `Email: ${invoice.customer.email}`,
                customerX,
                customerY
            );
        }

        // =================================================
        // VERTICAL DIVIDER
        // =================================================

        doc.setDrawColor(...lightGray);

        doc.line(
            pageWidth / 2,
            infoTop - 4,
            pageWidth / 2,
            infoTop + 38
        );

        // =================================================
        // TABLE
        // =================================================

        const tableData =
            items.map(
                (item, index) => [
                    index + 1,

                    item.description ||
                        "-",

                    item.hsn ||
                        "-",

                    item.quantity ||
                        0,

                    item.unit ||
                        "Piece",

                    formatPDFCurrency(
                        item.rate
                    ),

                    `${
                        item.gstRate || 0
                    }%`,

                    formatPDFCurrency(
                        item.amount ??
                            (
                                Number(
                                    item.quantity
                                ) *
                                Number(
                                    item.rate
                                )
                            )
                    ),
                ]
            );

        autoTable(doc, {
            startY:
                infoTop + 45,

            margin: {
                left,
                right: 14,
            },

            head: [
                [
                    "S.No",
                    "Description",
                    "HSN",
                    "Qty",
                    "Unit",
                    "Rate",
                    "GST",
                    "Amount",
                ],
            ],

            body: tableData,

            theme: "grid",

            styles: {
                font: "helvetica",
                fontSize: 8,
                cellPadding: 2.5,
                lineColor: [
                    203,
                    213,
                    225,
                ],
                lineWidth: 0.25,
                textColor: [
                    30,
                    41,
                    59,
                ],
                valign: "middle",
            },

            headStyles: {
                fontStyle: "bold",
                fontSize: 8,
                halign: "center",
                valign: "middle",
                fillColor: primary,
                textColor: [
                    255,
                    255,
                    255,
                ],
            },

            bodyStyles: {
                minCellHeight: 8,
            },

            columnStyles: {
                0: {
                    cellWidth: 12,
                    halign: "center",
                },

                1: {
                    cellWidth: 51,
                },

                2: {
                    cellWidth: 18,
                    halign: "center",
                },

                3: {
                    cellWidth: 13,
                    halign: "center",
                },

                4: {
                    cellWidth: 17,
                    halign: "center",
                },

                5: {
                    cellWidth: 24,
                    halign: "right",
                },

                6: {
                    cellWidth: 16,
                    halign: "center",
                },

                7: {
                    cellWidth: 28,
                    halign: "right",
                },
            },
        });

        // =================================================
        // SUMMARY
        // =================================================

        let finalY =
            doc.lastAutoTable.finalY + 7;

        const summaryX =
            pageWidth - 78;

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(8);
        doc.setTextColor(...gray);

        doc.text(
            "Subtotal:",
            summaryX,
            finalY
        );

        doc.text(
            formatPDFCurrency(subtotal),
            right,
            finalY,
            {
                align: "right",
            }
        );

        doc.text(
            "CGST:",
            summaryX,
            finalY + 6
        );

        doc.text(
            formatPDFCurrency(cgst),
            right,
            finalY + 6,
            {
                align: "right",
            }
        );

        doc.text(
            "SGST:",
            summaryX,
            finalY + 12
        );

        doc.text(
            formatPDFCurrency(sgst),
            right,
            finalY + 12,
            {
                align: "right",
            }
        );

        doc.setDrawColor(...lightGray);

        doc.line(
            summaryX - 3,
            finalY + 17,
            right,
            finalY + 17
        );

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(11);
        doc.setTextColor(...dark);

        doc.text(
            "TOTAL:",
            summaryX,
            finalY + 25
        );

        doc.setTextColor(...primary);

        doc.text(
            formatPDFCurrency(total),
            right,
            finalY + 25,
            {
                align: "right",
            }
        );

        // =================================================
        // AMOUNT IN WORDS
        // =================================================

        const wordsY =
            finalY + 40;

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(8);
        doc.setTextColor(...dark);

        doc.text(
            "Amount in Words:",
            left,
            wordsY
        );

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setTextColor(...gray);

        const wordsLines =
            doc.splitTextToSize(
                numberToWords(total),
                105
            );

        doc.text(
            wordsLines,
            left,
            wordsY + 5
        );

        // =================================================
        // TERMS
        // =================================================

        let termsY =
            wordsY +
            16 +
            wordsLines.length * 4;

        if (
            termsAndConditions &&
            termsAndConditions.trim()
        ) {
            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(9);
            doc.setTextColor(...dark);

            doc.text(
                "TERMS & CONDITIONS",
                left,
                termsY
            );

            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(7.5);
            doc.setTextColor(...gray);

            const termsLines =
                doc.splitTextToSize(
                    termsAndConditions,
                    105
                );

            doc.text(
                termsLines,
                left,
                termsY + 6
            );
        }

        // =================================================
        // SIGNATURE SECTION
        // =================================================

        const signatureX =
            pageWidth - 78;

        // Keep signature safely inside A4 page
        const signatureY =
            Math.min(
                finalY + 48,
                pageHeight - 58
            );

        // Receiver signature line
        doc.setDrawColor(...gray);
        doc.setLineWidth(0.4);

        doc.line(
            signatureX,
            signatureY,
            right,
            signatureY
        );

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(8);
        doc.setTextColor(...gray);

        doc.text(
            "Receiver Signature",
            signatureX,
            signatureY + 5
        );

        // Business name
        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(9);
        doc.setTextColor(...dark);

        doc.text(
            `For ${
                user?.businessName ||
                "Business Name"
            }`,
            right,
            signatureY + 11,
            {
                align: "right",
            }
        );

        // =================================================
        // DIGITAL SIGNATURE
        // =================================================

        if (user?.signature) {
            try {
                const signatureProps =
                    doc.getImageProperties(
                        user.signature
                    );

                const maxSignatureWidth = 38;
                const maxSignatureHeight = 13;

                const scale = Math.min(
                    maxSignatureWidth /
                        signatureProps.width,

                    maxSignatureHeight /
                        signatureProps.height
                );

                const signatureWidth =
                    signatureProps.width *
                    scale;

                const signatureHeight =
                    signatureProps.height *
                    scale;

                const signatureImageX =
                    signatureX +
                    (43 - signatureWidth) /
                        2;

                const signatureImageY =
                    signatureY + 13;

                doc.addImage(
                    user.signature,
                    signatureProps.fileType ||
                        "PNG",
                    signatureImageX,
                    signatureImageY,
                    signatureWidth,
                    signatureHeight
                );
            } catch (error) {
                console.error(
                    "Signature PDF error:",
                    error
                );
            }
        }

        // =================================================
        // BUSINESS STAMP
        // =================================================

        if (user?.businessStamp) {
            try {
                const stampProps =
                    doc.getImageProperties(
                        user.businessStamp
                    );

                const maxStampWidth = 38;
                const maxStampHeight = 13;

                const scale = Math.min(
                    maxStampWidth /
                        stampProps.width,

                    maxStampHeight /
                        stampProps.height
                );

                const stampWidth =
                    stampProps.width *
                    scale;

                const stampHeight =
                    stampProps.height *
                    scale;

                const stampX =
                    signatureX +
                    43 +
                    (22 - stampWidth) /
                        2;

                const stampY =
                    signatureY + 13;

                doc.addImage(
                    user.businessStamp,
                    stampProps.fileType ||
                        "PNG",
                    stampX,
                    stampY,
                    stampWidth,
                    stampHeight
                );
            } catch (error) {
                console.error(
                    "Stamp PDF error:",
                    error
                );
            }
        }

        // =================================================
        // AUTHORIZED SIGNATORY
        // =================================================

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(8);
        doc.setTextColor(...gray);

        doc.text(
            "Authorized Signatory",
            signatureX + 21,
            signatureY + 31,
            {
                align: "center",
            }
        );

        // =================================================
        // FOOTER
        // =================================================

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(7);
        doc.setTextColor(...gray);

        doc.text(
            "Thank you for your business!",
            pageWidth / 2,
            pageHeight - 15,
            {
                align: "center",
            }
        );

        doc.text(
            "Generated by InvoicePro",
            pageWidth / 2,
            pageHeight - 11,
            {
                align: "center",
            }
        );

        // =================================================
        // SAVE
        // =================================================

        doc.save(
            `${
                invoice.invoiceNumber ||
                "invoice"
            }.pdf`
        );
    };

    // =====================================================
    // NO INVOICE
    // =====================================================

    if (!invoice) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">

                    <h2 className="text-xl font-semibold text-slate-700">
                        Invoice not found
                    </h2>

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className="mt-4 text-indigo-600 hover:underline"
                    >
                        Back to Dashboard
                    </button>

                </div>
            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4">

            {/* =================================================
                TOP BUTTONS
            ================================================= */}

            <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">

                <button
                    onClick={() =>
                        navigate("/dashboard")
                    }
                    className="text-indigo-600 hover:underline"
                >
                    ← Back to Dashboard
                </button>

                <button
                    onClick={generatePDF}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm"
                >
                    📄 Download PDF
                </button>

            </div>

            {/* =================================================
                INVOICE
            ================================================= */}

            <div className="max-w-5xl mx-auto bg-white shadow-sm rounded-2xl p-8 md:p-12">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div>

                    <div className="flex justify-between text-xs text-slate-500">

                        <span>
                            GSTIN:{" "}
                            {user?.gstin ||
                                "N/A"}
                        </span>

                        <span>
                            Mobile:{" "}
                            {user?.phone ||
                                "N/A"}
                        </span>

                    </div>

                    <h2 className="text-center text-2xl md:text-3xl font-bold text-slate-800 mt-5">
                        TAX INVOICE
                    </h2>

                    <h1 className="text-center text-3xl md:text-4xl font-bold text-indigo-600 mt-3">
                        {user?.businessName ||
                            "Business Name"}
                    </h1>

                    {user?.businessType && (
                        <p className="text-center font-semibold text-slate-700 mt-3">
                            {
                                user.businessType
                            }
                        </p>
                    )}

                    {user?.businessDescription && (
                        <p className="text-center text-sm text-slate-500 mt-1">
                            {
                                user.businessDescription
                            }
                        </p>
                    )}

                    {user?.businessAddress && (
                        <p className="text-center text-sm text-slate-600 whitespace-pre-line mt-2">
                            {
                                user.businessAddress
                            }
                        </p>
                    )}

                </div>

                <div className="border-b border-slate-200 mt-6"></div>

                {/* =================================================
                    INVOICE INFO + BILL TO
                ================================================= */}

                <div className="grid md:grid-cols-2 gap-8 mt-7">

                    {/* LEFT */}

                    <div>

                        <p className="text-xs uppercase tracking-wide text-slate-400">
                            Invoice Details
                        </p>

                        <p className="font-semibold text-slate-800 mt-3">
                            Invoice No:{" "}
                            <span className="font-normal">
                                {
                                    invoice.invoiceNumber
                                }
                            </span>
                        </p>

                        <p className="text-sm text-slate-500 mt-2">
                            Date:{" "}
                            {formatDate(
                                invoice.invoiceDate
                            )}
                        </p>

                        <p className="text-sm text-slate-500 mt-2">
                            Sale Type:{" "}
                            <span className="font-semibold text-slate-700">
                                {saleType}
                            </span>
                        </p>

                        {orderNo && (
                            <p className="text-sm text-slate-500 mt-2">
                                Order No:{" "}
                                <span className="font-semibold text-slate-700">
                                    {orderNo}
                                </span>
                            </p>
                        )}

                        {ewayBillNo && (
                            <p className="text-sm text-slate-500 mt-2">
                                E-Way Bill No:{" "}
                                <span className="font-semibold text-slate-700">
                                    {
                                        ewayBillNo
                                    }
                                </span>
                            </p>
                        )}

                    </div>

                    {/* RIGHT */}

                    <div className="md:border-l md:pl-8">

                        <p className="text-xs uppercase tracking-wide text-slate-400">
                            Bill To
                        </p>

                        <h3 className="text-lg font-semibold text-slate-800 mt-3">
                            {
                                invoice.customer
                                    ?.name ||
                                "-"
                            }
                        </h3>

                        {invoice.customer
                            ?.address && (
                            <p className="text-sm text-slate-500 mt-1 whitespace-pre-line">
                                {
                                    invoice.customer
                                        .address
                                }
                            </p>
                        )}

                        {invoice.customer
                            ?.gstin && (
                            <p className="text-sm text-slate-500 mt-2">
                                GSTIN:{" "}
                                {
                                    invoice
                                        .customer
                                        .gstin
                                }
                            </p>
                        )}

                        {invoice.customer
                            ?.phone && (
                            <p className="text-sm text-slate-500 mt-1">
                                Mobile:{" "}
                                {
                                    invoice
                                        .customer
                                        .phone
                                }
                            </p>
                        )}

                        {invoice.customer
                            ?.email && (
                            <p className="text-sm text-slate-500 mt-1">
                                Email:{" "}
                                {
                                    invoice
                                        .customer
                                        .email
                                }
                            </p>
                        )}

                    </div>

                </div>

                {/* =================================================
                    PRODUCTS TABLE
                ================================================= */}

                <div className="overflow-x-auto mt-8">

                    <table className="w-full text-left border-collapse">

                        <thead>

                            <tr className="bg-indigo-600 text-white text-sm">

                                <th className="px-4 py-3">
                                    S.No
                                </th>

                                <th className="px-4 py-3">
                                    Description
                                </th>

                                <th className="px-4 py-3">
                                    HSN
                                </th>

                                <th className="px-4 py-3">
                                    Qty
                                </th>

                                <th className="px-4 py-3">
                                    Unit
                                </th>

                                <th className="px-4 py-3">
                                    Rate
                                </th>

                                <th className="px-4 py-3">
                                    GST
                                </th>

                                <th className="px-4 py-3 text-right">
                                    Amount
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {items.map(
                                (item, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-slate-200"
                                    >

                                        <td className="px-4 py-4">
                                            {index + 1}
                                        </td>

                                        <td className="px-4 py-4 font-medium text-slate-800">
                                            {
                                                item.description
                                            }
                                        </td>

                                        <td className="px-4 py-4">
                                            {item.hsn ||
                                                "-"}
                                        </td>

                                        <td className="px-4 py-4">
                                            {
                                                item.quantity
                                            }
                                        </td>

                                        <td className="px-4 py-4">
                                            {item.unit ||
                                                "Piece"}
                                        </td>

                                        <td className="px-4 py-4">
                                            {formatCurrency(
                                                item.rate
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            {
                                                item.gstRate ||
                                                0
                                            }
                                            %
                                        </td>

                                        <td className="px-4 py-4 text-right font-semibold">
                                            {formatCurrency(
                                                item.amount ??
                                                    (
                                                        Number(
                                                            item.quantity
                                                        ) *
                                                        Number(
                                                            item.rate
                                                        )
                                                    )
                                            )}
                                        </td>

                                    </tr>
                                )
                            )}

                        </tbody>

                    </table>

                </div>

                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div className="flex justify-end mt-8">

                    <div className="w-full md:w-80 space-y-3">

                        <div className="flex justify-between text-sm">

                            <span className="text-slate-500">
                                Subtotal
                            </span>

                            <span className="font-medium">
                                {formatCurrency(
                                    subtotal
                                )}
                            </span>

                        </div>

                        <div className="flex justify-between text-sm">

                            <span className="text-slate-500">
                                CGST
                            </span>

                            <span>
                                {formatCurrency(
                                    cgst
                                )}
                            </span>

                        </div>

                        <div className="flex justify-between text-sm">

                            <span className="text-slate-500">
                                SGST
                            </span>

                            <span>
                                {formatCurrency(
                                    sgst
                                )}
                            </span>

                        </div>

                        <div className="border-t border-slate-300 pt-4 flex justify-between items-center">

                            <span className="text-lg font-bold text-slate-800">
                                Total
                            </span>

                            <span className="text-xl font-bold text-indigo-600">
                                {formatCurrency(
                                    total
                                )}
                            </span>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    AMOUNT IN WORDS
                ================================================= */}

                <div className="border-t border-slate-200 mt-8 pt-6">

                    <p className="text-sm font-semibold text-slate-700">
                        Amount in Words
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                        {numberToWords(
                            total
                        )}
                    </p>

                </div>

                {/* =================================================
                    TERMS & CONDITIONS
                ================================================= */}

                {termsAndConditions
                    ?.trim() && (
                    <div className="border-t border-slate-200 mt-8 pt-6">

                        <p className="font-semibold text-slate-700">
                            Terms & Conditions
                        </p>

                        <p className="text-sm text-slate-500 mt-3 whitespace-pre-line">
                            {
                                termsAndConditions
                            }
                        </p>

                    </div>
                )}

                {/* =================================================
                    SIGNATURE
                ================================================= */}

                <div className="flex justify-end mt-10">

                    <div className="w-64 text-center">

                        <div className="border-t border-slate-400 pt-2 text-sm text-slate-600">
                            Receiver Signature
                        </div>

                        <div className="mt-6 font-semibold text-slate-700">
                            For{" "}
                            {user?.businessName ||
                                "Business Name"}
                        </div>

                        {/* Reduced height */}
                        <div className="flex items-center justify-center gap-2 h-16 mt-1">

                            {user?.signature && (
                                <img
                                    src={
                                        user.signature
                                    }
                                    alt="Authorized Signature"
                                    className="max-h-14 max-w-36 object-contain"
                                />
                            )}

                            {user?.businessStamp && (
                                <img
                                    src={
                                        user.businessStamp
                                    }
                                    alt="Business Stamp"
                                    className="max-h-14 max-w-20 object-contain"
                                />
                            )}

                        </div>

                        <div className="border-t border-slate-400 pt-2 text-sm text-slate-600">
                            Authorized Signatory
                        </div>

                    </div>

                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="border-t border-slate-200 mt-8 pt-5 text-center">

                    <p className="text-sm text-slate-400">
                        Thank you for your business!
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                        Generated by InvoicePro
                    </p>

                </div>

            </div>
        </div>
    );
}

export default InvoicePreview;