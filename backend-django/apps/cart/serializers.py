from decimal import Decimal
from rest_framework import serializers
from apps.products.serializers import ProductListSerializer
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    """Serializes a cart line item with full product info and subtotal."""

    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = CartItem
        fields = ("id", "product", "product_id", "quantity", "subtotal", "added_at")
        read_only_fields = ("id", "added_at")

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value


class CartSerializer(serializers.ModelSerializer):
    """Full cart with items, total count, and total price."""

    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Cart
        fields = ("id", "items", "total_items", "total_price", "updated_at")


class AddToCartSerializer(serializers.Serializer):
    """Validates an add-to-cart request."""

    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(default=1, min_value=1)


class UpdateCartItemSerializer(serializers.Serializer):
    """Validates a quantity update request."""

    quantity = serializers.IntegerField(min_value=1)
