import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    """
    Filter set for the product listing endpoint.

    Supported query params:
        ?category=1           filter by category ID
        ?category_slug=electronics  filter by category slug
        ?min_price=100        price >= min_price
        ?max_price=500        price <= max_price
        ?in_stock=true        only show in-stock items
        ?is_active=true       only show active products
    """

    category = django_filters.NumberFilter(field_name="category__id")
    category_slug = django_filters.CharFilter(field_name="category__slug", lookup_expr="iexact")
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    in_stock = django_filters.BooleanFilter(method="filter_in_stock")

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock_qty__gt=0)
        return queryset.filter(stock_qty=0)

    class Meta:
        model = Product
        fields = ["category", "category_slug", "min_price", "max_price", "is_active"]
