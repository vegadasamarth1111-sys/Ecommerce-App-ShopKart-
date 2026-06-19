"""
Custom User model.

Extends Django's AbstractUser so we keep all built-in auth goodness
(password hashing, permissions, admin integration) while adding:
  - phone number
  - role (customer / admin)
  - address fields
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended user model for the ShopKart platform."""

    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        ADMIN = "admin", "Admin"

    # Extra fields on top of AbstractUser (which already has
    # username, email, first_name, last_name, is_staff, etc.)
    phone = models.CharField(max_length=15, blank=True, default="")
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.CUSTOMER,
    )
    address_line = models.CharField(max_length=255, blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    state = models.CharField(max_length=100, blank=True, default="")
    pincode = models.CharField(max_length=10, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    email = models.EmailField(unique=True)  # override AbstractUser to enforce uniqueness

    # Use email as the login identifier
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name", "last_name"]

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.get_full_name()} <{self.email}>"

    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN or self.is_staff
