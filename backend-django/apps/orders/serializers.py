from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = (
            "id", "product", "product_name",
            "quantity", "price_at_purchase", "subtotal",
        )


class OrderSerializer(serializers.ModelSerializer):
    """Full order — used for detail and list views."""

    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    customer_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = Order
        fields = (
            "id", "customer_email", "status", "status_display",
            "total_amount", "items",
            "shipping_full_name", "shipping_address", "shipping_city",
            "shipping_state", "shipping_pincode", "shipping_phone",
            "notes", "created_at", "updated_at",
        )
        read_only_fields = (
            "id", "total_amount", "status",
            "created_at", "updated_at", "customer_email",
        )


class PlaceOrderSerializer(serializers.Serializer):
    """Validates the shipping address on checkout."""

    full_name = serializers.CharField(max_length=200)
    address   = serializers.CharField(max_length=255)
    city      = serializers.CharField(max_length=100)
    state     = serializers.CharField(max_length=100)
    pincode   = serializers.CharField(max_length=10)
    phone     = serializers.CharField(max_length=15)
    notes     = serializers.CharField(required=False, allow_blank=True, default="")


class UpdateOrderStatusSerializer(serializers.Serializer):
    """Admin: update order status."""

    status = serializers.ChoiceField(choices=Order.Status.choices)
