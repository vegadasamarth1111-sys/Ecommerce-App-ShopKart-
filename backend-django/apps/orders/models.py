"""
Order models.

Order — one per checkout, belongs to a user.
OrderItem — one row per product line, stores price_at_purchase so
            historical records are never affected by future price changes.
"""

from django.conf import settings
from django.db import models
from apps.products.models import Product


class Order(models.Model):
    """A placed order."""

    class Status(models.TextChoices):
        PENDING    = "pending",    "Pending"
        CONFIRMED  = "confirmed",  "Confirmed"
        PROCESSING = "processing", "Processing"
        SHIPPED    = "shipped",    "Shipped"
        DELIVERED  = "delivered",  "Delivered"
        CANCELLED  = "cancelled",  "Cancelled"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)

    # Shipping address snapshot (stored as flat fields, not FK,
    # so orders survive address changes)
    shipping_full_name  = models.CharField(max_length=200)
    shipping_address    = models.CharField(max_length=255)
    shipping_city       = models.CharField(max_length=100)
    shipping_state      = models.CharField(max_length=100)
    shipping_pincode    = models.CharField(max_length=10)
    shipping_phone      = models.CharField(max_length=15)

    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.pk} — {self.user.email} ({self.status})"


class OrderItem(models.Model):
    """A line item inside an order."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        related_name="order_items",
    )
    product_name = models.CharField(max_length=255)  # snapshot
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "order_items"

    def __str__(self):
        return f"{self.quantity} × {self.product_name}"

    @property
    def subtotal(self):
        return self.price_at_purchase * self.quantity
