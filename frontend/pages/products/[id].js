import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import api from "../../lib/api";

export default function ProductDetail({ product }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  if (!product) return <div className="container py-5">Product not found.</div>;

  const addToCart = async () => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    setAdding(true);
    try {
      await api.post(`/api/cart/add?product_id=${product.id}&quantity=${qty}`);
      router.push("/cart");
    } catch { alert("Could not add to cart."); }
    setAdding(false);
  };

  return (
    <>
      <Head>
        <title>{product.name} — ShopKart</title>
        <meta name="description" content={product.description} />
      </Head>
      <div className="container py-5">
        <button className="btn btn-link p-0 mb-3 text-muted" onClick={() => router.back()}>
          ← Back
        </button>
        <div className="row g-4 align-items-start">
          <div className="col-md-5">
            <img
              src={product.image_url || `https://via.placeholder.com/500x500?text=${encodeURIComponent(product.name)}`}
              alt={product.name}
              className="img-fluid rounded"
              style={{ boxShadow: "var(--shadow)" }}
            />
          </div>
          <div className="col-md-7">
            <h1 style={{ fontWeight: 700, fontSize: "1.6rem" }}>{product.name}</h1>
            <div className="product-price" style={{ fontSize: "1.6rem" }}>₹{product.price.toFixed(2)}</div>
            <p className="text-muted-custom mb-3">{product.description}</p>
            <p className={`small fw-semibold ${product.stock_qty > 0 ? "text-success" : "text-danger"}`}>
              {product.stock_qty > 0 ? `✓ In Stock (${product.stock_qty} left)` : "✗ Out of Stock"}
            </p>

            <div className="d-flex align-items-center gap-3 mb-4">
              <label className="fw-semibold">Qty:</label>
              <div className="qty-control">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span className="fw-bold px-1">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock_qty, q + 1))}>+</button>
              </div>
            </div>

            <button
              className="btn btn-primary px-5 py-2"
              onClick={addToCart}
              disabled={adding || product.stock_qty === 0}
            >
              {adding ? "Adding…" : "Add to Cart"}
            </button>
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
