import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import api from "../lib/api";

export default function Checkout() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "", address_line: "", city: "", state: "", pincode: "", phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await api.post("/api/orders/", { shipping_address: form });
      alert(`Order placed! ID: ${res.data.order_id}`);
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to place order.");
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Checkout — ShopKart</title>
      </Head>
      <div className="form-card">
        <h2>Shipping Details</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          {[
            ["full_name",    "Full Name",     "text"],
            ["address_line", "Address",       "text"],
            ["city",         "City",          "text"],
            ["state",        "State",         "text"],
            ["pincode",      "Pincode",       "text"],
            ["phone",        "Phone",         "tel"],
          ].map(([key, label, type]) => (
            <div className="mb-3" key={key}>
              <label className="form-label fw-semibold">{label}</label>
              <input
                id={`checkout-${key}`}
                type={type}
                className="form-control"
                value={form[key]}
                onChange={set(key)}
                required
              />
            </div>
          ))}
          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold mt-2"
            disabled={loading}
          >
            {loading ? "Placing order…" : "Place Order"}
          </button>
        </form>
      </div>
    </>
  );
}
