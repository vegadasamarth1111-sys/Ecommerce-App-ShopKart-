"""
Custom DRF exception handler — wraps all errors in the standard response shape.

Configured in settings.py:
    REST_FRAMEWORK = {
        "EXCEPTION_HANDLER": "utils.exceptions.custom_exception_handler"
    }
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    # Get the default DRF response first
    response = exception_handler(exc, context)

    if response is not None:
        # Flatten DRF's nested error dict into a readable message
        detail = response.data
        if isinstance(detail, dict):
            # Try to pull the most useful first message
            first_key = next(iter(detail), None)
            first_val = detail.get(first_key, "")
            if isinstance(first_val, list):
                message = f"{first_key}: {first_val[0]}" if first_key != "detail" else str(first_val[0])
            else:
                message = str(first_val)
        elif isinstance(detail, list):
            message = str(detail[0])
        else:
            message = str(detail)

        response.data = {
            "success": False,
            "message": message,
            "data": None,
            "errors": detail,
        }

    return response
