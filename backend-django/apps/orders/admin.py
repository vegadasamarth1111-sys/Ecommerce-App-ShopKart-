from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product_name", "quantity", "price_at_purchase", "subtotal")
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display  = ("id", "user", "status", "total_amount", "created_at")
    list_filter   = ("status",)
    search_fields = ("user__email", "shipping_full_name", "shipping_phone")
    list_editable = ("status",)
    readonly_fields = ("total_amount", "created_at", "updated_at")
    inlines = [OrderItemInline]
    ordering = ("-created_at",)
