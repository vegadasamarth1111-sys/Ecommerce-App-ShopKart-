"""
Cart views.

All endpoints require authentication (JWT Bearer token).

GET    /api/cart/                  — view cart contents
POST   /api/cart/add/              — add item (or increment if already there)
PUT    /api/cart/items/<id>/       — update quantity of a specific cart item
DELETE /api/cart/items/<id>/       — remove a specific cart item
DELETE /api/cart/clear/            — empty the entire cart
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.products.models import Product
from utils.responses import success, error
from .models import Cart, CartItem
from .serializers import (
    CartSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer,
)


def get_or_create_cart(user):
    """Return the user's cart, creating one if it doesn't exist yet."""
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


# ─── GET /api/cart/ ───────────────────────────────────────────────────────────

class CartView(APIView):
    """View the logged-in user's cart with all items and totals."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart = get_or_create_cart(request.user)
        serializer = CartSerializer(cart, context={"request": request})
        return success(data=serializer.data, message="Cart fetched.")


# ─── POST /api/cart/add/ ──────────────────────────────────────────────────────

class AddToCartView(APIView):
    """
    Add a product to the cart.

    If the product is already in the cart, its quantity is incremented.
    If the requested quantity exceeds available stock, an error is returned.

    Body: { "product_id": 5, "quantity": 2 }
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        if not serializer.is_valid():
            return error(message="Invalid data.", errors=serializer.errors)

        product_id = serializer.validated_data["product_id"]
        quantity   = serializer.validated_data["quantity"]

        # Check product exists and is active
        try:
            product = Product.objects.get(pk=product_id, is_active=True)
        except Product.DoesNotExist:
            return error(message="Product not found or unavailable.", status=404)

        # Check stock
        if product.stock_qty < quantity:
            return error(
                message=f"Only {product.stock_qty} unit(s) available in stock.",
                status=400,
            )

        cart = get_or_create_cart(request.user)

        # If item already in cart, just increment quantity
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product=product
        )
        if not created:
            new_qty = cart_item.quantity + quantity
            if new_qty > product.stock_qty:
                return error(
                    message=f"Cannot add more — only {product.stock_qty} unit(s) in stock.",
                    status=400,
                )
            cart_item.quantity = new_qty
            cart_item.save()
        else:
            cart_item.quantity = quantity
            cart_item.save()

        cart.refresh_from_db()
        serializer = CartSerializer(cart, context={"request": request})
        return success(
            data=serializer.data,
            message=f'"{product.name}" added to cart.',
            status=201 if created else 200,
        )


# ─── PUT /api/cart/items/<id>/ ────────────────────────────────────────────────

class UpdateCartItemView(APIView):
    """
    Update the quantity of a specific cart item.

    Body: { "quantity": 3 }
    """

    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            cart_item = CartItem.objects.select_related("product", "cart__user").get(
                pk=pk, cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return error(message="Cart item not found.", status=404)

        serializer = UpdateCartItemSerializer(data=request.data)
        if not serializer.is_valid():
            return error(message="Invalid data.", errors=serializer.errors)

        new_qty = serializer.validated_data["quantity"]
        if new_qty > cart_item.product.stock_qty:
            return error(
                message=f"Only {cart_item.product.stock_qty} unit(s) available.",
                status=400,
            )

        cart_item.quantity = new_qty
        cart_item.save()

        cart = cart_item.cart
        return success(
            data=CartSerializer(cart, context={"request": request}).data,
            message="Cart updated.",
        )


# ─── DELETE /api/cart/items/<id>/ ─────────────────────────────────────────────

class RemoveCartItemView(APIView):
    """Remove a single item from the cart."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            cart_item = CartItem.objects.select_related("product", "cart__user").get(
                pk=pk, cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return error(message="Cart item not found.", status=404)

        product_name = cart_item.product.name
        cart = cart_item.cart
        cart_item.delete()

        return success(
            data=CartSerializer(cart, context={"request": request}).data,
            message=f'"{product_name}" removed from cart.',
        )


# ─── DELETE /api/cart/clear/ ──────────────────────────────────────────────────

class ClearCartView(APIView):
    """Remove all items from the cart."""

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart = get_or_create_cart(request.user)
        deleted_count = cart.items.count()
        cart.items.all().delete()
        return success(message=f"Cart cleared. {deleted_count} item(s) removed.")
