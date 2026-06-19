import api from "../lib/api";

export default function CartItem({ item, onUpdate }) {
  const updateQty = async (newQty) => {
    await api.put(`/api/cart/update/${item.product_id}?quantity=${newQty}`);
    onUpdate();
  };

  const remove = async () => {
    await api.delete(`/api/cart/remove/${item.product_id}`);
    onUpdate();
  };

  return (
    <div className="cart-item">
      <img
        src={item.image_url || `https://via.placeholder.com/70x70?text=${encodeURIComponent(item.name)}`}
        alt={item.name}
      />
      <div className="flex-grow-1">
        <div className="fw-semibold" style={{ fontSize: ".95rem" }}>{item.name}</div>
        <div className="product-price" style={{ fontSize: ".95rem" }}>₹{item.price.toFixed(2)}</div>
        <div className="qty-control mt-1">
          <button onClick={() => updateQty(item.quantity - 1)}>−</button>
          <span className="fw-bold">{item.quantity}</span>
          <button onClick={() => updateQty(item.quantity + 1)}>+</button>
        </div>
      </div>
      <div className="text-end">
        <div className="fw-bold">₹{(item.price * item.quantity).toFixed(2)}</div>
        <button
          className="btn btn-link text-danger btn-sm p-0 mt-1"
          onClick={remove}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
