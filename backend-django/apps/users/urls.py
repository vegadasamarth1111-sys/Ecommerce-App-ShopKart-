"""
URL patterns for the users / auth app.

Base: /api/auth/
"""

from django.urls import path
from .views import RegisterView, LoginView, LogoutView, ProfileView, refresh_token_view

app_name = "auth"

urlpatterns = [
    # POST   /api/auth/register/        — create account + receive tokens
    path("register/",      RegisterView.as_view(),     name="register"),

    # POST   /api/auth/login/           — email + password → JWT pair
    path("login/",         LoginView.as_view(),        name="login"),

    # POST   /api/auth/logout/          — blacklist refresh token
    path("logout/",        LogoutView.as_view(),       name="logout"),

    # POST   /api/auth/token/refresh/   — swap refresh → new access token
    path("token/refresh/", refresh_token_view,         name="token-refresh"),

    # GET    /api/auth/me/              — get profile
    # PUT    /api/auth/me/              — update profile
    path("me/",            ProfileView.as_view(),      name="profile"),
]
