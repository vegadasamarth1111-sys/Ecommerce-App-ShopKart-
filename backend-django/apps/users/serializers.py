from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


# ─── Registration ──────────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    """Handles new user sign-up."""

    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password")

    class Meta:
        model = User
        fields = (
            "id", "username", "email",
            "first_name", "last_name",
            "phone", "password", "password2",
        )
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name":  {"required": True},
            "email":      {"required": True},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password2"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


# ─── JWT Token Customisation ───────────────────────────────────────────────────

class CustomTokenSerializer(TokenObtainPairSerializer):
    """Add extra claims to the JWT access token payload."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Embed user details so the frontend can read them from the token
        token["name"] = user.get_full_name()
        token["email"] = user.email
        token["role"] = user.role
        return token

    def validate(self, attrs):
        # SimpleJWT uses username field; we override to accept email
        data = super().validate(attrs)
        data["user"] = UserProfileSerializer(self.user).data
        return data


# ─── Profile ──────────────────────────────────────────────────────────────────

class UserProfileSerializer(serializers.ModelSerializer):
    """Read-only user info returned with the login response and /me endpoint."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id", "username", "email",
            "first_name", "last_name", "full_name",
            "phone", "role",
            "address_line", "city", "state", "pincode",
            "date_joined",
        )
        read_only_fields = ("id", "date_joined", "role")

    def get_full_name(self, obj):
        return obj.get_full_name()


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Allows users to update their own profile details."""

    class Meta:
        model = User
        fields = (
            "first_name", "last_name",
            "phone", "address_line", "city", "state", "pincode",
        )
