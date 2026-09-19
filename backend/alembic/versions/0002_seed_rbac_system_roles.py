"""seed rbac system roles

Revision ID: 0002_seed_rbac_system_roles
Revises: 0001_initial_schema
Create Date: 2026-09-19 00:00:00.000001

Idempotent existence-check-then-insert seed of the Permission catalog and the
3 system Role bundles (`org_admin`, `project_owner`, `member`) from
`app/db/rbac_seed_catalog.py`. Safe to re-run: extending the catalog in a
later migration re-runs this same shape (existence-check by code/name/pair),
never a duplicate-insert.
"""

import uuid
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

from app.db.rbac_seed_catalog import (
    SYSTEM_ROLE_NAMES,
    build_permission_catalog,
    build_role_bundles,
)

revision: str = "0002_seed_rbac_system_roles"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

permission_table = sa.table(
    "permission",
    sa.column("id", sa.Uuid()),
    sa.column("code", sa.String()),
    sa.column("resource", sa.String()),
    sa.column("action", sa.String()),
)

role_table = sa.table(
    "role",
    sa.column("id", sa.Uuid()),
    sa.column("org_id", sa.Uuid()),
    sa.column("name", sa.String()),
    sa.column("is_system_role", sa.Boolean()),
)

role_permission_table = sa.table(
    "role_permission",
    sa.column("id", sa.Uuid()),
    sa.column("role_id", sa.Uuid()),
    sa.column("permission_id", sa.Uuid()),
)


def upgrade() -> None:
    bind = op.get_bind()

    # --- Permission catalog (existence-checked by code) --------------------
    catalog = build_permission_catalog()
    existing_codes = {row[0] for row in bind.execute(sa.select(permission_table.c.code))}

    new_permissions = [
        {"id": uuid.uuid4(), "code": code, "resource": resource, "action": action}
        for code, resource, action in catalog
        if code not in existing_codes
    ]
    if new_permissions:
        bind.execute(sa.insert(permission_table), new_permissions)

    code_to_id: dict[str, uuid.UUID] = {
        row[0]: row[1]
        for row in bind.execute(sa.select(permission_table.c.code, permission_table.c.id))
    }

    # --- System Role rows (existence-checked by name WHERE org_id IS NULL) --
    existing_roles = bind.execute(
        sa.select(role_table.c.name, role_table.c.id).where(role_table.c.org_id.is_(None))
    ).all()
    role_name_to_id: dict[str, uuid.UUID] = {row[0]: row[1] for row in existing_roles}

    new_roles = []
    for name in SYSTEM_ROLE_NAMES:
        if name not in role_name_to_id:
            new_id = uuid.uuid4()
            role_name_to_id[name] = new_id
            new_roles.append({"id": new_id, "org_id": None, "name": name, "is_system_role": True})
    if new_roles:
        bind.execute(sa.insert(role_table), new_roles)

    # --- RolePermission bundle rows (existence-checked by (role_id, permission_id)) --
    bundles = build_role_bundles(set(code_to_id.keys()))

    role_ids = list(role_name_to_id.values())
    existing_pairs = {
        (row[0], row[1])
        for row in bind.execute(
            sa.select(
                role_permission_table.c.role_id, role_permission_table.c.permission_id
            ).where(role_permission_table.c.role_id.in_(role_ids))
        )
    }

    new_role_permissions = []
    for role_name, codes in bundles.items():
        role_id = role_name_to_id[role_name]
        for code in codes:
            permission_id = code_to_id[code]
            pair = (role_id, permission_id)
            if pair not in existing_pairs:
                new_role_permissions.append(
                    {"id": uuid.uuid4(), "role_id": role_id, "permission_id": permission_id}
                )
                existing_pairs.add(pair)
    if new_role_permissions:
        bind.execute(sa.insert(role_permission_table), new_role_permissions)


def downgrade() -> None:
    bind = op.get_bind()
    bind.execute(
        sa.delete(role_table)
        .where(role_table.c.org_id.is_(None))
        .where(role_table.c.name.in_(SYSTEM_ROLE_NAMES))
    )
