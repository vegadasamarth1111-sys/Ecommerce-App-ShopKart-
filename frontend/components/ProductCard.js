import Link from "next/link";
import { useState } from "react";
import api from "../lib/api";

// Star rating helper
const Stars = ({ count = 4 }) => (
  <span className="stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} style={{ color: i < count ? "#f39c12" : "#ddd" }}>★</span>
    ))}
  </span>
);

const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const CartPlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    <line x1="12" y1="5" x2="12" y2="11"/><line x1="9" y1="8" x2="15" y2="8"/>
  </svg>
);

// Deterministic fake discount for demo look
function getDiscount(id) {
  const pct = [0, 10, 15, 20, 25, 30, 0, 12, 18, 22];
  return pct[id % pct.length];
}

// Deterministic fake rating
function getRating(id) {
  const ratings = [4.2, 4.5, 3.8, 4.7, 4.1, 3.9, 4.6, 4.3];
  return ratings[id % ratings.length];
}
function getRatingCount(id) {
  const counts = [1234, 582, 2891, 347, 5621, 89, 1456, 3210];
  return counts[id % counts.length];
}

export default function ProductCard({ product, onCartUpdate, addToast }) {
  const [wished, setWished] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const token = typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    setAdding(true);
    try {
      const apiLib = (await import("../lib/api")).default;
      await apiLib.post(`/api/cart/add?product_id=${product.id}&quantity=1`);
      if (onCartUpdate) onCartUpdate();
      if (addToast) addToast("Added to cart successfully!", "success");
    } catch {
      if (addToast) addToast("Could not add to cart.", "error");
    }
    setAdding(false);
  };

  // Badge logic
  const badge = product.id % 9 === 0 ? "sale"
    : product.id % 7 === 0 ? "hot"
    : product.id % 6 === 0 ? "new"
    : null;

  const imgSrc = product.image_url ||
    `https://picsum.photos/seed/${product.id || product.name}/300/300`;

  const discount = getDiscount(product.id || 1);
  const rating = getRating(product.id || 1);
  const ratingCount = getRatingCount(product.id || 1);
  const originalPrice = discount > 0
    ? Math.round(product.price / (1 - discount / 100))
    : null;

  return (
    <div className="product-card">
      {/* Wishlist */}
      <button
        className={`product-card-wishlist${wished ? " wishlisted" : ""}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWished((w) => !w); }}
        aria-label="Add to wishlist"
        title="Add to wishlist"
      >
        <HeartIcon />
      </button>

      {/* Badge */}
      {badge && (
        <span className={`product-card-badge badge-${badge}`}>
          {badge === "sale" ? "SALE" : badge === "hot" ? "HOT" : "NEW"}
        </span>
      )}

      {/* Image */}
      <Link href={`/products/${product.id}`} style={{ display: "block" }}>
        <div className="product-card-img-wrap">
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/300x300/f1f3f6/2874f0?text=${encodeURIComponent(product.name?.charAt(0) || "P")}`;
            }}
          />
        </div>
      </Link>

      {/* Info */}
      <div className="product-card-body">
        {product.category_name && (
          <span className="product-card-category">{product.category_name}</span>
        )}

        <Link href={`/products/${product.id}`}>
          <h3 className="product-card-name">{product.name}</h3>
        </Link>

        {/* Rating */}
        <div className="product-card-rating">
          <div className="rating-badge">
            {rating.toFixed(1)} <span>★</span>
          </div>
          <span className="rating-count">({ratingCount.toLocaleString("en-IN")})</span>
        </div>

        {/* Price */}
        <div className="product-card-price-row">
          <span className="product-price">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>
          {originalPrice && (
            <span className="product-price-original">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
          )}
          {discount > 0 && (
            <span className="product-price-off">{discount}% off</span>
          )}
        </div>

        {/* Free delivery tag */}
        <div style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 600, marginBottom: "2px" }}>
          {product.price >= 499 ? "✓ Free delivery" : `+₹49 delivery`}
        </div>

        {/* CTA */}
        <div className="product-card-footer">
          <button
            className="btn-add-cart"
            onClick={handleAddToCart}
            disabled={product.stock_qty === 0 || adding}
          >
            {adding ? (
              <>
                <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                Adding…
              </>
            ) : product.stock_qty === 0 ? (
              "Out of Stock"
            ) : (
              <>
                <CartPlusIcon />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
