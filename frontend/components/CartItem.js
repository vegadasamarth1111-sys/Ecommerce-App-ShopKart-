import Link from "next/link";
import api from "../lib/api";

const MinusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export default function CartItem({ item, onUpdate }) {
  const updateQty = async (delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return removeItem();
    try {
      await api.post(`/api/cart/update?item_id=${item.id}&quantity=${newQty}`);
      onUpdate?.();
    } catch {}
  };

  const removeItem = async () => {
    try {
      await api.delete(`/api/cart/remove/${item.id}`);
      onUpdate?.();
    } catch {}
  };

  const imgSrc = item.product?.image_url ||
    `https://picsum.photos/seed/${item.product?.id || item.product_id}/200/200`;

  const lineTotal = Number(item.product?.price || 0) * item.quantity;
  const productId = item.product?.id || item.product_id;

  return (
    <div className="cart-item">
      {/* Image */}
      <Link href={`/products/${productId}`}>
        <img
          className="cart-item-img"
          src={imgSrc}
          alt={item.product?.name || "Product"}
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/90x90/f1f3f6/2874f0?text=P`;
          }}
        />
      </Link>

      {/* Body */}
      <div className="cart-item-body">
        <Link href={`/products/${productId}`}>
          <div className="cart-item-name">{item.product?.name || "Product"}</div>
        </Link>
        <div className="cart-item-seller">Seller: ShopKart Official Store</div>
        <div className="cart-item-price">
          ₹{Number(item.product?.price || 0).toLocaleString("en-IN")}
        </div>

        {/* Actions */}
        <div className="cart-item-actions">
          {/* Qty stepper */}
          <div className="qty-stepper">
            <button
              className="qty-btn"
              onClick={() => updateQty(-1)}
              aria-label="Decrease quantity"
            >
              <MinusIcon />
            </button>
            <span className="qty-val">{item.quantity}</span>
            <button
              className="qty-btn"
              onClick={() => updateQty(1)}
              aria-label="Increase quantity"
              disabled={item.quantity >= (item.product?.stock_qty || 99)}
            >
              <PlusIcon />
            </button>
          </div>

          <button className="cart-item-remove" onClick={removeItem} aria-label="Remove">
            REMOVE
          </button>

          <button
            className="cart-item-remove"
            style={{ color: "var(--primary)", borderBottomColor: "transparent" }}
            onClick={() => {}}
            aria-label="Save for later"
          >
            SAVE FOR LATER
          </button>
        </div>
      </div>

      {/* Line total */}
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 800,
        fontSize: "1rem",
        color: "var(--text)",
        flexShrink: 0,
        minWidth: 80,
        textAlign: "right",
        padding: "2px 0",
      }}>
        ₹{lineTotal.toLocaleString("en-IN")}
      </div>
    </div>
  );
}
