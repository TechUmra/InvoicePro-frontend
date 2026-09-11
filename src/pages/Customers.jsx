import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Customers() {
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        gstin: "",
        panNumber: "",
        notes: "",
    });

    // =====================================================
    // FETCH CUSTOMERS
    // =====================================================

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await API.get("/customers");
            setCustomers(response.data.customers || []);
        } catch (error) {
            console.error("Error fetching customers:", error);
            alert("Failed to load customers");
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // HANDLE FORM CHANGE
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =====================================================
    // SUBMIT FORM
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.phone) {
            alert("Name and phone are required");
            return;
        }

        try {
            setSaving(true);

            if (editingId) {
                await API.put(
                    `/customers/${editingId}`,
                    formData
                );
                alert("Customer updated successfully");
            } else {
                await API.post("/customers", formData);
                alert("Customer added successfully");
            }

            setFormData({
                name: "",
                email: "",
                phone: "",
                address: "",
                city: "",
                state: "",
                gstin: "",
                panNumber: "",
                notes: "",
            });

            setEditingId(null);
            setShowForm(false);
            fetchCustomers();
        } catch (error) {
            console.error("Error saving customer:", error);
            alert(
                error.response?.data?.message ||
                    "Error saving customer"
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // EDIT CUSTOMER
    // =====================================================

    const handleEdit = (customer) => {
        setFormData(customer);
        setEditingId(customer._id);
        setShowForm(true);
    };

    // =====================================================
    // DELETE CUSTOMER
    // =====================================================

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this customer?")) {
            return;
        }

        try {
            await API.delete(`/customers/${id}`);
            alert("Customer deleted");
            fetchCustomers();
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Error deleting customer");
        }
    };

    // =====================================================
    // FILTER CUSTOMERS
    // =====================================================

    const filteredCustomers = customers.filter(
        (c) =>
            c.name
                .toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                ) ||
            c.phone.includes(searchTerm) ||
            c.email
                .toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                )
    );

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
                            👥 Customers
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Manage your customers
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

                {/* SEARCH BAR */}

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by name, phone, or email..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* ADD BUTTON */}

                {!showForm && (
                    <button
                        onClick={() => {
                            setShowForm(true);
                            setFormData({
                                name: "",
                                email: "",
                                phone: "",
                                address: "",
                                city: "",
                                state: "",
                                gstin: "",
                                panNumber: "",
                                notes: "",
                            });
                            setEditingId(null);
                        }}
                        className="mb-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium"
                    >
                        + Add Customer
                    </button>
                )}

                {/* ADD/EDIT FORM */}

                {showForm && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-6">
                            {editingId
                                ? "Edit Customer"
                                : "Add New Customer"}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            formData.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Customer name"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Phone *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Phone number"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Email"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={
                                            formData.city
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="City"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={
                                            formData.state
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="State"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        GSTIN
                                    </label>
                                    <input
                                        type="text"
                                        name="gstin"
                                        value={
                                            formData.gstin
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="GSTIN"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        PAN Number
                                    </label>
                                    <input
                                        type="text"
                                        name="panNumber"
                                        value={
                                            formData.panNumber
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="PAN"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={
                                            formData.address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Address"
                                        rows="3"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={
                                            formData.notes
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Additional notes"
                                        rows="2"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-60"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingId
                                        ? "Update"
                                        : "Add"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                    }}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* CUSTOMERS LIST */}

                {loading ? (
                    <p className="text-center text-slate-500">
                        Loading...
                    </p>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-slate-500">
                            No customers yet
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-700">
                                            Name
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">
                                            Phone
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">
                                            Email
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">
                                            City
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">
                                            GSTIN
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredCustomers.map(
                                        (customer) => (
                                            <tr
                                                key={
                                                    customer._id
                                                }
                                                className="border-b border-slate-200 hover:bg-slate-50"
                                            >
                                                <td className="px-6 py-4 font-medium">
                                                    {
                                                        customer.name
                                                    }
                                                </td>
                                                <td className="px-6 py-4">
                                                    {
                                                        customer.phone
                                                    }
                                                </td>
                                                <td className="px-6 py-4">
                                                    {customer.email ||
                                                        "-"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {customer.city ||
                                                        "-"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {customer.gstin ||
                                                        "-"}
                                                </td>
                                                <td className="px-6 py-4 space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(
                                                                customer
                                                            )
                                                        }
                                                        className="text-indigo-600 hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                customer._id
                                                            )
                                                        }
                                                        className="text-red-600 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Customers;
