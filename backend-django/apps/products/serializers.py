from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(
        source="products.count", read_only=True
    )

    class Meta:
        model = Category
        fields = (
            "id", "name", "slug", "description",
            "image", "is_active", "product_count",
        )
        read_only_fields = ("id", "slug")


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views — no heavy description."""

    category_name = serializers.CharField(source="category.name", read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug",
            "category", "category_name",
            "price", "compare_price", "discount_percent",
            "stock_qty", "in_stock",
            "image", "is_active",
            "created_at",
        )


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for the product detail page."""

    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True
    )
    in_stock = serializers.BooleanField(read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "description",
            "category", "category_id",
            "price", "compare_price", "discount_percent",
            "stock_qty", "in_stock",
            "image", "is_active",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "slug", "created_at", "updated_at")


class ProductWriteSerializer(serializers.ModelSerializer):
    """Used by admin to create / update products."""

    class Meta:
        model = Product
        fields = (
            "name", "description", "category",
            "price", "compare_price",
            "stock_qty", "image", "is_active",
        )
