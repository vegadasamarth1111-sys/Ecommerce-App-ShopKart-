import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../lib/api";

const emptyForm = { name: "", description: "", price: "", stock_qty: "", category_id: "", image_url: "" };

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("role") !== "admin") { router.push("/login"); return; }
    fetchAll();
  }, [router]);

  const fetchAll = async () => {
    const [p, c] = await Promise.all([api.get("/api/products/?limit=100"), api.get("/api/admin/categories")]);
    setProducts(p.data); setCategories(c.data);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const startEdit = (p) => {
    setForm({ ...p, price: String(p.price), stock_qty: String(p.stock_qty) });
    setEditing(p.id); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = { ...form, price: parseFloat(form.price), stock_qty: parseInt(form.stock_qty) };
    if (editing) {
      await api.put(`/api/admin/products/${editing}`, body);
    } else {
      await api.post("/api/admin/products", body);
    }
    setForm(emptyForm); setEditing(null); setShowForm(false);
    fetchAll();
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/api/admin/products/${id}`);
    fetchAll();
  };

  return (
    <>
      <Head><title>Products — Admin</title></Head>
      <div className="d-flex">
        <AdminSidebar />
        <main className="flex-grow-1 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="section-title mb-0">Products</h1>
            <button className="btn btn-primary btn-sm" onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }}>
              + Add Product
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="card border-0 shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-3">{editing ? "Edit Product" : "New Product"}</h5>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {[["name","Name","text"],["description","Description","text"],
                    ["price","Price","number"],["stock_qty","Stock","number"],["image_url","Image URL","url"]].map(([k,l,t])=>(
                    <div className="col-md-6" key={k}>
                      <label className="form-label fw-semibold small">{l}</label>
                      <input type={t} className="form-control" value={form[k]} onChange={set(k)}
                        required={k !== "image_url"} step={k === "price" ? "0.01" : undefined} />
                    </div>
                  ))}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Category</label>
                    <select className="form-select" value={form.category_id} onChange={set("category_id")} required>
                      <option value="">Select category…</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-primary btn-sm">Save</button>
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div className="card border-0 shadow-sm">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-semibold">{p.name}</td>
                    <td>₹{p.price.toFixed(2)}</td>
                    <td>{p.stock_qty}</td>
                    <td>
                      <button className="btn btn-outline-primary btn-sm me-2" onClick={() => startEdit(p)}>Edit</button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => deleteProduct(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-muted py-3">No products yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
}
