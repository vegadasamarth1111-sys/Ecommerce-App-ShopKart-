"""
Auth views — register, login, logout, token refresh, user profile.

All responses use the shared success() / error() helpers so every
endpoint returns the same JSON shape.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from utils.responses import success, error
from .serializers import (
    RegisterSerializer,
    CustomTokenSerializer,
    UserProfileSerializer,
    UpdateProfileSerializer,
)


# ─── POST /api/auth/register/ ─────────────────────────────────────────────────

class RegisterView(APIView):
    """
    Register a new customer account.

    Request body:
        username, email, first_name, last_name, password, password2, phone (opt)

    Response 201:
        { "success": true, "message": "Account created successfully.", "data": { user, tokens } }
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return error(
                message="Registration failed. Please check the errors.",
                errors=serializer.errors,
                status=400,
            )

        user = serializer.save()

        # Issue tokens immediately so the user is logged in after register
        refresh = RefreshToken.for_user(user)
        refresh["name"]  = user.get_full_name()
        refresh["email"] = user.email
        refresh["role"]  = user.role

        return success(
            data={
                "user": UserProfileSerializer(user).data,
                "tokens": {
                    "access":  str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            message="Account created successfully.",
            status=201,
        )


# ─── POST /api/auth/login/ ────────────────────────────────────────────────────

class LoginView(APIView):
    """
    Login with email + password.

    SimpleJWT's TokenObtainPairView is extended via CustomTokenSerializer
    to embed user details in the token and return them in the response.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomTokenSerializer(data=request.data)
        if not serializer.is_valid():
            return error(
                message="Invalid credentials. Please check your email and password.",
                errors=serializer.errors,
                status=401,
            )

        data = serializer.validated_data
        return success(
            data={
                "user": data["user"],
                "tokens": {
                    "access":  data["access"],
                    "refresh": data["refresh"],
                },
            },
            message="Login successful.",
        )


# ─── POST /api/auth/logout/ ───────────────────────────────────────────────────

class LogoutView(APIView):
    """
    Logout by blacklisting the refresh token.

    Requires: Authorization: Bearer <access_token>
    Body: { "refresh": "<refresh_token>" }
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return error(message="Refresh token is required.", status=400)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return success(message="Logged out successfully.")
        except TokenError:
            return error(message="Invalid or expired refresh token.", status=400)


# ─── POST /api/auth/token/refresh/ ────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """
    Refresh the access token using a valid refresh token.

    Body: { "refresh": "<refresh_token>" }
    """
    try:
        refresh = RefreshToken(request.data.get("refresh", ""))
        return success(
            data={"access": str(refresh.access_token)},
            message="Token refreshed.",
        )
    except TokenError:
        return error(message="Invalid or expired refresh token.", status=401)


# ─── GET/PUT /api/auth/me/ ────────────────────────────────────────────────────

class ProfileView(APIView):
    """
    GET  — return the logged-in user's profile.
    PUT  — update first_name, last_name, phone, address fields.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return success(data=serializer.data, message="Profile fetched.")

    def put(self, request):
        serializer = UpdateProfileSerializer(
            request.user, data=request.data, partial=True
        )
        if not serializer.is_valid():
            return error(
                message="Could not update profile.",
                errors=serializer.errors,
            )
        serializer.save()
        return success(
            data=UserProfileSerializer(request.user).data,
            message="Profile updated successfully.",
        )
