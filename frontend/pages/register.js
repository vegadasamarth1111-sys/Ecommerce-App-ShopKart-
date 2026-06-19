import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import api from "../lib/api";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await api.post("/api/auth/register", form);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", "customer");
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Create Account — ShopKart</title>
        <meta name="description" content="Create your ShopKart account to start shopping." />
      </Head>
      <div className="form-card">
        <h2>Create Account 🎉</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          {[
            ["name",     "Full Name", "text"],
            ["email",    "Email",     "email"],
            ["password", "Password",  "password"],
          ].map(([key, label, type]) => (
            <div className="mb-3" key={key}>
              <label className="form-label fw-semibold">{label}</label>
              <input id={`register-${key}`} type={type} className="form-control"
                value={form[key]} onChange={set(key)} required
                minLength={key === "password" ? 6 : undefined}
              />
            </div>
          ))}
          <button id="register-submit" type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>
        <p className="text-center mt-3 text-muted-custom">
          Already have an account? <Link href="/login" className="text-primary-color fw-semibold">Log in</Link>
        </p>
      </div>
    </>
  );
}
