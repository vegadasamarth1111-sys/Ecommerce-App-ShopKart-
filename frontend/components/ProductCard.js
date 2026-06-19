import Link from "next/link";
import api from "../lib/api";

export default function ProductCard({ product, onCartUpdate }) {
  const addToCart = async (e) => {
    e.preventDefault();
    const token = typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    try {
      await api.post(`/api/cart/add?product_id=${product.id}&quantity=1`);
      if (onCartUpdate) onCartUpdate();
      alert("Added to cart!");
    } catch {
      alert("Could not add to cart.");
    }
  };

  return (
    <div className="product-card">
      <Link href={`/products/${product.id}`}>
        <img
          src={product.image_url || `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
        />
      </Link>
      <div className="product-card-body">
        <Link href={`/products/${product.id}`}>
          <h6>{product.name}</h6>
        </Link>
        <p className="text-muted-custom mb-1" style={{ fontSize: ".8rem", lineClamp: 2 }}>
          {product.description?.substring(0, 60)}…
        </p>
        <div className="product-price">₹{product.price.toFixed(2)}</div>
        <button className="btn-add-cart" onClick={addToCart}>
          + Add to Cart
        </button>
      </div>
    </div>
  );
}
