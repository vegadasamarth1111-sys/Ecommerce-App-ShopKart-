"""
Consistent API response helpers.

Every endpoint in this project returns JSON in this shape:
    {
        "success": true | false,
        "message": "Human-readable message",
        "data": { ... } | [ ... ] | null,
        "errors": { ... } | null        # only on failure
    }

Usage:
    from utils.responses import success, error
    return success(data=serializer.data, message="Product created", status=201)
    return error(message="Not found", status=404)
"""

from rest_framework.response import Response


def success(data=None, message="", status=200):
    """Return a successful API response."""
    return Response(
        {
            "success": True,
            "message": message,
            "data": data,
        },
        status=status,
    )


def error(message="Something went wrong.", errors=None, status=400):
    """Return a failure API response."""
    payload = {
        "success": False,
        "message": message,
        "data": None,
    }
    if errors:
        payload["errors"] = errors
    return Response(payload, status=status)
