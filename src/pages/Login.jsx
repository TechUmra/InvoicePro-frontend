import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await API.post("/auth/login", formData);

            localStorage.setItem("token", response.data.token);

            const loggedInUser = response.data.user;

            localStorage.setItem(
                "user",
                JSON.stringify(loggedInUser)
            );

            setMessage("Login successful! 🎉");

            navigate("/dashboard");

            console.log(
                "Logged in user:",
                response.data.user
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                background:
                    "linear-gradient(135deg, #f5f3ff 0%, #eef2ff 50%, #f8fafc 100%)",
                fontFamily:
                    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "440px",
                }}
            >
                {/* Brand */}
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "28px",
                    }}
                >
                    <div
                        style={{
                            width: "54px",
                            height: "54px",
                            margin: "0 auto 14px",
                            borderRadius: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                                "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            color: "white",
                            fontSize: "24px",
                            fontWeight: "800",
                            boxShadow:
                                "0 12px 30px rgba(99,102,241,0.25)",
                        }}
                    >
                        ₹
                    </div>

                    <h1
                        style={{
                            margin: 0,
                            fontSize: "30px",
                            fontWeight: "800",
                            color: "#111827",
                            letterSpacing: "-0.8px",
                        }}
                    >
                        InvoicePro
                    </h1>

                    <p
                        style={{
                            marginTop: "8px",
                            marginBottom: 0,
                            color: "#6b7280",
                            fontSize: "14px",
                        }}
                    >
                        Smart invoicing made simple
                    </p>
                </div>

                {/* Card */}
                <div
                    style={{
                        background: "rgba(255,255,255,0.96)",
                        border: "1px solid rgba(229,231,235,0.9)",
                        borderRadius: "24px",
                        padding: "36px",
                        boxShadow:
                            "0 24px 60px rgba(15,23,42,0.10)",
                    }}
                >
                    <div style={{ marginBottom: "26px" }}>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: "24px",
                                fontWeight: "750",
                                color: "#111827",
                            }}
                        >
                            Welcome back 👋
                        </h2>

                        <p
                            style={{
                                marginTop: "8px",
                                marginBottom: 0,
                                color: "#6b7280",
                                fontSize: "14px",
                            }}
                        >
                            Login to continue to your InvoicePro account
                        </p>
                    </div>

                    {/* Success */}
                    {message && (
                        <div
                            style={{
                                padding: "12px 14px",
                                marginBottom: "18px",
                                borderRadius: "12px",
                                background: "#ecfdf5",
                                color: "#047857",
                                fontSize: "14px",
                                border: "1px solid #a7f3d0",
                            }}
                        >
                            {message}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div
                            style={{
                                padding: "12px 14px",
                                marginBottom: "18px",
                                borderRadius: "12px",
                                background: "#fef2f2",
                                color: "#dc2626",
                                fontSize: "14px",
                                border: "1px solid #fecaca",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: "18px" }}>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    fontSize: "13px",
                                    fontWeight: "650",
                                    color: "#374151",
                                }}
                            >
                                Email address
                            </label>

                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "13px 14px",
                                    borderRadius: "12px",
                                    border: "1px solid #d1d5db",
                                    outline: "none",
                                    fontSize: "14px",
                                    color: "#111827",
                                    background: "#fff",
                                }}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: "24px" }}>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    fontSize: "13px",
                                    fontWeight: "650",
                                    color: "#374151",
                                }}
                            >
                                Password
                            </label>

                            <div
                                style={{
                                    position: "relative",
                                }}
                            >
                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        padding: "13px 48px 13px 14px",
                                        borderRadius: "12px",
                                        border: "1px solid #d1d5db",
                                        outline: "none",
                                        fontSize: "14px",
                                        color: "#111827",
                                        background: "#fff",
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "50%",
                                        transform:
                                            "translateY(-50%)",
                                        border: "none",
                                        background: "transparent",
                                        cursor: "pointer",
                                        color: "#6b7280",
                                        fontSize: "13px",
                                        padding: "6px",
                                    }}
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>
                            </div>
                        </div>

                        {/* Login */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                border: "none",
                                borderRadius: "12px",
                                padding: "14px",
                                background:
                                    loading
                                        ? "#9ca3af"
                                        : "linear-gradient(135deg, #6366f1, #7c3aed)",
                                color: "#fff",
                                fontSize: "15px",
                                fontWeight: "700",
                                cursor: loading
                                    ? "not-allowed"
                                    : "pointer",
                                boxShadow:
                                    loading
                                        ? "none"
                                        : "0 10px 24px rgba(99,102,241,0.25)",
                            }}
                        >
                            {loading
                                ? "Logging in..."
                                : "Login to InvoicePro →"}
                        </button>
                    </form>

                    {/* Signup */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            margin: "26px 0 20px",
                            color: "#9ca3af",
                            fontSize: "12px",
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                height: "1px",
                                background: "#e5e7eb",
                            }}
                        />

                        OR

                        <div
                            style={{
                                flex: 1,
                                height: "1px",
                                background: "#e5e7eb",
                            }}
                        />
                    </div>

                    <p
                        style={{
                            margin: 0,
                            textAlign: "center",
                            color: "#6b7280",
                            fontSize: "14px",
                        }}
                    >
                        Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/signup")
                            }
                            style={{
                                border: "none",
                                background: "transparent",
                                color: "#6366f1",
                                fontWeight: "700",
                                cursor: "pointer",
                                fontSize: "14px",
                                padding: 0,
                            }}
                        >
                            Create an account
                        </button>
                    </p>
                </div>

                {/* Footer */}
                <p
                    style={{
                        textAlign: "center",
                        marginTop: "22px",
                        color: "#9ca3af",
                        fontSize: "12px",
                    }}
                >
                    © 2026 InvoicePro · Secure & simple invoicing
                </p>
            </div>
        </div>
    );
}

export default Login;