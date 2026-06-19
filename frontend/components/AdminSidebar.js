import Link from "next/link";
import { useRouter } from "next/router";

const links = [
  { href: "/admin",          label: "📊 Dashboard" },
  { href: "/admin/products", label: "📦 Products" },
  { href: "/admin/orders",   label: "🧾 Orders" },
];

export default function AdminSidebar() {
  const router = useRouter();
  return (
    <aside className="admin-sidebar d-none d-md-block">
      <div className="brand">⚙ Admin Panel</div>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`admin-nav-link ${router.pathname === l.href ? "active" : ""}`}
        >
          {l.label}
        </Link>
      ))}
      <hr style={{ borderColor: "#334155", marginTop: "auto" }} />
      <Link href="/" className="admin-nav-link">← Back to Store</Link>
    </aside>
  );
}
