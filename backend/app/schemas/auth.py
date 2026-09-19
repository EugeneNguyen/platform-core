"""Pydantic v2 schemas for the login route and session routes.

Source: API Document §2 (`POST /auth/login`, `POST /auth/refresh`,
`GET /auth/me` request/response contracts), (refresh rotation policy).
"""

from typing import Literal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Body of `POST /auth/login`."""

    email: EmailStr
    password: str


# /: same `slug` pattern `CreateOrgRequest` (`app/schemas/
# organizations.py`) validates — kept as a private literal here (not
# imported from that module) to avoid a schemas-importing-schemas cycle;
# `app/schemas/organizations.py` imports `OrgSummary` *from* this module,
# so the reverse import would be circular.
_SLUG_PATTERN = r"^[a-z0-9-]+$"


class SignupRequest(BaseModel):
    """Body of `POST /auth/signup`.

    Bootstrap-only: creates a brand-new `User` + the deployment's first
    `Organization` in one call. `org_slug` is user-supplied, never
    server-derived from `org_name`.
    """

    name: str
    email: EmailStr
    password: str
    org_name: str
    org_slug: str = Field(pattern=_SLUG_PATTERN)


class OrgSummary(BaseModel):
    """One entry in `LoginResponse.orgs` — a single `active`-membership Organization."""

    id: UUID
    name: str
    slug: str


class MeOrgsResponse(BaseModel):
    """Response of `GET /auth/me/orgs`.

    A plain envelope around the **exact same** `OrgSummary` entries
    `LoginResponse.orgs` already returns — deliberately no new per-org
    schema (: "reusing the exact `OrgSummary {id, name, slug}`
    schema `LoginResponse` already returns — no new schema"), so the
    frontend can share one type across the login response and this route.

    Envelope-object rather than a bare top-level list, matching
    `MyPermissionsResponse`/`RoleListResponse` (`app/schemas/rbac.py`) — every
    collection response in this API is an object, leaving room to add
    pagination/metadata keys later without a breaking change.
    """

    orgs: list[OrgSummary]


class LoginResponse(BaseModel):
    """Response of `POST /auth/login`.

    The refresh token is never included here — it is set as an httpOnly
    cookie on the response.
    """

    access_token: str
    org_context: Literal["auto", "picker"]
    orgs: list[OrgSummary]


class RefreshResponse(BaseModel):
    """Response of `POST /auth/refresh`.

    Deliberately does NOT include `org_context`/`orgs` — the frontend already
    holds those from login; refresh's only job is renewing the access token.
    The rotated raw refresh token is never included here either — it is set
    as a new httpOnly cookie on the response, same as login.
    """

    access_token: str


class MeResponse(BaseModel):
    """Response of `GET /auth/me`.

    Identity-only — no resolved permission codes yet (deferred until an RBAC
    story exists to resolve them).

     extends this to a second actor shape: `get_current_actor` can now
    resolve to either a `User` or an `AIAgent`, and `GET /auth/me`
    branches on `actor_type` to serialize the right one. Rather than a
    `Union` of two separate response models, this is kept as a single model
    with `email`/`agent_name` both optional (Pydantic-v2-idiomatic, simpler
    for the route/OpenAPI schema than a discriminated union for two fields):
    - `actor_type == "user"`: `email` set, `agent_name` `None`.
    - `actor_type == "ai_agent"`: `agent_name` set, `email` `None` — an
      `AIAgent` has no email address at all (Database Document §3.4).
    """

    actor_id: str
    actor_type: str
    email: str | None = None
    agent_name: str | None = None
