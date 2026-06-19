"""
URL patterns for the products app.

Base: /api/products/
"""

from django.urls import path
from .views import (
    CategoryListView,
    ProductListView,
    ProductDetailView,
    AdminProductListCreateView,
    AdminProductDetailView,
    AdminCategoryListCreateView,
    AdminCategoryDetailView,
)

app_name = "products"

urlpatterns = [
    # ── Public ────────────────────────────────────────────────────────
    # GET    /api/products/                      — list (search, filter, paginate)
    path("",                   ProductListView.as_view(),           name="list"),

    # GET    /api/products/categories/           — all active categories
    path("categories/",        CategoryListView.as_view(),          name="category-list"),

    # GET    /api/products/<id>/                 — product detail
    path("<int:pk>/",          ProductDetailView.as_view(),         name="detail"),

    # ── Admin ─────────────────────────────────────────────────────────
    # GET    /api/products/admin/                — all products (incl. inactive)
    # POST   /api/products/admin/                — create product
    path("admin/",             AdminProductListCreateView.as_view(), name="admin-list"),

    # GET    /api/products/admin/<id>/           — admin product detail
    # PUT    /api/products/admin/<id>/           — update
    # DELETE /api/products/admin/<id>/           — delete
    path("admin/<int:pk>/",    AdminProductDetailView.as_view(),    name="admin-detail"),

    # POST   /api/products/admin/categories/     — create category
    path("admin/categories/",  AdminCategoryListCreateView.as_view(), name="admin-cat-list"),

    # PUT    /api/products/admin/categories/<id>/  — update category
    # DELETE /api/products/admin/categories/<id>/  — delete category
    path("admin/categories/<int:pk>/", AdminCategoryDetailView.as_view(), name="admin-cat-detail"),
]
