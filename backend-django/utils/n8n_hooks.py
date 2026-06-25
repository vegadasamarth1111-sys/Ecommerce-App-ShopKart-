"""
n8n Webhook Integration Utilities
===================================
Call these helpers from your Django views, signals, or post-save hooks
to trigger the corresponding n8n automation workflows.

Set the following env vars in your .env file:
    N8N_BASE_URL=http://localhost:5678
    N8N_ORDER_WEBHOOK_PATH=order-placed
    N8N_LOW_STOCK_WEBHOOK_PATH=low-stock-alert
    N8N_NEW_USER_WEBHOOK_PATH=new-user-registered
    LOW_STOCK_THRESHOLD=5
"""

import logging
import threading
import requests
from decimal import Decimal
from django.conf import settings

logger = logging.getLogger(__name__)

# ─── Config (reads from Django settings / env) ────────────────────────────────

N8N_BASE_URL     = getattr(settings, "N8N_BASE_URL", "http://localhost:5678")
ORDER_PATH       = getattr(settings, "N8N_ORDER_WEBHOOK_PATH", "order-placed")
LOW_STOCK_PATH   = getattr(settings, "N8N_LOW_STOCK_WEBHOOK_PATH", "low-stock-alert")
NEW_USER_PATH    = getattr(settings, "N8N_NEW_USER_WEBHOOK_PATH", "new-user-registered")
LOW_STOCK_THRESH = getattr(settings, "LOW_STOCK_THRESHOLD", 5)


def _fire(path: str, payload: dict, timeout: int = 8) -> None:
    """
    Internal: POST payload to n8n webhook in a background thread.
    Errors are logged but NEVER bubble up to crash the main request.
    """
    url = f"{N8N_BASE_URL}/webhook/{path}"

    def _send():
        try:
            resp = requests.post(url, json=payload, timeout=timeout)
            resp.raise_for_status()
            logger.info("[n8n] ✅ %s → %s  status=%s", path, url, resp.status_code)
        except requests.RequestException as exc:
            logger.error("[n8n] ❌ %s failed: %s", path, exc)

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()


# ─── Public helpers ───────────────────────────────────────────────────────────

def notify_order_placed(order) -> None:
    """
    Call after Order + OrderItems are created and cart is cleared.
    Pass the Order model instance.

    Usage (in PlaceOrderView.post):
        from utils.n8n_hooks import notify_order_placed
        notify_order_placed(order)
    """
    user = order.user
    items = [
        {
            "product_name":      item.product_name,
            "quantity":          item.quantity,
            "price_at_purchase": str(item.price_at_purchase),
        }
        for item in order.items.all()
    ]

    payload = {
        "order_id":           order.pk,
        "user_email":         user.email,
        "user_name":          getattr(user, "first_name", "") or user.email.split("@")[0],
        "total_amount":       str(order.total_amount),
        "status":             order.status,
        "shipping_full_name": order.shipping_full_name,
        "shipping_address":   order.shipping_address,
        "shipping_city":      order.shipping_city,
        "shipping_state":     order.shipping_state,
        "shipping_pincode":   order.shipping_pincode,
        "shipping_phone":     order.shipping_phone,
        "items":              items,
    }
    _fire(ORDER_PATH, payload)


def notify_low_stock(product) -> None:
    """
    Call after stock is decremented to check and alert if below threshold.
    Pass the Product model instance.

    Usage (in PlaceOrderView, after saving stock):
        from utils.n8n_hooks import notify_low_stock
        notify_low_stock(ci.product)
    """
    if product.stock_qty <= LOW_STOCK_THRESH:
        payload = {
            "product_id":   product.pk,
            "product_name": product.name,
            "stock_qty":    product.stock_qty,
            "category":     str(product.category) if product.category else "N/A",
            "price":        str(product.price),
        }
        _fire(LOW_STOCK_PATH, payload)


def notify_new_user(user) -> None:
    """
    Call after a new user registers.
    Pass the User model instance.

    Usage (in your register/signup view):
        from utils.n8n_hooks import notify_new_user
        notify_new_user(user)
    """
    payload = {
        "email":      user.email,
        "username":   getattr(user, "username", user.email),
        "first_name": getattr(user, "first_name", ""),
        "last_name":  getattr(user, "last_name", ""),
    }
    _fire(NEW_USER_PATH, payload)
