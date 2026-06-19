import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import CartItem from "../components/CartItem";
import api from "../lib/api";

export default function Cart() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    try {
      const res = await api.get("/api/cart/");
      setItems(res.data.items || []);
    } catch {}
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <>
      <Head>
        <title>Your Cart — ShopKart</title>
      </Head>
      <div className="container py-4" style={{ maxWidth: 680 }}>
        <h1 className="section-title">Your Cart ({items.length})</h1>
        {loading ? (
          <p className="text-muted-custom">Loading…</p>
        ) : items.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted-custom">Your cart is empty.</p>
            <a href="/products" className="btn btn-primary mt-2">Browse Products</a>
          </div>
        ) : (
          <>
            {items.map((item) => (
              <CartItem key={item.product_id} item={item} onUpdate={fetchCart} />
            ))}
            <div className="card border-0 shadow-sm p-3 mt-3">
              <div className="d-flex justify-content-between fw-semibold mb-1">
                <span>Subtotal</span><span>₹{total.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span><span>₹{total.toFixed(2)}</span>
              </div>
              <button
                className="btn btn-primary w-100 mt-3 py-2 fw-semibold"
                onClick={() => router.push("/checkout")}
              >
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
