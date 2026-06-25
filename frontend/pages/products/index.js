import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import ProductCard from "../../components/ProductCard";
import { useToast } from "../../lib/toast";
import api from "../../lib/api";

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const SORT_OPTIONS = [
  { value: "", label: "Relevance" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest First" },
];

export default function ProductListing() {
  const router = useRouter();
  const addToast = useToast();
  const { category_id, search } = router.query;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync search input from URL
  useEffect(() => {
    if (router.isReady) setSearchInput(search || "");
  }, [search, router.isReady]);

  useEffect(() => {
    api.get("/api/admin/categories").then((r) => setCategories(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (category_id) params.set("category_id", category_id);
    if (search) params.set("search", search);
    if (sort === "price_asc") params.set("sort", "price");
    if (sort === "price_desc") params.set("sort", "-price");
    api.get(`/api/products/?${params}`).then((r) => {
      let data = Array.isArray(r.data) ? r.data : [];
      // Client-side price filter
      if (minPrice) data = data.filter((p) => Number(p.price) >= Number(minPrice));
      if (maxPrice) data = data.filter((p) => Number(p.price) <= Number(maxPrice));
      setProducts(data);
    }).catch(() => setProducts([])).finally(() => setLoading(false));
  }, [router.isReady, category_id, search, sort, minPrice, maxPrice]);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push({
      pathname: "/products",
      query: { ...(category_id && { category_id }), ...(searchInput && { search: searchInput }) },
    });
    setMobileFilterOpen(false);
  };

  const clearSearch = () => {
    setSearchInput("");
    router.push({ pathname: "/products", query: { ...(category_id && { category_id }) } });
  };

  const activeCat = categories.find((c) => String(c.id) === String(category_id));

  const FilterPanel = (
    <div className="filter-panel">
      <div className="filter-title">Filters</div>

      {/* Categories */}
      <div className="filter-section">
        <span className="filter-label">Category</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <a
            href="/products"
            className={`cat-pill${!category_id ? " active" : ""}`}
            style={{ justifyContent: "flex-start" }}
          >
            ✦ All Products
          </a>
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/products?category_id=${c.id}${search ? `&search=${search}` : ""}`}
              className={`cat-pill${String(category_id) === String(c.id) ? " active" : ""}`}
              style={{ justifyContent: "flex-start" }}
            >
              {c.name}
            </a>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <span className="filter-label">Price Range (₹)</span>
        <div className="price-range-row">
          <input
            type="number"
            className="price-input"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min="0"
          />
          <span className="price-range-sep">–</span>
          <input
            type="number"
            className="price-input"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min="0"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="filter-section">
        <span className="filter-label">Sort By</span>
        <select
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Clear filters */}
      {(minPrice || maxPrice || sort || search || category_id) && (
        <button
          className="btn btn-outline btn-sm"
          style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
          onClick={() => {
            setMinPrice(""); setMaxPrice(""); setSort("");
            router.push("/products");
          }}
        >
          <XIcon /> Clear All
        </button>
      )}
    </div>
  );

  return (
    <>
      <Head>
        <title>
          {search ? `"${search}" — ` : activeCat ? `${activeCat.name} — ` : ""}Products — ShopKart
        </title>
        <meta name="description" content="Browse all products on ShopKart. Filter by category, price and more." />
      </Head>

      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        {/* Top bar */}
        <div style={{ marginBottom: "1.5rem" }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: "0.8rem", color: "var(--text-3)", marginBottom: "0.75rem", display: "flex", gap: "0.35rem", alignItems: "center" }}>
            <a href="/" style={{ color: "var(--text-3)", transition: "color 0.15s" }}
              onMouseEnter={(e) => e.target.style.color = "var(--text-2)"}
              onMouseLeave={(e) => e.target.style.color = "var(--text-3)"}
            >Home</a>
            <span>›</span>
            {activeCat && (
              <>
                <span style={{ color: "var(--text-3)" }}>Products</span>
                <span>›</span>
                <span style={{ color: "var(--text-2)" }}>{activeCat.name}</span>
              </>
            )}
            {search && (
              <>
                <span style={{ color: "var(--text-3)" }}>Products</span>
                <span>›</span>
                <span style={{ color: "var(--text-2)" }}>Search: "{search}"</span>
              </>
            )}
            {!activeCat && !search && <span style={{ color: "var(--text-2)" }}>All Products</span>}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 2rem)", letterSpacing: "-0.03em" }}>
              {search ? `Results for "${search}"` : activeCat ? activeCat.name : "All Products"}
            </h1>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {/* View mode */}
              <div style={{ display: "flex", background: "var(--card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                {[["grid", <GridIcon />], ["list", <ListIcon />]].map(([mode, icon]) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      padding: "0.45rem 0.65rem",
                      background: viewMode === mode ? "var(--primary)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: viewMode === mode ? "white" : "var(--text-3)",
                      transition: "all 0.15s",
                      display: "flex", alignItems: "center",
                    }}
                    aria-label={mode + " view"}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              {/* Mobile filter toggle */}
              <button
                className="btn btn-glass btn-sm"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <FilterIcon /> Filters
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <form className="products-search" onSubmit={handleSearch}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            id="product-search-input"
          />
          {searchInput && (
            <button type="button" onClick={() => setSearchInput("")} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", padding: "0 0.25rem", display: "flex" }}>
              <XIcon />
            </button>
          )}
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        {/* Active tags */}
        {(search || activeCat || minPrice || maxPrice) && (
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            {search && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "0.35rem",
                padding: "0.25rem 0.7rem", borderRadius: "999px",
                background: "hsl(258,78%,60%,0.15)", border: "1px solid hsl(258,78%,60%,0.3)",
                fontSize: "0.78rem", fontWeight: 600, color: "var(--primary-glow)",
              }}>
                🔍 {search}
                <button onClick={clearSearch} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", padding: "0" }}>
                  <XIcon />
                </button>
              </span>
            )}
            {activeCat && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "0.35rem",
                padding: "0.25rem 0.7rem", borderRadius: "999px",
                background: "hsl(165,75%,40%,0.12)", border: "1px solid hsl(165,75%,40%,0.25)",
                fontSize: "0.78rem", fontWeight: 600, color: "var(--accent)",
              }}>
                📂 {activeCat.name}
              </span>
            )}
          </div>
        )}

        {/* Mobile filter panel */}
        {mobileFilterOpen && (
          <div style={{ marginBottom: "1.5rem", animation: "fadeUp 0.25s ease both" }}>
            {FilterPanel}
          </div>
        )}

        <div className="products-layout">
          {/* Sidebar - hidden on mobile (use mobile toggle above) */}
          <div style={{ display: "block" }} className="filter-sidebar-desktop">
            {FilterPanel}
          </div>

          {/* Product grid */}
          <div>
            {/* Results count */}
            {!loading && (
              <div style={{ fontSize: "0.82rem", color: "var(--text-3)", marginBottom: "1rem", fontWeight: 500 }}>
                {products.length} product{products.length !== 1 ? "s" : ""} found
              </div>
            )}

            {loading ? (
              <div className="product-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton skeleton-card" style={{ animationDelay: `${0.05 * i}s` }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state" style={{ background: "var(--card)", borderRadius: "var(--radius-xl)", border: "1px solid var(--glass-border)" }}>
                <span className="empty-state-icon">🔍</span>
                <h3>No Products Found</h3>
                <p>Try adjusting your search or filters.</p>
                <a href="/products" className="btn btn-primary" style={{ marginTop: "1.25rem", display: "inline-flex" }}>
                  View All Products
                </a>
              </div>
            ) : viewMode === "grid" ? (
              <div className="product-grid">
                {products.map((p, i) => (
                  <div key={p.id} style={{ animation: `fadeUp 0.4s ease ${0.04 * i}s both` }}>
                    <ProductCard product={p} addToast={addToast} />
                  </div>
                ))}
              </div>
            ) : (
              /* List view */
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {products.map((p, i) => (
                  <a key={p.id} href={`/products/${p.id}`} style={{
                    display: "flex", alignItems: "center", gap: "1.25rem",
                    background: "var(--card)", border: "1px solid var(--glass-border)",
                    borderRadius: "var(--radius-lg)", padding: "1rem 1.25rem",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    animation: `fadeUp 0.4s ease ${0.04 * i}s both`,
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--glass-border-h)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = ""; }}
                  >
                    <img
                      src={p.image_url || `https://picsum.photos/seed/${p.id}/80/80`}
                      alt={p.name}
                      style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--glass-border)", flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", marginBottom: "0.2rem" }}>{p.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-3)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {p.description}
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "1.05rem", background: "linear-gradient(135deg, var(--primary-glow), var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", flexShrink: 0 }}>
                      ₹{Number(p.price).toLocaleString("en-IN")}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .filter-sidebar-desktop { display: none !important; }
          :global(.products-layout) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
