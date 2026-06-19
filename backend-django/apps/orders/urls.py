from django.urls import path
from .views import (
    PlaceOrderView,
    MyOrderListView,
    MyOrderDetailView,
    AdminOrderListView,
    AdminOrderDetailView,
    AdminUpdateOrderStatusView,
)

app_name = "orders"

urlpatterns = [
    # POST /api/orders/          — place order from cart
    path("",              PlaceOrderView.as_view(),          name="place"),

    # GET  /api/orders/my/       — my order list
    path("my/",           MyOrderListView.as_view(),         name="my-list"),

    # GET  /api/orders/my/<id>/  — my order detail
    path("my/<int:pk>/",  MyOrderDetailView.as_view(),       name="my-detail"),

    # Admin
    # GET  /api/orders/admin/              — all orders
    path("admin/",        AdminOrderListView.as_view(),      name="admin-list"),

    # GET  /api/orders/admin/<id>/         — order detail
    path("admin/<int:pk>/", AdminOrderDetailView.as_view(), name="admin-detail"),

    # PUT  /api/orders/admin/<id>/status/  — update status
    path("admin/<int:pk>/status/", AdminUpdateOrderStatusView.as_view(), name="admin-status"),
]
