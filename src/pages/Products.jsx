import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Products() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        hsn: "",
        sac: "",
        rate: "",
        unit: "Pcs",
        gstRate: "",
        category: "",
        skuCode: "",
        notes: "",
    });

    // =====================================================
    // FETCH PRODUCTS
    // =====================================================

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await API.get("/products");
            setProducts(response.data.products || []);
        } catch (error) {
            console.error("Error fetching products:", error);
            alert("Failed to load products");
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

        if (
            !formData.name ||
            !formData.hsn ||
            !formData.rate ||
            formData.gstRate === ""
        ) {
            alert("Name, HSN, rate, and GST rate are required");
            return;
        }

        try {
            setSaving(true);

            const data = {
                ...formData,
                rate: Number(formData.rate),
                gstRate: Number(formData.gstRate),
            };

            if (editingId) {
                await API.put(
                    `/products/${editingId}`,
                    data
                );
                alert("Product updated successfully");
            } else {
                await API.post("/products", data);
                alert("Product added successfully");
            }

            setFormData({
                name: "",
                description: "",
                hsn: "",
                sac: "",
                rate: "",
                unit: "Pcs",
                gstRate: "",
                category: "",
                skuCode: "",
                notes: "",
            });

            setEditingId(null);
            setShowForm(false);
            fetchProducts();
        } catch (error) {
            console.error("Error saving product:", error);
            alert(
                error.response?.data?.message ||
                    "Error saving product"
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // EDIT PRODUCT
    // =====================================================

    const handleEdit = (product) => {
        setFormData(product);
        setEditingId(product._id);
        setShowForm(true);
    };

    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this product?")) {
            return;
        }

        try {
            await API.delete(`/products/${id}`);
            alert("Product deleted");
            fetchProducts();
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Error deleting product");
        }
    };

    // =====================================================
    // FILTER PRODUCTS
    // =====================================================

    const filteredProducts = products.filter(
        (p) =>
            p.name
                .toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                ) ||
            p.hsn.includes(searchTerm) ||
            p.category
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
                            📦 Products
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Manage your product catalog
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
                        placeholder="Search by name, HSN, or category..."
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
                                description: "",
                                hsn: "",
                                sac: "",
                                rate: "",
                                unit: "Pcs",
                                gstRate: "",
                                category: "",
                                skuCode: "",
                                notes: "",
                            });
                            setEditingId(null);
                        }}
                        className="mb-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium"
                    >
                        + Add Product
                    </button>
                )}

                {/* ADD/EDIT FORM */}

                {showForm && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-6">
                            {editingId
                                ? "Edit Product"
                                : "Add New Product"}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Product Name *
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
                                        placeholder="Product name"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        HSN Code *
                                    </label>
                                    <input
                                        type="text"
                                        name="hsn"
                                        value={
                                            formData.hsn
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="HSN code"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Rate *
                                    </label>
                                    <input
                                        type="number"
                                        name="rate"
                                        value={
                                            formData.rate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Rate"
                                        step="0.01"
                                        min="0"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        GST Rate % *
                                    </label>
                                    <select
                                        name="gstRate"
                                        value={
                                            formData.gstRate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">
                                            Select GST Rate
                                        </option>
                                        <option value="0">
                                            0%
                                        </option>
                                        <option value="5">
                                            5%
                                        </option>
                                        <option value="12">
                                            12%
                                        </option>
                                        <option value="18">
                                            18%
                                        </option>
                                        <option value="28">
                                            28%
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Unit
                                    </label>
                                    <select
                                        name="unit"
                                        value={
                                            formData.unit
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Pcs">
                                            Pcs
                                        </option>
                                        <option value="Box">
                                            Box
                                        </option>
                                        <option value="Bag">
                                            Bag
                                        </option>
                                        <option value="kg">
                                            kg
                                        </option>
                                        <option value="liter">
                                            Liter
                                        </option>
                                        <option value="meter">
                                            Meter
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={
                                            formData.category
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Category"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        SKU Code
                                    </label>
                                    <input
                                        type="text"
                                        name="skuCode"
                                        value={
                                            formData.skuCode
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="SKU"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={
                                            formData.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Description"
                                        rows="2"
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

                {/* PRODUCTS LIST */}

                {loading ? (
                    <p className="text-center text-slate-500">
                        Loading...
                    </p>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-slate-500">
                            No products yet
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-700">
                                            Product Name
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">
                                            HSN
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">
                                            Rate
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">
                                            GST%
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">
                                            Unit
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">
                                            Category
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredProducts.map(
                                        (product) => (
                                            <tr
                                                key={
                                                    product._id
                                                }
                                                className="border-b border-slate-200 hover:bg-slate-50"
                                            >
                                                <td className="px-6 py-4 font-medium">
                                                    {
                                                        product.name
                                                    }
                                                </td>
                                                <td className="px-6 py-4">
                                                    {
                                                        product.hsn
                                                    }
                                                </td>
                                                <td className="px-6 py-4">
                                                    ₹
                                                    {product.rate.toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {
                                                        product.gstRate
                                                    }
                                                    %
                                                </td>
                                                <td className="px-6 py-4">
                                                    {
                                                        product.unit
                                                    }
                                                </td>
                                                <td className="px-6 py-4">
                                                    {product.category ||
                                                        "-"}
                                                </td>
                                                <td className="px-6 py-4 space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(
                                                                product
                                                            )
                                                        }
                                                        className="text-indigo-600 hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                product._id
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

export default Products;
