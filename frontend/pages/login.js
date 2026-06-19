import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import api from "../lib/api";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await api.post("/api/auth/login", form);
      localStorage.setItem("token", res.data.access_token);
      // Decode role from JWT payload
      const payload = JSON.parse(atob(res.data.access_token.split(".")[1]));
      localStorage.setItem("role", payload.role);
      router.push(payload.role === "admin" ? "/admin" : "/");
    } catch {
      setError("Invalid email or password.");
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Login — ShopKart</title>
        <meta name="description" content="Log in to your ShopKart account." />
      </Head>
      <div className="form-card">
        <h2>Welcome back 👋</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input id="login-email" type="email" className="form-control"
              value={form.email} onChange={set("email")} required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input id="login-password" type="password" className="form-control"
              value={form.password} onChange={set("password")} required />
          </div>
          <button id="login-submit" type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>
        <p className="text-center mt-3 text-muted-custom">
          Don't have an account? <Link href="/register" className="text-primary-color fw-semibold">Sign up</Link>
        </p>
      </div>
    </>
  );
}
