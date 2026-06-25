import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import api from "../lib/api";

// Icons
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const EyeIcon = ({ off }) => off ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/login", form);
      localStorage.setItem("token", res.data.access_token);
      try {
        const payload = JSON.parse(atob(res.data.access_token.split(".")[1]));
        localStorage.setItem("role", payload.role || "customer");
        localStorage.setItem("name", payload.name || payload.sub || "");
        router.push(payload.role === "admin" ? "/admin" : "/");
      } catch {
        localStorage.setItem("role", "customer");
        router.push("/");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Sign In — ShopKart</title>
        <meta name="description" content="Sign in to your ShopKart account to shop, track orders, and more." />
      </Head>

      <div className="auth-page">
        {/* Left panel */}
        <div className="auth-split-left">
          <div className="auth-brand">🛒 ShopKart</div>
          <p className="auth-brand-tagline">
            India's most trusted online shopping destination.<br />
            Millions of products. Unbeatable prices.
          </p>

          {[
            { icon: "🚚", title: "Free Delivery",   desc: "On orders above ₹499 across India" },
            { icon: "🔄", title: "Easy Returns",    desc: "30-day hassle-free return policy" },
            { icon: "🔒", title: "Secure Shopping", desc: "Your data is always safe with us" },
            { icon: "⭐", title: "Top Rated",       desc: "4.8★ rated by 50,000+ customers" },
          ].map((f) => (
            <div key={f.title} className="auth-left-feature">
              <div className="auth-left-feature-icon">{f.icon}</div>
              <div>
                <strong style={{ display: "block" }}>{f.title}</strong>
                <span style={{ fontSize: 12, opacity: 0.75 }}>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right form panel */}
        <div className="auth-split-right">
          <div className="auth-card">
            <h1 className="auth-title">Welcome Back!</h1>
            <p className="auth-subtitle">Sign in to continue shopping on ShopKart</p>

            {error && (
              <div className="form-error">
                <AlertIcon /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email Address</label>
                <div className="form-input-wrap">
                  <span className="form-input-icon"><MailIcon /></span>
                  <input
                    id="login-email"
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set("email")}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0 }} htmlFor="login-password">Password</label>
                  <a href="#" style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>
                    Forgot password?
                  </a>
                </div>
                <div className="form-input-wrap">
                  <span className="form-input-icon"><LockIcon /></span>
                  <input
                    id="login-password"
                    type={showPass ? "text" : "password"}
                    className="form-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set("password")}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="form-input-toggle"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    <EyeIcon off={showPass} />
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <input type="checkbox" id="remember-me" style={{ accentColor: "var(--primary)", width: 14, height: 14 }} />
                <label htmlFor="remember-me" style={{ fontSize: 13, color: "var(--text-2)", cursor: "pointer" }}>
                  Keep me signed in
                </label>
              </div>

              <button id="login-submit" type="submit" className="btn-auth primary" disabled={loading}>
                {loading ? (
                  <><div className="spinner" /> Signing in…</>
                ) : (
                  "Sign In →"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider">or continue with</div>

            {/* Social */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {[
                { icon: "G", label: "Google",   color: "#ea4335", bg: "#fff" },
                { icon: "f", label: "Facebook", color: "#1877f2", bg: "#fff" },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  style={{
                    flex: 1,
                    background: s.bg,
                    border: "1.5px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    color: "var(--text-2)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all var(--t)",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  <span style={{ fontWeight: 800, color: s.color, fontSize: 15 }}>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>

            {/* By continuing */}
            <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>
              By continuing, you agree to ShopKart&apos;s{" "}
              <a href="#" style={{ color: "var(--primary)" }}>Terms of Use</a> and{" "}
              <a href="#" style={{ color: "var(--primary)" }}>Privacy Policy</a>.
            </p>

            <p className="auth-link-row">
              New to ShopKart?{" "}
              <Link href="/register">Create an account →</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

Login.noFooter = true;
