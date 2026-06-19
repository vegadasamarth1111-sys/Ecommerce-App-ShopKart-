"""
Root URL configuration for the ShopKart ecommerce API.

All API endpoints are namespaced under /api/
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django admin panel
    path("admin/", admin.site.urls),

    # API routes — all namespaced under /api/
    path("api/auth/",     include("apps.users.urls",    namespace="auth")),
    path("api/products/", include("apps.products.urls", namespace="products")),
    path("api/cart/",     include("apps.cart.urls",     namespace="cart")),
    path("api/orders/",   include("apps.orders.urls",   namespace="orders")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
