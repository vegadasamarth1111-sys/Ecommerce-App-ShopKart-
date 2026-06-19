import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import api from "../lib/api";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get("/api/products/?limit=8"),
          api.get("/api/admin/categories").catch(() => ({ data: [] })),
        ]);
        setFeatured(prodRes.data);
        setCategories(catRes.data);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/products?search=${encodeURIComponent(search)}`;
  };

  return (
    <>
      <Head>
        <title>ShopKart — Online Store</title>
        <meta name="description" content="Discover amazing products at great prices on ShopKart." />
      </Head>

      {/* Hero */}
      <div className="hero-banner">
        <h1>Find Everything You Love</h1>
        <p>Quality products delivered fast to your door.</p>
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="container py-4">
        {/* Categories */}
        {categories.length > 0 && (
          <section className="mb-4">
            <h2 className="section-title">Shop by Category</h2>
            <div className="category-pills">
              <Link href="/products" className="cat-pill active">All</Link>
              {categories.map((c) => (
                <Link key={c.id} href={`/products?category_id=${c.id}`} className="cat-pill">
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section>
          <h2 className="section-title">Featured Products</h2>
          {loading ? (
            <p className="text-muted-custom">Loading...</p>
          ) : featured.length === 0 ? (
            <p className="text-muted-custom">No products yet. Admin can add some!</p>
          ) : (
            <div className="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
              {featured.map((p) => (
                <div key={p.id} className="col">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
          {featured.length >= 8 && (
            <div className="text-center mt-4">
              <Link href="/products" className="btn btn-outline-primary px-4">
                View All Products →
              </Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
