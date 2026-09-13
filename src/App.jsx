import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateInvoice from "./pages/CreateInvoice";
import InvoicePreview from "./pages/InvoicePreview";
import BusinessProfile from "./pages/BusinessProfile";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Analytics from "./pages/Analytics";
import AIAssistant from "./pages/AIAssistant";
import Invoices from "./pages/Invoices";

import ProtectedRoute from "./components/ProtectedRoute";
import UpdateChecker from "./components/UpdateChecker";

function App() {
    return (
        <BrowserRouter>

            <UpdateChecker />

            <Routes>

                {/* =========================
                    DEFAULT ROUTE
                ========================= */}

                <Route
    path="/"
    element={
        localStorage.getItem("token") ? (
            <Navigate to="/dashboard" replace />
        ) : (
            <Navigate to="/login" replace />
        )
    }
/>

                {/* =========================
                    PUBLIC ROUTES
                ========================= */}

                <Route
                    path="/signup"
                    element={<Signup />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* =========================
                    PROTECTED ROUTES
                    LOGIN REQUIRED
                ========================= */}

                <Route element={<ProtectedRoute />}>

                    {/* Dashboard */}

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    {/* Invoices */}

                    <Route
                        path="/invoices"
                        element={<Invoices />}
                    />

                    {/* Customers */}

                    <Route
                        path="/customers"
                        element={<Customers />}
                    />

                    {/* Products */}

                    <Route
                        path="/products"
                        element={<Products />}
                    />

                    {/* Analytics */}

                    <Route
                        path="/analytics"
                        element={<Analytics />}
                    />

                    {/* AI Assistant */}

                    <Route
                        path="/ai-assistant"
                        element={<AIAssistant />}
                    />

                    {/* Business Profile */}

                    <Route
                        path="/business-profile"
                        element={<BusinessProfile />}
                    />

                    {/* Create Invoice */}

                    <Route
                        path="/create-invoice"
                        element={<CreateInvoice />}
                    />

                    {/* Invoice Preview */}

                    <Route
                        path="/invoice-preview"
                        element={<InvoicePreview />}
                    />

                </Route>

                {/* =========================
                    UNKNOWN ROUTE
                ========================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;