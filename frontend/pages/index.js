import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import ProductCard from "../components/ProductCard";
import { useToast } from "../lib/toast";
import api from "../lib/api";

// ── Icons ────────────────────────────────────────────────────
const ArrowLeft  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ArrowRight = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const ChevRight  = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

// ── Hero slides ──────────────────────────────────────────────
const SLIDES = [
  {
    tag: "🔥 Big Sale",
    title: "Up to 70% Off\nElectronics",
    subtitle: "Laptops, phones, tablets — huge savings every day.",
    cta: "Shop Electronics",
    href: "/products?search=electronics",
    bg: "linear-gradient(135deg, #1a237e 0%, #1565c0 60%, #0d47a1 100%)",
    accent: "#ffd740",
    imgSeed: 42,
  },
  {
    tag: "✨ New Arrivals",
    title: "Fresh Fashion\nFor You",
    subtitle: "Explore thousands of styles for men, women & kids.",
    cta: "Explore Fashion",
    href: "/products?search=fashion",
    bg: "linear-gradient(135deg, #4a148c 0%, #7b1fa2 60%, #9c27b0 100%)",
    accent: "#f8bbd0",
    imgSeed: 77,
  },
  {
    tag: "🏠 Home Week",
    title: "Transform Your\nHome & Kitchen",
    subtitle: "Furniture, décor and appliances at unbeatable prices.",
    cta: "Browse Home",
    href: "/products?search=home",
    bg: "linear-gradient(135deg, #006064 0%, #00838f 60%, #0097a7 100%)",
    accent: "#b2ebf2",
    imgSeed: 15,
  },
];

// ── Category panel data ──────────────────────────────────────
const HERO_CATS = [
  { icon: "📱", name: "Mobiles", href: "/products?search=mobile" },
  { icon: "💻", name: "Laptops", href: "/products?search=laptop" },
  { icon: "👗", name: "Fashion", href: "/products?search=fashion" },
  { icon: "🏠", name: "Home", href: "/products?search=home" },
  { icon: "📺", name: "Electronics", href: "/products?search=electronics" },
  { icon: "🍳", name: "Kitchen", href: "/products?search=kitchen" },
  { icon: "📚", name: "Books", href: "/products?search=books" },
  { icon: "🎮", name: "Gaming", href: "/products?search=gaming" },
  { icon: "💄", name: "Beauty", href: "/products?search=beauty" },
  { icon: "⚽", name: "Sports", href: "/products?search=sports" },
];

// ── Category cards (full row) ────────────────────────────────
const CAT_CARDS = [
  { icon: "📱", name: "Mobiles",    color: "#e3f2fd", href: "/products?search=mobile" },
  { icon: "💻", name: "Laptops",    color: "#f3e5f5", href: "/products?search=laptop" },
  { icon: "👗", name: "Fashion",    color: "#fce4ec", href: "/products?search=fashion" },
  { icon: "🏠", name: "Home",       color: "#e8f5e9", href: "/products?search=home" },
  { icon: "🍳", name: "Kitchen",    color: "#fff3e0", href: "/products?search=kitchen" },
  { icon: "📚", name: "Books",      color: "#e8eaf6", href: "/products?search=books" },
  { icon: "🎮", name: "Gaming",     color: "#fbe9e7", href: "/products?search=gaming" },
  { icon: "💄", name: "Beauty",     color: "#fdf6e3", href: "/products?search=beauty" },
  { icon: "⚽", name: "Sports",     color: "#e0f7fa", href: "/products?search=sports" },
  { icon: "🎁", name: "Gifts",      color: "#f9fbe7", href: "/products?search=gifts" },
];

// ── Deal Items (static) ─────────────────────────────────────
const DEALS = [
  { name: "Wireless Earbuds", discount: 40, imgSeed: 11, price: 1499 },
  { name: "Smart Watch",      discount: 35, imgSeed: 22, price: 2999 },
  { name: "Running Shoes",    discount: 30, imgSeed: 33, price: 899  },
  { name: "Sunglasses",       discount: 50, imgSeed: 44, price: 349  },
  { name: "Backpack",         discount: 25, imgSeed: 55, price: 799  },
  { name: "Desk Lamp",        discount: 45, imgSeed: 66, price: 599  },
  { name: "Phone Case",       discount: 60, imgSeed: 77, price: 199  },
  { name: "Water Bottle",     discount: 20, imgSeed: 88, price: 299  },
];

