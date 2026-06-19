"""
Cart models.

Each user has one Cart (OneToOne).
Cart items live in CartItem — one row per unique product.
"""

from django.conf import settings
from django.db import models
from apps.products.models import Product


class Cart(models.Model):
    """One cart per user, created on first add-to-cart."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "carts"

    def __str__(self):
        return f"Cart of {self.user.email}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def total_price(self):
        return sum(item.subtotal for item in self.items.all())


class CartItem(models.Model):
    """A single line item inside a cart."""

    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "cart_items"
        unique_together = ("cart", "product")   # one row per product per cart

    def __str__(self):
        return f"{self.quantity} × {self.product.name}"

    @property
    def subtotal(self):
        return self.product.price * self.quantity
