"""Plain ApiError classes - zero rest_framework imports (breaks a circular
import with DRF's lazy settings resolution). Every module in this platform
should raise these (or subclass them) rather than inventing its own error
shape, so every module's API responds with the same `{code, message,
field_errors}` contract.
"""


class ApiError(Exception):
    def __init__(self, status_code: int, code: str, message: str, field_errors: dict | None = None):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.field_errors = field_errors
        super().__init__(message)


class NotFoundError(ApiError):
    def __init__(self, message: str = "Not found."):
        super().__init__(404, "not_found", message)


class PermissionDeniedError(ApiError):
    def __init__(self):
        super().__init__(403, "permission_denied", "You do not have permission to perform this action.")


class ConflictError(ApiError):
    def __init__(self, code: str, message: str):
        super().__init__(409, code, message)


class RateLimitedError(ApiError):
    def __init__(self, message: str = "Too many attempts. Try again later."):
        super().__init__(429, "rate_limited", message)
