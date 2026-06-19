import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");
    if (token) setUser({ role });
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top px-3 px-md-4">
      <div className="container-fluid">
        {/* Brand */}
        <Link href="/" className="navbar-brand">
          🛒 ShopKart
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link href="/products" className="nav-link">Products</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <Link href="/cart" className="btn btn-outline-primary btn-sm">
                  🛍 Cart
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="btn btn-outline-warning btn-sm">
                    Admin
                  </Link>
                )}
                <button className="btn btn-outline-danger btn-sm" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-outline-primary btn-sm">Login</Link>
                <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
