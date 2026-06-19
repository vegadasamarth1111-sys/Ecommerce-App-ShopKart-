"""
Orders views.

Customer:
    POST /api/orders/          — place order from current cart
    GET  /api/orders/          — list own orders
    GET  /api/orders/<id>/     — own order detail

Admin:
    GET  /api/orders/admin/            — all orders
    GET  /api/orders/admin/<id>/       — any order detail
    PUT  /api/orders/admin/<id>/status/ — update order status
"""

from django.db import transaction
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.cart.models import Cart
from utils.responses import success, error
from utils.pagination import StandardPagination
from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    PlaceOrderSerializer,
    UpdateOrderStatusSerializer,
)


def is_admin(user):
    return user.is_authenticated and (user.is_staff or user.role == "admin")


# ─── POST /api/orders/ — place order ─────────────────────────────────────────

class PlaceOrderView(APIView):
    """
    Convert the user's current cart into a confirmed order.

    Validates:
        - Cart is not empty
        - All products still in stock (at required quantities)

    On success:
        - Creates Order + OrderItem rows with price snapshot
        - Decrements product stock
        - Clears the cart

    Body: { full_name, address, city, state, pincode, phone, notes? }
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PlaceOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return error(message="Invalid shipping details.", errors=serializer.errors)

        data = serializer.validated_data

        # Get cart
        try:
            cart = Cart.objects.prefetch_related("items__product").get(user=request.user)
        except Cart.DoesNotExist:
            return error(message="Your cart is empty.", status=400)

        cart_items = list(cart.items.select_related("product").all())
        if not cart_items:
            return error(message="Your cart is empty.", status=400)

        # Stock validation before any DB writes
        stock_errors = []
        for ci in cart_items:
            if not ci.product.is_active:
                stock_errors.append(f'"{ci.product.name}" is no longer available.')
            elif ci.quantity > ci.product.stock_qty:
                stock_errors.append(
                    f'"{ci.product.name}": only {ci.product.stock_qty} unit(s) in stock.'
                )
        if stock_errors:
            return error(
                message="Some items are unavailable or out of stock.",
                errors=stock_errors,
                status=400,
            )

        # Place the order atomically
        with transaction.atomic():
            total = sum(ci.product.price * ci.quantity for ci in cart_items)

            order = Order.objects.create(
                user=request.user,
                total_amount=total,
                shipping_full_name=data["full_name"],
                shipping_address=data["address"],
                shipping_city=data["city"],
                shipping_state=data["state"],
                shipping_pincode=data["pincode"],
                shipping_phone=data["phone"],
                notes=data["notes"],
            )

            for ci in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=ci.product,
                    product_name=ci.product.name,     # snapshot
                    quantity=ci.quantity,
                    price_at_purchase=ci.product.price,  # snapshot
                )
                # Decrement stock
                ci.product.stock_qty -= ci.quantity
                ci.product.save(update_fields=["stock_qty"])

            # Clear cart
            cart.items.all().delete()

        return success(
            data=OrderSerializer(order).data,
            message=f"Order #{order.pk} placed successfully.",
            status=201,
        )


# ─── GET /api/orders/ — my orders ────────────────────────────────────────────

class MyOrderListView(APIView):
    """List the logged-in user's orders, newest first."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related("items")
        paginator = StandardPagination()
        page = paginator.paginate_queryset(orders, request)
        serializer = OrderSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


# ─── GET /api/orders/<id>/ — my order detail ─────────────────────────────────

class MyOrderDetailView(APIView):
    """Single order detail — only the owner can see it."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            order = Order.objects.prefetch_related("items").get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return error(message="Order not found.", status=404)
        return success(data=OrderSerializer(order).data)


# ─── Admin: all orders ────────────────────────────────────────────────────────

class AdminOrderListView(APIView):
    """GET /api/orders/admin/ — list all orders with optional status filter."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return error(message="Admin access required.", status=403)

        orders = Order.objects.all().prefetch_related("items").select_related("user")

        # Optional filter: ?status=shipped
        status_param = request.query_params.get("status")
        if status_param:
            orders = orders.filter(status=status_param)

        paginator = StandardPagination()
        page = paginator.paginate_queryset(orders, request)
        serializer = OrderSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminOrderDetailView(APIView):
    """GET /api/orders/admin/<id>/ — any order detail for admin."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if not is_admin(request.user):
            return error(message="Admin access required.", status=403)
        try:
            order = Order.objects.prefetch_related("items").select_related("user").get(pk=pk)
        except Order.DoesNotExist:
            return error(message="Order not found.", status=404)
        return success(data=OrderSerializer(order).data)


class AdminUpdateOrderStatusView(APIView):
    """
    PUT /api/orders/admin/<id>/status/

    Body: { "status": "shipped" }
    """

    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        if not is_admin(request.user):
            return error(message="Admin access required.", status=403)

        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return error(message="Order not found.", status=404)

        serializer = UpdateOrderStatusSerializer(data=request.data)
        if not serializer.is_valid():
            return error(message="Invalid status.", errors=serializer.errors)

        old_status = order.status
        order.status = serializer.validated_data["status"]
        order.save(update_fields=["status", "updated_at"])

        return success(
            data=OrderSerializer(order).data,
            message=f"Order #{pk} status changed: {old_status} → {order.status}.",
        )
