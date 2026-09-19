"""FastAPI application entrypoint.

Wires up the generic auth/org/RBAC surface: human login (JWT + refresh
cookie), AIAgent bearer-key credentials, Organization bootstrap/creation,
OrgMembership invite/accept/suspend, Project CRUD, Role/Permission/
RoleAssignment RBAC, and the `GET /entities/{resource}/schema` introspection
route the generic CRUD factory's own admin surface is built against.

Downstream projects add their own domain routers the same way — a plain
`app.include_router(my_router, prefix="/api/v1", tags=["my-feature"])` call
alongside the ones below, and (if the entity should appear in the generic
admin surface) a `CrudEntityConfig` registered in
`app/api/entity_registry.py`.
"""

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse

from app.api.routes import (
    agents,
    auth,
    entity_schema,
    health,
    org_memberships,
    organizations,
    projects,
    rbac_routes,
    role_assignments,
    roles,
)

app = FastAPI(title="platform-core API", version="0.1.0")

# Permissive CORS for dev only — tighten before any production deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Flatten `HTTPException(detail={...})` to the `{code, message, field_errors}` shape.

    FastAPI's default `HTTPException` handler wraps whatever `detail` is
    passed one level deeper (`{"detail": {...}}` on the wire) — this handler
    makes the flat error contract hold for an `HTTPException` raised anywhere
    in the app, including from a dependency (which has no response object of
    its own to return a `JSONResponse` from directly).
    """
    if isinstance(exc.detail, dict) and {"code", "message"} <= exc.detail.keys():
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": "http_error", "message": str(exc.detail), "field_errors": None},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Flatten FastAPI/Pydantic's default request-validation shape to the
    same `{code, message, field_errors}` contract every route's own error
    responses already use.
    """
    field_errors: dict[str, list[str]] = {}
    for error in exc.errors():
        loc = error.get("loc", ())
        field = str(loc[-1]) if len(loc) > 1 else "__root__"
        field_errors.setdefault(field, []).append(error.get("msg", "Invalid value."))

    return JSONResponse(
        status_code=422,
        content={"code": "validation_error", "message": "Request failed validation.", "field_errors": field_errors},
    )


app.include_router(health.router)
# Base path `/api/v1` for every feature route (health stays unprefixed).
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(agents.router, prefix="/api/v1", tags=["agents"])
app.include_router(organizations.router, prefix="/api/v1", tags=["organizations"])
app.include_router(org_memberships.router, prefix="/api/v1", tags=["org_memberships"])
app.include_router(projects.router, prefix="/api/v1", tags=["projects"])
app.include_router(role_assignments.router, prefix="/api/v1", tags=["role-assignments"])
app.include_router(roles.router, prefix="/api/v1", tags=["roles"])
app.include_router(rbac_routes.router, prefix="/api/v1", tags=["rbac"])
app.include_router(entity_schema.router, prefix="/api/v1", tags=["entity-schema"])
