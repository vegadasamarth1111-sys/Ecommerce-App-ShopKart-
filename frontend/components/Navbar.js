import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import api from "../lib/api";

// Icons
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const PackageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const NAV_CATS = [
  "Electronics", "Mobiles", "Fashion", "Home & Kitchen",
  "Books", "Toys", "Sports", "Beauty", "Grocery", "Furniture"
];

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name") || "";
    if (token) setUser({ role, name });
    else setUser(null);
  }, [router.pathname]);

  useEffect(() => {
    if (!user) { setCartCount(0); return; }
    api.get("/api/cart/").then((r) => {
      const count = r.data?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
      setCartCount(count);
    }).catch(() => {});
  }, [user, router.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    setUser(null);
    setDropdownOpen(false);
    router.push("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/products?search=${encodeURIComponent(search.trim())}`);
    setSearch("");
    setMobileOpen(false);
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <>
      {/* Top promotional bar */}
      <div className="topbar">
        🎉 Free delivery on orders above ₹499 &nbsp;|&nbsp; Use code <strong>WELCOME20</strong> for 20% off your first order!
        <Link href="/register"> Register now →</Link>
      </div>

      {/* Main Navbar */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="navbar-inner">
          {/* Brand */}
          <Link href="/" className="nav-brand">
            <span className="nav-brand-icon">🛒</span>
            ShopKart
          </Link>

          {/* Location (like Amazon) — desktop only */}
          <div className="nav-location">
            <LocationIcon />
            <div>
              <small style={{ fontSize: "10px", display: "block", opacity: 0.75 }}>Deliver to</small>
              <strong>India</strong>
            </div>
          </div>

          {/* Search */}
          <div className="nav-search-wrap">
            <form className="nav-search" onSubmit={handleSearch}>
              <select className="nav-search-select" aria-label="Category filter">
                <option value="">All</option>
                {NAV_CATS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search for products, brands and more…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search products"
              />
              <button type="submit" className="nav-search-btn" aria-label="Search">
                <SearchIcon />
              </button>
            </form>
          </div>

          {/* Right actions */}
          <div className="nav-right">
            {user ? (
              <>
                {/* Cart */}
                <Link href="/cart" className="nav-icon-btn" aria-label="Cart">
                  <CartIcon />
                  <span className="icon-label">Cart</span>
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
                  )}
                </Link>

                {/* User dropdown */}
                <div className="nav-user-menu" ref={dropdownRef}>
                  <button
                    className="nav-icon-btn"
                    onClick={() => setDropdownOpen((o) => !o)}
                    aria-label="Account menu"
                    aria-expanded={dropdownOpen}
                    style={{ flexDirection: "row", gap: "6px" }}
                  >
                    <div className="nav-user-avatar">{initials}</div>
                    <span className="icon-label" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0 }}>
                      <small style={{ fontSize: "10px", opacity: 0.75, fontWeight: 400 }}>Hello, {user.name?.split(" ")[0] || "User"}</small>
                      <strong style={{ fontSize: "12px" }}>Account ▾</strong>
                    </span>
                  </button>
                  {dropdownOpen && (
                    <div className="nav-dropdown">
                      {user.name && (
                        <>
                          <div style={{ padding: "10px 16px 8px", fontSize: "12px", color: "var(--text-3)", borderBottom: "1px solid var(--border)" }}>
                            Signed in as <strong style={{ color: "var(--primary)" }}>{user.name}</strong>
                          </div>
                        </>
                      )}
                      <Link href="/cart" onClick={() => setDropdownOpen(false)}>
                        <CartIcon /> My Cart {cartCount > 0 && `(${cartCount})`}
                      </Link>
                      <Link href="/orders" onClick={() => setDropdownOpen(false)}>
                        <PackageIcon /> My Orders
                      </Link>
                      {user.role === "admin" && (
                        <>
                          <div className="nav-dropdown-divider" />
                          <Link href="/admin" onClick={() => setDropdownOpen(false)}>
                            <ShieldIcon /> Admin Panel
                          </Link>
                        </>
                      )}
                      <div className="nav-dropdown-divider" />
                      <button onClick={logout}>
                        <LogoutIcon /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-btn-outline">Sign In</Link>
                <Link href="/register" className="nav-btn-primary">Register</Link>
              </>
            )}

            {/* Mobile toggle */}
            <button
              className="nav-mobile-toggle"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* Category sub-nav */}
      <div className="cat-nav">
        <div className="cat-nav-inner">
          <Link href="/products" className="cat-nav-link" style={{ fontWeight: 700, color: "#ffd700" }}>
            ☰ All Categories
          </Link>
          {NAV_CATS.map((c) => (
            <Link key={c} href={`/products?search=${encodeURIComponent(c)}`} className="cat-nav-link">
              {c}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed",
          top: "var(--nav-h)",
          left: 0, right: 0,
          background: "#fff",
          borderBottom: "1px solid var(--border)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          animation: "fadeIn 0.2s ease both",
          zIndex: 999,
          boxShadow: "var(--shadow-md)",
        }}>
          <form className="nav-search" onSubmit={handleSearch} style={{ maxWidth: "100%", border: "1px solid var(--border)" }}>
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "10px 12px" }}
            />
            <button type="submit" className="nav-search-btn"><SearchIcon /></button>
          </form>
          <Link href="/products" className="btn btn-outline btn-block" onClick={() => setMobileOpen(false)}>
            Browse All Products
          </Link>
          {user ? (
            <>
              <Link href="/cart" className="btn btn-ghost btn-block" onClick={() => setMobileOpen(false)}>
                🛒 Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              <Link href="/orders" className="btn btn-ghost btn-block" onClick={() => setMobileOpen(false)}>
                📦 My Orders
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="btn btn-ghost btn-block" onClick={() => setMobileOpen(false)}>
                  🛡 Admin Panel
                </Link>
              )}
              <button className="btn btn-danger btn-block" onClick={logout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline btn-block" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/register" className="btn btn-primary btn-block" onClick={() => setMobileOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
