import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProductCard from "../../components/ProductCard";
import api from "../../lib/api";

export default function ProductListing() {
  const router = useRouter();
  const { category_id, search } = router.query;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search || "");

  useEffect(() => {
    api.get("/api/admin/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (category_id) params.set("category_id", category_id);
    if (search) params.set("search", search);
    api.get(`/api/products/?${params}`).then((r) => {
      setProducts(r.data);
      setLoading(false);
    });
  }, [router.isReady, category_id, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push({ pathname: "/products", query: { ...(category_id && { category_id }), search: searchInput } });
  };

  return (
    <>
      <Head>
        <title>Products — ShopKart</title>
        <meta name="description" content="Browse all products on ShopKart." />
      </Head>
      <div className="container py-4">
        {/* Search row */}
        <form onSubmit={handleSearch} className="d-flex gap-2 mb-4" style={{ maxWidth: 480 }}>
          <input
            className="form-control"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button className="btn btn-primary px-3" type="submit">Go</button>
        </form>

        {/* Category pills */}
        <div className="category-pills mb-4">
          <a href="/products" className={`cat-pill ${!category_id ? "active" : ""}`}>All</a>
          {categories.map((c) => (
            <a key={c.id} href={`/products?category_id=${c.id}`}
              className={`cat-pill ${category_id === c.id ? "active" : ""}`}>
              {c.name}
            </a>
          ))}
        </div>

        <h1 className="section-title">{search ? `Results for "${search}"` : "All Products"}</h1>

        {loading ? (
          <p className="text-muted-custom">Loading…</p>
        ) : products.length === 0 ? (
          <p className="text-muted-custom">No products found.</p>
        ) : (
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
            {products.map((p) => (
              <div key={p.id} className="col">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
