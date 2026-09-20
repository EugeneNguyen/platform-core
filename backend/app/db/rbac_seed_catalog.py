"""Seed data: the `Permission` catalog and the system `Role` bundles.

Pure-Python data structures, deliberately factored out of the Alembic
migration (`alembic/versions/0002_seed_rbac_system_roles.py`) so:

- the migration itself stays a thin "existence-check then INSERT" loop over
  these structures, and
- the shape is unit-testable without a DB.

Downstream projects that own a copy of this code (the "copy the pieces"
integration shape) extend it by adding their resource(s) to
`CRUD_RESOURCES`/`READ_ONLY_RESOURCES` here and granting the new permission
codes to whichever system role(s) should hold them via a new data migration
(never by editing this catalog alone — that only affects a fresh DB's
initial seed, an already-seeded DB needs its own idempotent backfill
migration, same shape as `0002_seed_rbac_system_roles.py`).

A downstream project consuming this repo as a git submodule instead
("consume in place") doesn't need to touch this file at all: `Permission`/
`Role`/`RolePermission` are ordinary rows, not code, so its own idempotent
Alembic data migration can insert new `Permission` rows and grant them to
this catalog's already-seeded system roles (looked up by name) directly —
same existence-check-then-insert shape as `0002_seed_rbac_system_roles.py`,
just issued from the downstream project's own migration chain against the
same database, with its own `version_table` so the two chains don't collide.
"""

from __future__ import annotations

STANDARD_ACTIONS: tuple[str, ...] = ("create", "read", "update", "delete")

# The 5 resources this platform's own routes gate on. `organization` and
# `project` get full CRUD; `org_membership`/`role`/`role_assignment` also
# get full CRUD even though a couple of actions (e.g. `org_membership.create`)
# are only reachable through a bespoke route rather than the generic factory
# — see each route module's own docstring for which verbs are bespoke vs.
# generic. `ai_agent` gets full CRUD codes too, even though only `.create`/
# `.update` are actually checked today (`app/api/routes/agents.py`) — the
# unused codes are harmless and save a future story its own migration.
CRUD_RESOURCES: tuple[str, ...] = (
    "organization",
    "org_membership",
    "role",
    "role_assignment",
    "project",
    "ai_agent",
)

# Resources with no generic CRUD surface at all — read-only.
READ_ONLY_RESOURCES: tuple[str, ...] = ("permission",)

ALL_RESOURCES: tuple[str, ...] = CRUD_RESOURCES + READ_ONLY_RESOURCES

# The 3 seeded system roles (org_id=NULL, is_system_role=True).
SYSTEM_ROLE_NAMES: tuple[str, ...] = ("org_admin", "project_owner", "member")


def _code(resource: str, action: str) -> str:
    return f"{resource}.{action}"


def build_permission_catalog() -> list[tuple[str, str, str]]:
    """Return the full `(code, resource, action)` catalog."""
    catalog: list[tuple[str, str, str]] = []

    for resource in CRUD_RESOURCES:
        for action in STANDARD_ACTIONS:
            catalog.append((_code(resource, action), resource, action))

    for resource in READ_ONLY_RESOURCES:
        catalog.append((_code(resource, "read"), resource, "read"))

    return catalog


def build_role_bundles(all_permission_codes: set[str]) -> dict[str, set[str]]:
    """Return `{role_name: {permission codes}}` for the 3 system roles.

    `all_permission_codes` must be the full catalog's code set (see
    `build_permission_catalog`) — `org_admin`'s bundle is "every permission
    that exists", not a hand-maintained duplicate list, so it can never
    silently drift from the catalog.

    `project_owner` is auto-granted, project-scoped, to whoever creates a
    Project (`app/api/routes/projects.py`'s `create_project`) — just enough
    to read/update the project they created without needing org-wide
    `org_admin`. `member` is a generic read-only baseline; grant it, extend
    it, or ignore it per downstream project's own needs.
    """
    project_owner = {_code("project", "read"), _code("project", "update")}
    member = {_code(resource, "read") for resource in ALL_RESOURCES}

    return {
        "org_admin": set(all_permission_codes),
        "project_owner": project_owner,
        "member": member,
    }
