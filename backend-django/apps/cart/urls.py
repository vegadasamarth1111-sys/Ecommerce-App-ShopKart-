from django.urls import path
from .views import (
    CartView,
    AddToCartView,
    UpdateCartItemView,
    RemoveCartItemView,
    ClearCartView,
)

app_name = "cart"

urlpatterns = [
    # GET    /api/cart/             — view cart
    path("",             CartView.as_view(),           name="cart"),

    # POST   /api/cart/add/         — add item
    path("add/",         AddToCartView.as_view(),      name="add"),

    # PUT    /api/cart/items/<id>/  — update quantity
    path("items/<int:pk>/",  UpdateCartItemView.as_view(), name="update-item"),

    # DELETE /api/cart/items/<id>/  — remove item
    path("items/<int:pk>/remove/", RemoveCartItemView.as_view(), name="remove-item"),

    # DELETE /api/cart/clear/       — clear cart
    path("clear/",       ClearCartView.as_view(),      name="clear"),
]
