import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "../lib/api";

// Icons
const HomeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.71 3.38 2 2 0 0 1 3.68 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const PAYMENT_METHODS = [
  { id: "upi",     label: "UPI",           icon: "📲", sub: "Google Pay, PhonePe, Paytm" },
  { id: "card",    label: "Credit/Debit Card", icon: "💳", sub: "Visa, Mastercard, Rupay" },
  { id: "netbank", label: "Net Banking",   icon: "🏦", sub: "All major banks supported" },
  { id: "cod",     label: "Cash on Delivery", icon: "💵", sub: "Pay when you receive" },
];

export default function Checkout() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "", address_line: "", city: "", state: "", pincode: "", phone: "",
  });
  const [payment, setPayment] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    const token = typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    api.get("/api/cart/").then((r) => {
      const items = r.data?.items || [];
      const total = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
      setCartTotal(total);
      setItemCount(items.length);
    }).catch(() => {});
  }, [router]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/orders/", { shipping_address: form });
      setOrderId(res.data.order_id);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to place order. Please try again.");
    }
    setLoading(false);
  };

  const shipping = cartTotal >= 499 ? 0 : 49;
  const total = cartTotal + shipping;

  if (success) {
    return (
      <>
        <Head><title>Order Placed — ShopKart</title></Head>
        <div style={{ background: "var(--bg)", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
          <div style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "48px 40px",
            textAlign: "center",
            maxWidth: 440,
            width: "100%",
            boxShadow: "var(--shadow-md)",
          }}>
            <div style={{
              width: 72, height: 72,
              borderRadius: "50%",
              background: "var(--accent-light)",
              border: "3px solid var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              color: "var(--accent)",
            }}>
              <CheckIcon />
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
              Order Placed Successfully!
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 16 }}>
              Your order #{orderId} has been confirmed. You&apos;ll receive an email confirmation shortly.
            </p>
            <div style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "12px 16px",
              marginBottom: 24,
              fontSize: 13.5,
              color: "var(--text-2)",
            }}>
              🚚 Expected delivery: <strong>2–4 business days</strong>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/products" className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }}>
                Continue Shopping
              </Link>
              <Link href="/" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout — ShopKart</title>
        <meta name="description" content="Complete your purchase securely on ShopKart." />
      </Head>

      <div style={{ background: "var(--bg)", padding: "16px 0 40px" }}>
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <Link href="/cart">Cart</Link>
            <span>›</span>
            <span>Checkout</span>
          </nav>

          {/* Security bar */}
          <div style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 16px",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: "var(--text-2)",
            boxShadow: "var(--shadow-sm)",
          }}>
            🔒
            <span><strong>Safe and Secure Checkout</strong> — 100% encrypted payments</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              {["Visa", "Mastercard", "UPI"].map((p) => (
                <span key={p} className="footer-payment-badge" style={{ background: "var(--bg-3)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
                  {p}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="checkout-layout">
              {/* Left: Steps */}
              <div>
                {/* Step 1: Login check */}
                <div className="checkout-panel">
                  <div className="checkout-panel-header">
                    <div className="checkout-step-num">1</div>
                    Login or Signup
                    <span style={{ marginLeft: "auto", color: "var(--accent)", fontSize: 13, fontWeight: 600 }}>✓ Done</span>
                  </div>
                </div>

                {/* Step 2: Delivery Address */}
                <div className="checkout-panel">
                  <div className="checkout-panel-header">
                    <div className="checkout-step-num">2</div>
                    Delivery Address
                  </div>
                  <div className="checkout-panel-body">
                    {error && (
                      <div className="form-error" style={{ marginBottom: 16 }}>
                        <AlertIcon /> {error}
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
                      {/* Full name */}
                      <div className="form-group" style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
                        <label className="form-label" htmlFor="full_name">Full Name</label>
                        <div className="form-input-wrap">
                          <input id="full_name" type="text" className="form-input no-icon" placeholder="Jane Doe"
                            value={form.full_name} onChange={set("full_name")} required />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="phone">Mobile Number</label>
                        <div className="form-input-wrap">
                          <span className="form-input-icon"><PhoneIcon /></span>
                          <input id="phone" type="tel" className="form-input" placeholder="+91 98765 43210"
                            value={form.phone} onChange={set("phone")} required />
                        </div>
                      </div>

                      {/* Pincode */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="pincode">Pincode</label>
                        <div className="form-input-wrap">
                          <input id="pincode" type="text" className="form-input no-icon" placeholder="400001"
                            value={form.pincode} onChange={set("pincode")} required maxLength={6} />
                        </div>
                      </div>

                      {/* Address */}
                      <div className="form-group" style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
                        <label className="form-label" htmlFor="address_line">Address (House No, Street, Area)</label>
                        <div className="form-input-wrap">
                          <span className="form-input-icon"><HomeIcon /></span>
                          <input id="address_line" type="text" className="form-input" placeholder="12, MG Road, Bandra West"
                            value={form.address_line} onChange={set("address_line")} required />
                        </div>
                      </div>

                      {/* City */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="city">City</label>
                        <input id="city" type="text" className="form-input no-icon" placeholder="Mumbai"
                          value={form.city} onChange={set("city")} required />
                      </div>

                      {/* State */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="state">State</label>
                        <input id="state" type="text" className="form-input no-icon" placeholder="Maharashtra"
                          value={form.state} onChange={set("state")} required />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Payment */}
                <div className="checkout-panel">
                  <div className="checkout-panel-header">
                    <div className="checkout-step-num">3</div>
                    Payment Options
                  </div>
                  <div className="checkout-panel-body">
                    {PAYMENT_METHODS.map((m) => (
                      <label
                        key={m.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "14px 16px",
                          border: `1.5px solid ${payment === m.id ? "var(--primary)" : "var(--border)"}`,
                          borderRadius: "var(--radius-sm)",
                          marginBottom: 8,
                          cursor: "pointer",
                          background: payment === m.id ? "var(--primary-light)" : "#fff",
                          transition: "all var(--t)",
                        }}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={m.id}
                          checked={payment === m.id}
                          onChange={() => setPayment(m.id)}
                          style={{ accentColor: "var(--primary)" }}
                        />
                        <span style={{ fontSize: "1.2rem" }}>{m.icon}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{m.label}</div>
                          <div style={{ fontSize: 12, color: "var(--text-3)" }}>{m.sub}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Order Summary */}
              <div>
                <div className="cart-summary-panel">
                  <div className="cart-summary-header">Price Details</div>
                  <div className="cart-summary-body">
                    <div className="cart-summary-row">
                      <span>Price ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
                      <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="cart-summary-row">
                      <span>Delivery Charges</span>
                      <span style={{ color: shipping === 0 ? "var(--accent)" : undefined, fontWeight: 600 }}>
                        {shipping === 0 ? "FREE" : `₹${shipping}`}
                      </span>
                    </div>

                    <div className="cart-summary-total">
                      <span className="label">Total Amount</span>
                      <span className="value">₹{total.toLocaleString("en-IN")}</span>
                    </div>

                    {shipping === 0 && (
                      <div className="cart-savings-tag">
                        🎉 You are saving ₹49 on this order!
                      </div>
                    )}

                    <button
                      id="place-order-btn"
                      type="submit"
                      className="btn btn-secondary btn-block btn-lg"
                      disabled={loading}
                      style={{ marginTop: 4 }}
                    >
                      {loading ? (
                        <><div className="spinner" /> Placing Order…</>
                      ) : (
                        "Place Order →"
                      )}
                    </button>

                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: 6, fontSize: 11.5, color: "var(--text-3)", marginTop: 12,
                    }}>
                      🔒 Safe and Secure Payments. 100% Authentic products.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