// ── Offer banners ────────────────────────────────────────────
const OFFER_BANNERS = [
  {
    tag: "Special Offer",
    title: "20% Off\nFirst Order",
    sub: "Use code WELCOME20",
    bg: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
    tagColor: "#1565c0",
    titleColor: "#0d47a1",
    subColor: "#1976d2",
    btnBg: "#2874f0",
    cta: "Register Now",
    href: "/register",
  },
  {
    tag: "Free Delivery",
    title: "On Orders\nAbove ₹499",
    sub: "Shop more, save more",
    bg: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
    tagColor: "#2e7d32",
    titleColor: "#1b5e20",
    subColor: "#388e3c",
    btnBg: "#27ae60",
    cta: "Start Shopping",
    href: "/products",
  },
  {
    tag: "Refer & Earn",
    title: "₹200 Cashback\nPer Referral",
    sub: "Unlimited earning potential",
    bg: "linear-gradient(135deg, #fff3e0, #ffe0b2)",
    tagColor: "#e65100",
    titleColor: "#bf360c",
    subColor: "#d84315",
    btnBg: "#fb641b",
    cta: "Refer Friends",
    href: "/register",
  },
];

export default function Home() {
  const addToast = useToast();
  const [featured, setFeatured]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [slide, setSlide]           = useState(0);

  // Auto-advance slider
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get("/api/products/?limit=8"),
          api.get("/api/admin/categories").catch(() => ({ data: [] })),
        ]);
        setFeatured(Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.results || []);
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const cur = SLIDES[slide];

  return (
    <>
      <Head>
        <title>ShopKart — India&apos;s Online Shopping Destination</title>
        <meta name="description" content="Shop from millions of products — electronics, fashion, home & more. Free delivery above ₹499." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="hero">
        <div className="hero-layout">
          {/* Left category panel */}
          <div className="hero-cat-panel">
            {HERO_CATS.map((c) => (
              <Link key={c.name} href={c.href} className="hero-cat-item">
                <span>{c.icon} {c.name}</span>
                <span className="cat-arrow"><ChevRight /></span>
              </Link>
            ))}
          </div>

          {/* Right banner */}
          <div className="hero-banner">
            <div className="hero-slide" style={{ background: cur.bg }}>
              <div className="hero-slide-content">
                <span className="hero-slide-tag">{cur.tag}</span>
                <h1 className="hero-slide-title" style={{ whiteSpace: "pre-line" }}>
                  {cur.title}
                </h1>
                <p className="hero-slide-subtitle">{cur.subtitle}</p>
                <Link
                  href={cur.href}
                  className="btn btn-lg"
                  style={{ background: cur.accent, color: "#1a1a2e", fontWeight: 800 }}
                >
                  {cur.cta} →
                </Link>
              </div>
              <div className="hero-slide-img">
                <img
                  src={`https://picsum.photos/seed/${cur.imgSeed}/600/400`}
                  alt={cur.title}
                />
              </div>
              {/* Arrows */}
              <button
                className="hero-arrow left"
                onClick={() => setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length)}
                aria-label="Previous slide"
              >
                <ArrowLeft />
              </button>
              <button
                className="hero-arrow right"
                onClick={() => setSlide((s) => (s + 1) % SLIDES.length)}
                aria-label="Next slide"
              >
                <ArrowRight />
              </button>
              {/* Dots */}
              <div className="hero-dots">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    className={`hero-dot${i === slide ? " active" : ""}`}
                    onClick={() => setSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 12, paddingBottom: 40 }}>

        {/* ── FEATURES STRIP ───────────────────────────── */}
        <div className="features-strip">
          {[
            { icon: "🚚", title: "Free Delivery",    desc: "On orders above ₹499" },
            { icon: "🔄", title: "Easy Returns",     desc: "30-day hassle-free returns" },
            { icon: "🔒", title: "Secure Payments",  desc: "100% encrypted & safe" },
            { icon: "⭐", title: "Best Quality",     desc: "Curated premium products" },
            { icon: "🎧", title: "24/7 Support",     desc: "Always here to help you" },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-card-icon">
                <span style={{ fontSize: "1.1rem" }}>{f.icon}</span>
              </div>
              <div>
                <div className="feature-card-title">{f.title}</div>
                <div className="feature-card-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── DAILY DEALS (Blinkit / Flipkart style) ─── */}
        <div className="section-strip">
          <div className="section-strip-header">
            <div>
              <div className="section-strip-title">⚡ Deal of the Day</div>
              <div className="section-strip-subtitle">Ends in: 08:45:32 &nbsp;⏰</div>
            </div>
            <Link href="/products" className="view-all-btn">
              View All Deals →
            </Link>
          </div>
          <div className="deals-scroll">
            {DEALS.map((d, i) => (
              <Link
                key={d.name}
                href="/products"
                className="deal-card"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <img
                  className="deal-card-img"
                  src={`https://picsum.photos/seed/${d.imgSeed}/200/200`}
                  alt={d.name}
                  loading="lazy"
                />
                <div className="deal-card-name">{d.name}</div>
                <div className="deal-card-discount">{d.discount}% OFF</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
                  ₹{d.price.toLocaleString("en-IN")}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── CATEGORIES ───────────────────────────────── */}
        <div className="section-strip">
          <div className="section-strip-header">
            <div>
              <div className="section-strip-title">🗂️ Shop by Category</div>
              <div className="section-strip-subtitle">Browse our wide range of categories</div>
            </div>
            <Link href="/products" className="view-all-btn">View All →</Link>
          </div>
          <div className="category-grid">
            {/* Dynamic categories from API */}
            {categories.length > 0
              ? categories.map((c, i) => {
                  const staticCat = CAT_CARDS[i % CAT_CARDS.length];
                  return (
                    <Link
                      key={c.id}
                      href={`/products?category_id=${c.id}`}
                      className="category-card"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div className="category-card-icon" style={{ background: staticCat.color }}>
                        {staticCat.icon}
                      </div>
                      <span className="category-card-name">{c.name}</span>
                    </Link>
                  );
                })
              : CAT_CARDS.map((c, i) => (
                  <Link
                    key={c.name}
                    href={c.href}
                    className="category-card"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="category-card-icon" style={{ background: c.color }}>
                      {c.icon}
                    </div>
                    <span className="category-card-name">{c.name}</span>
                  </Link>
                ))}
          </div>
        </div>

        {/* ── OFFER BANNERS ─────────────────────────────── */}
        <div className="offer-banners">
          {OFFER_BANNERS.map((b) => (
            <div key={b.tag} className="offer-banner" style={{ background: b.bg }}>
              <div className="offer-banner-body">
                <div className="offer-banner-tag" style={{ color: b.tagColor }}>
                  {b.tag}
                </div>
                <div
                  className="offer-banner-title"
                  style={{ color: b.titleColor, whiteSpace: "pre-line" }}
                >
                  {b.title}
                </div>
                <div className="offer-banner-sub" style={{ color: b.subColor }}>
                  {b.sub}
                </div>
                <Link
                  href={b.href}
                  className="btn btn-sm"
                  style={{ background: b.btnBg, color: "#fff", fontWeight: 700 }}
                >
                  {b.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* ── FEATURED PRODUCTS ─────────────────────────── */}
        <div className="section-strip">
          <div className="section-strip-header">
            <div>
              <div className="section-strip-title">🌟 Featured Products</div>
              <div className="section-strip-subtitle">Handpicked favourites just for you</div>
            </div>
            {featured.length >= 4 && (
              <Link href="/products" className="view-all-btn">View All →</Link>
            )}
          </div>

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton skeleton-card" style={{ animationDelay: `${0.07 * i}s` }} />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="empty-state" style={{ border: "none", background: "transparent" }}>
              <span className="empty-state-icon">📦</span>
              <h3>No Products Yet</h3>
              <p>The admin will add products soon. Check back later!</p>
            </div>
          ) : (
            <div className="product-grid">
              {featured.map((p, i) => (
                <div key={p.id} style={{ animation: `fadeUp 0.4s ease ${0.06 * i}s both` }}>
                  <ProductCard product={p} addToast={addToast} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── BRAND / TRUST SECTION ─────────────────────── */}
        <div className="section-strip" style={{ textAlign: "center" }}>
          <div style={{ padding: "8px 0 16px" }}>
            <div className="section-strip-title" style={{ marginBottom: 6 }}>
              🏆 Why 50,000+ Customers Choose ShopKart
            </div>
            <p style={{ fontSize: "13.5px", color: "var(--text-3)", maxWidth: 500, margin: "0 auto 24px" }}>
              Trusted by customers across India for quality products, fast delivery, and exceptional service.
            </p>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 16,
          }}>
            {[
              { stat: "50,000+",  label: "Happy Customers" },
              { stat: "1,00,000+", label: "Products Listed" },
              { stat: "98%",      label: "Satisfaction Rate" },
              { stat: "4.8 ★",    label: "Average Rating" },
              { stat: "< 3 Days", label: "Average Delivery" },
            ].map((s) => (
              <div key={s.label} style={{
                padding: "20px 12px",
                background: "var(--bg-2)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
              }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {s.stat}
                </div>
                <div style={{ fontSize: "12.5px", color: "var(--text-3)", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
