"""Collects every `CrudEntityConfig` instance scattered across the route
modules into one lookup, keyed by the plural `:entity` route slug
(`crud_factory._resource_path`).

Backs `GET /entities/{resource}/schema` (`app/api/routes/entity_schema.py`).

**This tuple is the one hand-authored list a completeness/relationship
derivation built on top of `ALL_ENTITY_CONFIGS` cannot see past** — a
derivation that walks this registry cannot omit an entity that's in here, but
an entity omitted from `_ALL_CONFIGS` itself is invisible to it. If you add a
new model with a foreign key into a registered entity, either add its config
here or make sure a test walking `Base.metadata` (not this tuple) enforces
the omission is deliberate — a small test walking `Base.metadata` and
asserting every model with a foreign key into a registered entity also
appears in `_ALL_CONFIGS` is worth porting into any downstream project
that grows this registry past a handful of entities.
"""

from app.api.crud_factory import CrudEntityConfig, _resource_path
from app.api.routes.org_memberships import _ORG_MEMBERSHIP_CONFIG
from app.api.routes.organizations import _ORGANIZATION_CONFIG
from app.api.routes.projects import _PROJECT_FACTORY_CONFIG
from app.api.routes.rbac_routes import _PERMISSION_CONFIG, _ROLE_ASSIGNMENT_CONFIG, _ROLE_CONFIG

_ALL_CONFIGS: tuple[CrudEntityConfig, ...] = (
    _ORGANIZATION_CONFIG,
    _PROJECT_FACTORY_CONFIG,
    _ORG_MEMBERSHIP_CONFIG,
    _ROLE_CONFIG,
    _PERMISSION_CONFIG,
    _ROLE_ASSIGNMENT_CONFIG,
)

ALL_ENTITY_CONFIGS: dict[str, CrudEntityConfig] = {_resource_path(config.resource): config for config in _ALL_CONFIGS}


def register_entity_config(config: CrudEntityConfig) -> None:
    """Register an additional `CrudEntityConfig` from a downstream app that
    consumes this repo as a git submodule ("consume in place" — importing
    these modules directly rather than copying them), without editing this
    file.

    Mutates `ALL_ENTITY_CONFIGS` in place (never reassigns it) so
    `app/api/routes/entity_schema.py`'s already-bound `from ... import
    ALL_ENTITY_CONFIGS` sees the addition immediately, regardless of import
    order — call this once, at app startup, before the first request (e.g.
    right after `from app.main import app` in the downstream app's own
    entrypoint, alongside its own `app.include_router(make_crud_router(...))`
    call for the same entity).
    """
    ALL_ENTITY_CONFIGS[_resource_path(config.resource)] = config
