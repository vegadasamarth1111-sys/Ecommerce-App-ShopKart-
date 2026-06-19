"""
Product views — public catalog and admin CRUD.

Public endpoints (no auth required):
    GET  /api/products/              — list with search + filters + pagination
    GET  /api/products/<id>/         — product detail
    GET  /api/products/categories/   — all categories

Admin endpoints (is_staff or role=admin required):
    POST   /api/products/admin/             — create product
    PUT    /api/products/admin/<id>/        — update product
    DELETE /api/products/admin/<id>/        — delete product
    POST   /api/products/admin/categories/  — create category
    PUT    /api/products/admin/categories/<id>/  — update category
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from utils.responses import success, error
from utils.pagination import StandardPagination
from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductWriteSerializer,
)
from .filters import ProductFilter


def is_admin(user):
    return user.is_authenticated and (user.is_staff or user.role == "admin")


# ─── Public — Categories ───────────────────────────────────────────────────────

class CategoryListView(APIView):
    """GET /api/products/categories/ — list all active categories."""

    permission_classes = [AllowAny]

    def get(self, request):
        cats = Category.objects.filter(is_active=True)
        serializer = CategorySerializer(cats, many=True, context={"request": request})
        return success(data=serializer.data, message="Categories fetched.")


# ─── Public — Product List ─────────────────────────────────────────────────────

class ProductListView(APIView):
    """
    GET /api/products/

    Query params:
        search=<keyword>        searches name and description
        category=<id>
        category_slug=<slug>
        min_price=<n>
        max_price=<n>
        in_stock=true
        ordering=price | -price | created_at | name
        page=<n>
        page_size=<n>           default 20, max 100
    """

    permission_classes = [AllowAny]

    def get(self, request):
        queryset = Product.objects.filter(is_active=True).select_related("category")

        # Search
        search_term = request.query_params.get("search", "").strip()
        if search_term:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(name__icontains=search_term) | Q(description__icontains=search_term)
            )

        # Filters
        product_filter = ProductFilter(request.query_params, queryset=queryset)
        queryset = product_filter.qs

        # Ordering
        ordering = request.query_params.get("ordering", "-created_at")
        allowed_orderings = {"price", "-price", "name", "-name", "created_at", "-created_at"}
        if ordering in allowed_orderings:
            queryset = queryset.order_by(ordering)

        # Pagination
        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = ProductListSerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)


# ─── Public — Product Detail ───────────────────────────────────────────────────

class ProductDetailView(APIView):
    """GET /api/products/<id>/ — single product detail."""

    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            product = Product.objects.select_related("category").get(pk=pk, is_active=True)
        except Product.DoesNotExist:
            return error(message="Product not found.", status=404)

        serializer = ProductDetailSerializer(product, context={"request": request})
        return success(data=serializer.data)


# ─── Admin — Product CRUD ──────────────────────────────────────────────────────

class AdminProductListCreateView(APIView):
    """
    GET  /api/products/admin/  — list all products (including inactive)
    POST /api/products/admin/  — create a new product
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        if not is_admin(request.user):
            return error(message="Admin access required.", status=403)
        products = Product.objects.all().select_related("category")
        serializer = ProductListSerializer(products, many=True, context={"request": request})
        return success(data=serializer.data, message=f"{products.count()} products found.")

    def post(self, request):
        if not is_admin(request.user):
            return error(message="Admin access required.", status=403)
        serializer = ProductWriteSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return error(message="Validation failed.", errors=serializer.errors)
        product = serializer.save()
        return success(
            data=ProductDetailSerializer(product, context={"request": request}).data,
            message="Product created successfully.",
            status=201,
        )


class AdminProductDetailView(APIView):
    """
    GET    /api/products/admin/<id>/  — get any product
    PUT    /api/products/admin/<id>/  — update product
    DELETE /api/products/admin/<id>/  — delete product
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def _get_product(self, pk):
        try:
            return Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return None

    def get(self, request, pk):
        if not is_admin(request.user):
            return error(message="Admin access required.", status=403)
        product = self._get_product(pk)
        if not product:
            return error(message="Product not found.", status=404)
        return success(data=ProductDetailSerializer(product, context={"request": request}).data)

    def put(self, request, pk):
        if not is_admin(request.user):
            return error(message="Admin access required.", status=403)
        product = self._get_product(pk)
        if not product:
            return error(message="Product not found.", status=404)
        serializer = ProductWriteSerializer(
            product, data=request.data, partial=True, context={"request": request}
        )
        if not serializer.is_valid():
            return error(message="Validation failed.", errors=serializer.errors)
        product = serializer.save()
        return success(
            data=ProductDetailSerializer(product, context={"request": request}).data,
            message="Product updated successfully.",
        )

    def delete(self, request, pk):
        if not is_admin(request.user):
            return error(message="Admin access required.", status=403)
        product = self._get_product(pk)
        if not product:
            return error(message="Product not found.", status=404)
        product_name = product.name
        product.delete()
        return success(message=f'"{product_name}" deleted successfully.')


# ─── Admin — Category CRUD ─────────────────────────────────────────────────────

class AdminCategoryListCreateView(APIView):
    """POST /api/products/admin/categories/ — create category."""

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        if not is_admin(request.user):
            return error(message="Admin access required.", status=403)
        serializer = CategorySerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return error(message="Validation failed.", errors=serializer.errors)
        category = serializer.save()
        return success(
            data=CategorySerializer(category, context={"request": request}).data,
            message="Category created.",
            status=201,
        )


class AdminCategoryDetailView(APIView):
    """PUT/DELETE /api/products/admin/categories/<id>/"""

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def put(self, request, pk):
        if not is_admin(request.user):
            return error(message="Admin access required.", status=403)
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return error(message="Category not found.", status=404)
        serializer = CategorySerializer(
            category, data=request.data, partial=True, context={"request": request}
        )
        if not serializer.is_valid():
            return error(message="Validation failed.", errors=serializer.errors)
        serializer.save()
        return success(data=serializer.data, message="Category updated.")

    def delete(self, request, pk):
        if not is_admin(request.user):
            return error(message="Admin access required.", status=403)
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return error(message="Category not found.", status=404)
        name = category.name
        category.delete()
        return success(message=f'Category "{name}" deleted.')
