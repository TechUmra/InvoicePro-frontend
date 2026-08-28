import { useNavigate } from "react-router-dom";

function LogoutButton() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Remove current user's authentication
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Go back to login
        navigate("/login", { replace: true });
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-medium"
        >
            Logout
        </button>
    );
}

export default LogoutButton;