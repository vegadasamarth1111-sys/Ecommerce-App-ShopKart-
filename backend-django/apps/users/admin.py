from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for the extended User model."""

    list_display = ("email", "username", "get_full_name", "role", "is_staff", "date_joined")
    list_filter  = ("role", "is_staff", "is_active")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("-date_joined",)

    fieldsets = BaseUserAdmin.fieldsets + (
        ("Additional Info", {
            "fields": ("phone", "role", "address_line", "city", "state", "pincode")
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Additional Info", {
            "fields": ("email", "first_name", "last_name", "phone", "role")
        }),
    )
