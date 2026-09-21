"""Plain ApiError classes - zero rest_framework imports (breaks a circular
import with DRF's lazy settings resolution, e.g. into an authentication
class). Every module in this platform should raise these (or subclass
them) rather than inventing its own error shape, so every module's API
responds with the same `{code, message, field_errors}` contract.

This is the superset of what platform-auth's and platform-org's own
previously-vendored copies each declared (`Unauthorized`/`NotFoundError`/
`ConflictError` in both, `InvalidCredentialsError` only in platform-auth's)
plus what platform-core's own copy already had (`PermissionDeniedError`/
`RateLimitedError`) - now that both modules depend on this package instead
of vendoring their own, this file has to cover every error class either
one raises.
"""


class ApiError(Exception):
    def __init__(self, status_code: int, code: str, message: str, field_errors: dict | None = None):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.field_errors = field_errors
        super().__init__(message)


class Unauthorized(ApiError):
    def __init__(self, message: str = "Invalid or expired access token."):
        super().__init__(401, "invalid_token", message)


class InvalidCredentialsError(ApiError):
    def __init__(self):
        super().__init__(401, "invalid_credentials", "Incorrect email or password.")


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
