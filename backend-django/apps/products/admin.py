from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ("name", "slug", "is_active", "created_at")
    list_filter   = ("is_active",)
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display  = ("name", "category", "price", "stock_qty", "is_active", "created_at")
    list_filter   = ("category", "is_active")
    search_fields = ("name", "description")
    list_editable = ("price", "stock_qty", "is_active")
    readonly_fields = ("slug", "created_at", "updated_at")
