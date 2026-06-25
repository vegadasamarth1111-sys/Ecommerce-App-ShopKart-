import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import api from "../../lib/api";

// Icons
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const TruckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const RotateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

export default function ProductDetail({ product }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (router.isFallback) {
    return (
      <div className="loading-spinner" style={{ minHeight: "60vh" }}>
        <div className="spinner-ring" />
        <span className="spinner-text">Loading product…</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ paddingTop: "4rem" }}>
        <div className="empty-state">
          <span className="empty-state-icon">😕</span>
          <h3>Product Not Found</h3>
          <p>This product may have been removed or doesn't exist.</p>
          <Link href="/products" className="btn btn-primary" style={{ marginTop: "1.25rem", display: "inline-flex" }}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const addToCart = async () => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    setAdding(true);
    try {
      await api.post(`/api/cart/add?product_id=${product.id}&quantity=${qty}`);
      setAdded(true);
      showToast(`Added ${qty} × ${product.name} to cart! 🛒`);
      setTimeout(() => setAdded(false), 2500);
    } catch {
      showToast("Could not add to cart. Please try again.", "error");
    }
    setAdding(false);
  };

  const imgSrc = product.image_url ||
    `https://picsum.photos/seed/${product.id}/600/600`;

  const discount = Math.floor(Math.random() * 15) + 5; // Demo discount display
  const originalPrice = Math.round(product.price * (1 + discount / 100));

  return (
    <>
      <Head>
        <title>{product.name} — ShopKart</title>
        <meta name="description" content={product.description || `Buy ${product.name} on ShopKart at the best price.`} />
      </Head>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999,
          background: "var(--bg-3)", border: `1px solid var(--glass-border-h)`,
          borderLeft: `3px solid ${toast.type === "success" ? "var(--success)" : "var(--danger)"}`,
          borderRadius: "var(--radius)", padding: "0.85rem 1.25rem",
          color: "var(--text)", fontWeight: 600, fontSize: "0.88rem",
          display: "flex", alignItems: "center", gap: "0.65rem",
          boxShadow: "var(--shadow-lg)", backdropFilter: "blur(16px)",
          animation: "slideRight 0.3s ease",
          maxWidth: "320px",
        }}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <div className="container">
        {/* Back */}
        <button className="back-btn" onClick={() => router.back()}>
          <ArrowLeftIcon /> Back to products
        </button>

        {/* Breadcrumb */}
        <div style={{ fontSize: "0.78rem", color: "var(--text-3)", marginBottom: "2rem", display: "flex", gap: "0.35rem", alignItems: "center" }}>
          <Link href="/" style={{ color: "var(--text-3)", transition: "color 0.15s" }}>Home</Link>
          <span>›</span>
          <Link href="/products" style={{ color: "var(--text-3)", transition: "color 0.15s" }}>Products</Link>
          <span>›</span>
          <span style={{ color: "var(--text-2)" }}>{product.name}</span>
        </div>

        <div className="product-detail">
          {/* LEFT: Gallery */}
          <div className="product-detail-gallery">
            <div style={{ position: "relative" }}>
              <img
                src={imgSrc}
                alt={product.name}
                className="product-detail-img"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/600x600/1a1a2e/8b5cf6?text=${encodeURIComponent(product.name?.charAt(0) || "P")}`;
                }}
              />
              {/* Wish list button on image */}
              <button
                onClick={() => setWishlisted(!wishlisted)}
                style={{
                  position: "absolute", top: "1rem", right: "1rem",
                  width: "42px", height: "42px",
                  borderRadius: "50%",
                  background: wishlisted ? "hsl(355,78%,60%,0.8)" : "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  transform: wishlisted ? "scale(1.15)" : "scale(1)",
                }}
                aria-label="Wishlist"
              >
                <HeartIcon />
              </button>
            </div>

            {/* Trust badges */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem",
              marginTop: "1.25rem",
            }}>
              {[
                { icon: <TruckIcon />, label: "Free Delivery" },
                { icon: <ShieldIcon />, label: "Secure Pay" },
                { icon: <RotateIcon />, label: "Easy Return" },
              ].map((b) => (
                <div key={b.label} style={{
                  background: "var(--card)", border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius)", padding: "0.65rem 0.5rem",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem",
                  fontSize: "0.7rem", color: "var(--text-3)", textAlign: "center",
                }}>
                  <span style={{ color: "var(--accent)" }}>{b.icon}</span>
                  {b.label}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Info */}
          <div className="product-detail-info">
            {product.category_name && (
              <div className="product-detail-cat">{product.category_name}</div>
            )}

            <h1 className="product-detail-name">{product.name}</h1>

            {/* Rating row (decorative) */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", gap: "0.15rem" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24"
                    fill={i < 4 ? "hsl(38,95%,60%)" : "none"}
                    stroke="hsl(38,95%,60%)" strokeWidth="1.5"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <span style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>4.2 (128 reviews)</span>
            </div>

            {/* Price row */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "1rem" }}>
              <div className="product-detail-price">
                ₹{Number(product.price).toLocaleString("en-IN", { minimumFractionDigits: 0 })}
              </div>
              <del style={{ fontSize: "0.95rem", color: "var(--text-3)", fontFamily: "'Space Grotesk', sans-serif" }}>
                ₹{originalPrice.toLocaleString("en-IN")}
              </del>
              <span style={{
                background: "hsl(355,78%,60%,0.15)", border: "1px solid hsl(355,78%,60%,0.3)",
                borderRadius: "999px", padding: "0.15rem 0.6rem",
                fontSize: "0.72rem", fontWeight: 800, color: "hsl(355,78%,70%)",
              }}>
                {discount}% OFF
              </span>
            </div>

            {/* Stock */}
            <span className={`product-detail-stock ${product.stock_qty > 0 ? "stock-in" : "stock-out"}`}>
              {product.stock_qty > 0 ? (
                <><CheckIcon /> In Stock ({product.stock_qty} available)</>
              ) : (
                <>✕ Out of Stock</>
              )}
            </span>

            {/* Description */}
            <p className="product-detail-desc" style={{ marginTop: "1.25rem" }}>
              {product.description || "High-quality product with excellent craftsmanship. Built to last and designed to impress."}
            </p>

            {/* Quantity */}
            <div className="qty-row">
              <span className="qty-label">Quantity</span>
              <div className="qty-control">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >
                  <MinusIcon />
                </button>
                <span>{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock_qty || 99, q + 1))}
                  disabled={qty >= (product.stock_qty || 99)}
                  aria-label="Increase quantity"
                >
                  <PlusIcon />
                </button>
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>
                Subtotal: <strong style={{ color: "var(--text-2)" }}>
                  ₹{(product.price * qty).toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                </strong>
              </span>
            </div>

            {/* CTA buttons */}
            <div className="detail-actions">
              <button
                id="add-to-cart-btn"
                className="btn-add-cart-lg"
                onClick={addToCart}
                disabled={adding || product.stock_qty === 0}
              >
                {adding ? (
                  <><div className="btn btn-auth" style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin-slow 0.7s linear infinite", padding: 0, background: "transparent" }} /> Adding…</>
                ) : added ? (
                  <><CheckIcon /> Added!</>
                ) : (
                  <><CartIcon /> {product.stock_qty === 0 ? "Out of Stock" : "Add to Cart"}</>
                )}
              </button>
              <button
                onClick={() => setWishlisted(!wishlisted)}
                style={{
                  width: "52px", height: "52px", borderRadius: "50%",
                  background: wishlisted ? "hsl(355,78%,60%,0.12)" : "var(--glass)",
                  border: `1px solid ${wishlisted ? "hsl(355,78%,60%,0.4)" : "var(--glass-border)"}`,
                  color: wishlisted ? "hsl(355,78%,65%)" : "var(--text-3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
                aria-label="Add to wishlist"
              >
                <HeartIcon />
              </button>
            </div>

            {/* Features list */}
            <ul className="product-features">
              {[
                "Premium quality materials",
                "Fast & free shipping on this item",
                "30-day hassle-free returns",
                "Authentic product guarantee",
              ].map((f) => (
                <li key={f}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/products/${params.id}`
    );
    if (!res.ok) return { props: { product: null } };
    const product = await res.json();
    return { props: { product } };
  } catch {
    return { props: { product: null } };
  }
}
