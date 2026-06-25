import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import api from "../lib/api";

// Icons
const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
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

function getPasswordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "var(--danger)", "#f39c12", "var(--accent)", "#27ae60"];

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) { setError("Please accept the Terms of Service to continue."); return; }
    setLoading(true);
    setError("");
    try {
      const nameParts = form.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName  = nameParts.slice(1).join(" ") || nameParts[0] || "";
      const username  = form.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");

      const payload = {
        username,
        first_name: firstName,
        last_name: lastName,
        email: form.email,
        password: form.password,
        password2: form.password,
      };

      const res = await api.post("/api/auth/register/", payload);
      const token = res.data?.data?.tokens?.access;
      localStorage.setItem("token", token);
      localStorage.setItem("role", res.data?.data?.user?.role || "customer");
      localStorage.setItem("name", form.name);
      router.push("/");
    } catch (err) {
      const data = err.response?.data;
      const detail = data?.errors
        ? Object.values(data.errors).flat().join(" ")
        : data?.message || "Registration failed. Please try again.";
      setError(detail);
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Create Account — ShopKart</title>
        <meta name="description" content="Create your free ShopKart account and start shopping today." />
      </Head>

      <div className="auth-page">
        {/* Left panel */}
        <div className="auth-split-left" style={{ background: "linear-gradient(160deg, #fb641b 0%, #e05512 100%)" }}>
          <div className="auth-brand">🛒 ShopKart</div>
          <p className="auth-brand-tagline">
            Join millions of happy shoppers.<br />
            New member? Get 20% off your first order!
          </p>

          {[
            { icon: "🎁", title: "20% First-Order Discount", desc: "Use code WELCOME20 at checkout" },
            { icon: "🚚", title: "Free Delivery", desc: "On all orders above ₹499" },
            { icon: "⭐", title: "Exclusive Member Deals", desc: "Early access to sales and offers" },
            { icon: "🔔", title: "Order Tracking", desc: "Real-time updates on your orders" },
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

        {/* Right form */}
        <div className="auth-split-right">
          <div className="auth-card">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join ShopKart today — it&apos;s free!</p>

            {error && (
              <div className="form-error">
                <AlertIcon /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Full name */}
              <div className="form-group">
                <label className="form-label" htmlFor="register-name">Full Name</label>
                <div className="form-input-wrap">
                  <span className="form-input-icon"><UserIcon /></span>
                  <input
                    id="register-name"
                    type="text"
                    className="form-input"
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={set("name")}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="register-email">Email Address</label>
                <div className="form-input-wrap">
                  <span className="form-input-icon"><MailIcon /></span>
                  <input
                    id="register-email"
                    type="email"
                    className="form-input"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={set("email")}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="register-password">Password</label>
                <div className="form-input-wrap">
                  <span className="form-input-icon"><LockIcon /></span>
                  <input
                    id="register-password"
                    type={showPass ? "text" : "password"}
                    className="form-input"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={set("password")}
                    required
                    minLength={6}
                    autoComplete="new-password"
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

                {/* Password strength bars */}
                {form.password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            background: i < strength ? STRENGTH_COLORS[strength] : "var(--border)",
                            transition: "background 0.3s",
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: STRENGTH_COLORS[strength], marginTop: 4, fontWeight: 600 }}>
                      {STRENGTH_LABELS[strength]} password
                    </div>
                  </div>
                )}
              </div>

              {/* Terms */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 16 }}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ accentColor: "var(--secondary)", marginTop: 2, width: 14, height: 14, flexShrink: 0 }}
                />
                <label htmlFor="terms" style={{ fontSize: 12.5, color: "var(--text-3)", lineHeight: 1.5, cursor: "pointer" }}>
                  I agree to the{" "}
                  <a href="#" style={{ color: "var(--primary)", fontWeight: 600 }}>Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" style={{ color: "var(--primary)", fontWeight: 600 }}>Privacy Policy</a>
                </label>
              </div>

              <button id="register-submit" type="submit" className="btn-auth" disabled={loading}>
                {loading ? (
                  <><div className="spinner" /> Creating account…</>
                ) : (
                  "Create Account →"
                )}
              </button>
            </form>

            {/* Member benefits */}
            <div style={{
              marginTop: 18,
              padding: "12px 14px",
              background: "#fff8f3",
              borderRadius: "var(--radius-sm)",
              border: "1px solid #fde0cc",
            }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--secondary)", marginBottom: 8 }}>
                🎁 Member Benefits
              </div>
              {["20% off your first order", "Free delivery on ₹499+", "Exclusive member-only deals"].map((b) => (
                <div key={b} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-2)", marginBottom: 4 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>✓</span> {b}
                </div>
              ))}
            </div>

            <p className="auth-link-row">
              Already have an account?{" "}
              <Link href="/login">Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

Register.noFooter = true;
