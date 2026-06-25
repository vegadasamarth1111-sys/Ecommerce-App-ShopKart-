import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import CartItem from "../components/CartItem";
import { useToast } from "../lib/toast";
import api from "../lib/api";

export default function Cart() {
  const router = useRouter();
  const addToast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const fetchCart = useCallback(async () => {
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      router.push("/login");
      return;
    }
    try {
      const res = await api.get("/api/cart/");
      setItems(res.data?.items || []);
    } catch {}
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const subtotal  = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  const shipping  = subtotal >= 499 ? 0 : 49;
  const discount  = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total     = subtotal - discount + shipping;
  const savings   = discount + (subtotal >= 499 ? 49 : 0);

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "SAVE10") {
      setCouponApplied(true);
      addToast("Coupon applied! 10% off 🎉", "success");
    } else {
      addToast("Invalid coupon code.", "error");
    }
  };

  return (
    <>
      <Head>
        <title>My Cart — ShopKart</title>
        <meta name="description" content="Review your cart and proceed to checkout on ShopKart." />
      </Head>

      <div className="cart-page">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <span>Shopping Cart</span>
          </nav>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-ring" />
              <span>Loading your cart…</span>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state" style={{ maxWidth: 500, margin: "40px auto" }}>
              <span className="empty-state-icon">🛒</span>
              <h3>Your cart is empty!</h3>
              <p>Add items to it now.</p>
              <Link href="/products" className="btn btn-primary" style={{ marginTop: 16 }}>
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              {/* Left: Items */}
              <div>
                {/* Delivery address strip */}
                <div style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 20px",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  color: "var(--text-2)",
                  boxShadow: "var(--shadow-sm)",
                }}>
                  <span style={{ fontSize: "1rem" }}>📍</span>
                  <span>Deliver to: <strong style={{ color: "var(--text)" }}>India</strong></span>
                  <button className="btn btn-outline btn-sm" style={{ marginLeft: "auto" }}>Change</button>
                </div>

                <div className="cart-items-panel">
                  <div className="cart-items-header">
                    <span className="cart-items-title">
                      My Cart ({items.length} item{items.length !== 1 ? "s" : ""})
                    </span>
                    {subtotal >= 499 ? (
                      <span className="tag tag-green">✓ Free delivery eligible</span>
                    ) : (
                      <span className="tag tag-orange">Add ₹{(499 - subtotal).toLocaleString("en-IN")} for FREE delivery</span>
                    )}
                  </div>

                  {items.map((item) => (
                    <CartItem
                      key={item.id || item.product_id}
                      item={item}
                      onUpdate={fetchCart}
                    />
                  ))}

                  {/* Place order (bottom of items on mobile) */}
                  <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <Link href="/products" style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600, alignSelf: "center" }}>
                      ← Continue Shopping
                    </Link>
                    <button
                      className="btn btn-secondary btn-lg"
                      onClick={() => router.push("/checkout")}
                    >
                      Place Order →
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Summary */}
              <div>
                <div className="cart-summary-panel">
                  <div className="cart-summary-header">Price Details</div>
                  <div className="cart-summary-body">
                    <div className="cart-summary-row">
                      <span>Price ({items.length} item{items.length !== 1 ? "s" : ""})</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    {discount > 0 && (
                      <div className="cart-summary-row" style={{ color: "var(--accent)" }}>
                        <span>Discount (SAVE10)</span>
                        <span>− ₹{discount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
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

                    {savings > 0 && (
                      <div className="cart-savings-tag">
                        🎉 You will save ₹{savings.toLocaleString("en-IN")} on this order!
                      </div>
                    )}

                    {/* Coupon */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                        🏷️ Have a coupon? <span style={{ color: "var(--text-3)", fontWeight: 400, fontSize: 11 }}>(try SAVE10)</span>
                      </div>
                      <div className="coupon-input-wrap">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                          disabled={couponApplied}
                        />
                        <button
                          className="coupon-apply-btn"
                          onClick={applyCoupon}
                          disabled={couponApplied || !coupon.trim()}
                        >
                          {couponApplied ? "✓ Applied" : "Apply"}
                        </button>
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      className="btn btn-secondary btn-block btn-lg"
                      onClick={() => router.push("/checkout")}
                    >
                      Proceed to Checkout →
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
          )}
        </div>
      </div>
    </>
  );
}
