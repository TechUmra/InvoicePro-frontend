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

            // Save JWT token
            localStorage.setItem("token", response.data.token);

            // Save user information
            const loggedInUser = response.data.user;

localStorage.setItem(
    "user",
    JSON.stringify(loggedInUser)
);

            setMessage("Login successful! 🎉");
            navigate("/dashboard");

            console.log("Logged in user:", response.data.user);
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
        <div>
            <h1>Welcome Back</h1>

            {message && <p>{message}</p>}
            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}

export default Login;