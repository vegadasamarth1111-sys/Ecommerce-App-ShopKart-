import Link from "next/link";

const footerLinks = {
  "About": [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Blog", href: "#" },
  ],
  "Help": [
    { label: "FAQs", href: "#" },
    { label: "Track Order", href: "/orders" },
    { label: "Returns", href: "#" },
    { label: "Contact Us", href: "#" },
  ],
  "Policy": [
    { label: "Return Policy", href: "#" },
    { label: "Terms of Use", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Sitemap", href: "#" },
  ],
  "Social": [
    { label: "Facebook", href: "#" },
    { label: "Twitter / X", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "YouTube", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ background: "#1a1a2e", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="footer-top">
          {/* Brand col */}
          <div className="footer-brand-col">
            <div className="footer-logo">🛒 ShopKart</div>
            <p className="footer-desc">
              India's favourite online shopping destination. Discover millions of products at unbeatable prices with fast delivery across India.
            </p>
            <div className="footer-social">
              {[
                { icon: "𝕏", label: "Twitter" },
                { icon: "in", label: "LinkedIn" },
                { icon: "f",  label: "Facebook" },
                { icon: "▶",  label: "YouTube" },
              ].map((s) => (
                <a key={s.label} href="#" aria-label={s.label}>{s.icon}</a>
              ))}
            </div>

            {/* App badges */}
            <div className="footer-app-badges" style={{ marginTop: 20 }}>
              <div className="footer-app-badge">
                <span className="badge-icon">📱</span>
                <div className="badge-text">
                  <small>Download on the</small>
                  <strong>App Store</strong>
                </div>
              </div>
              <div className="footer-app-badge">
                <span className="badge-icon">🤖</span>
                <div className="badge-text">
                  <small>Get it on</small>
                  <strong>Google Play</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <div className="footer-col-title">{heading}</div>
              <ul className="footer-col-links">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom-outer">
        <div className="footer-bottom container">
          <span className="footer-copyright">
            © {new Date().getFullYear()} ShopKart Pvt. Ltd. All rights reserved.
          </span>
          <div className="footer-payment-badges">
            {["Visa", "Mastercard", "UPI", "PayPal", "NetBanking"].map((p) => (
              <span key={p} className="footer-payment-badge">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
