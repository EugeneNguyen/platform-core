/**
 * Everything about the generic admin-CRUD surface that stays **frontend-
 * static** — the backend owns *data shape* (fields, methods, scope,
 * search/filter, served live from `GET /entities/{resource}/schema`); the
 * frontend keeps *route wiring*, because route wiring is information
 * architecture and doesn't drift the way a field list does.
 *
 * What's left is deliberately tiny:
 *
 * 1. `path` — derivable, not declared. Every entity's REST path is exactly
 *    `/{entityKey}` (`crud_factory._resource_path` and the `:entity` route
 *    slug are the same string by construction) — `pathFor()` below.
 * 2. `ROUTE_OVERRIDES` — the genuine exceptions, where the real backend route
 *    doesn't fit the `{path}` / `{path}?{scopeField}=` convention. `Project`
 *    is platform-core's one example: its real create is the bespoke
 *    org-path-nested `POST /orgs/{org_id}/projects` (auto-grants the
 *    creator a project-scoped `project_owner` role, which a generic create
 *    would skip) — `list`/`get`/`update`/`delete` all still fit the plain
 *    convention, so only `createPath` needs an override.
 * 3. `STATIC_ENTITY_CONFIGS` — entities with **no backend `CrudEntityConfig`
 *    at all**, so there is nothing for `GET /entities/{resource}/schema` to
 *    derive and no route to fetch. Empty in platform-core — add one here
 *    (matching `app/api/entity_registry.py`'s own docstring on the backend
 *    side) if a downstream app ships a fully-bespoke-CRUD entity of its own.
 */
import { EntityConfig } from "./types";

/** Every entity's REST path is its `:entity` route slug — see note 1 above. */
export function pathFor(entityKey: string): string {
  return `/${entityKey}`;
}

/** See note 2 above. */
export const ROUTE_OVERRIDES: Record<
  string,
  Pick<EntityConfig, "listPath" | "createPath" | "detailPath" | "detailLinkField">
> = {
  projects: {
    createPath: "/orgs/:orgId/projects",
  },
};

/** See note 3 above — empty until a downstream app adds a fully-bespoke entity. */
export const STATIC_ENTITY_CONFIGS: Record<string, EntityConfig> = {};
