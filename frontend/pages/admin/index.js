import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") { router.push("/login"); return; }
    Promise.all([
      api.get("/api/admin/stats"),
      api.get("/api/admin/orders"),
    ]).then(([s, o]) => { setStats(s.data); setOrders(o.data.slice(0, 5)); });
  }, [router]);

  const statusBadge = (s) => {
    const map = { pending: "badge-pending", shipped: "badge-shipped", delivered: "badge-delivered", cancelled: "badge-cancelled" };
    return <span className={`badge-status ${map[s] || ""}`}>{s}</span>;
  };

  return (
    <>
      <Head><title>Admin Dashboard — ShopKart</title></Head>
      <div className="d-flex">
        <AdminSidebar />
        <main className="flex-grow-1 p-4">
          <h1 className="section-title mb-4">Dashboard</h1>

          {/* Stat cards */}
          {stats && (
            <div className="row g-3 mb-4">
              {[
                { label: "Orders Today",    value: stats.today_orders },
                { label: "Total Orders",    value: stats.total_orders },
                { label: "Total Revenue",   value: `₹${stats.total_revenue.toFixed(2)}` },
                { label: "Total Products",  value: stats.total_products },
              ].map((s) => (
                <div key={s.label} className="col-6 col-md-3">
                  <div className="stat-card">
                    <div className="label">{s.label}</div>
                    <div className="value">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent orders */}
          <h2 className="section-title">Recent Orders</h2>
          <div className="card border-0 shadow-sm">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="font-monospace small">{o.id.slice(-8)}</td>
                    <td>{o.shipping_address?.full_name || "—"}</td>
                    <td>₹{o.total_amount.toFixed(2)}</td>
                    <td>{statusBadge(o.status)}</td>
                    <td className="small text-muted">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-muted py-3">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
}
