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

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =========================
                    DEFAULT ROUTE
                ========================= */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
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