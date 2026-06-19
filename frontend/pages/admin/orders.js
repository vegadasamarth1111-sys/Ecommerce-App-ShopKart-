import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../lib/api";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("role") !== "admin") { router.push("/login"); return; }
    api.get("/api/admin/orders").then((r) => setOrders(r.data));
  }, [router]);

  const updateStatus = async (id, status) => {
    await api.put(`/api/admin/orders/${id}/status?status=${status}`);
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  };

  const badgeClass = { pending: "badge-pending", shipped: "badge-shipped", delivered: "badge-delivered", cancelled: "badge-cancelled" };

  return (
    <>
      <Head><title>Orders — Admin</title></Head>
      <div className="d-flex">
        <AdminSidebar />
        <main className="flex-grow-1 p-4">
          <h1 className="section-title mb-4">All Orders</h1>
          <div className="card border-0 shadow-sm">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Items</th>
                  <th>Total</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="font-monospace small">{o.id.slice(-8)}</td>
                    <td>
                      <div className="fw-semibold">{o.shipping_address?.full_name}</div>
                      <div className="small text-muted">{o.shipping_address?.city}</div>
                    </td>
                    <td className="small">{o.items?.length} item(s)</td>
                    <td>₹{o.total_amount?.toFixed(2)}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        style={{ minWidth: 120 }}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="small text-muted">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted py-3">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
}
