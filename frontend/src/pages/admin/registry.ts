/**
 * The `:entity` route-param registry — nav and route wiring only.
 *
 * Field-level shape (which columns exist, which are required, FK targets)
 * is NOT declared here — the backend serves that from
 * `GET /entities/{resource}/schema` (see `useEntitySchema.ts`). This file
 * only says which entities exist, what they're called in the nav, and
 * which of the two admin route shapes each lives under.
 *
 * platform-core ships 6 entities, all org-scoped (no project-scoped entity
 * exists yet — add one here under `projectScopedEntities` once a downstream
 * app registers a project-scoped `CrudEntityConfig` of its own in
 * `app/api/entity_registry.py`).
 */

export interface RegistryEntry {
  /** `:entity` route-param value, e.g. "role-assignments". */
  key: string;
  /** Nav-label / page heading. */
  label: string;
}

function entry(label: string, key: string): RegistryEntry {
  return { key, label };
}

/** `/orgs/:orgId/admin/:entity` — org/global-scoped entities. */
export const orgScopedEntities: RegistryEntry[] = [
  entry("Organizations", "organizations"),
  entry("Org memberships", "org-memberships"),
  entry("Projects", "projects"),
  entry("Roles", "roles"),
  entry("Role assignments", "role-assignments"),
  entry("Permissions", "permissions"),
];

/** `/projects/:projectId/admin/:entity` — project-scoped entities. Empty until a downstream app adds one. */
export const projectScopedEntities: RegistryEntry[] = [];

export const allEntities: RegistryEntry[] = [...orgScopedEntities, ...projectScopedEntities];

/**
 * Flat `:entity` key -> nav-label map, so page components render the same
 * human-readable label `AppSidebar`/`AppBreadcrumb` nav generation uses,
 * instead of re-deriving one from the raw route slug.
 */
export const entityLabelByKey: Record<string, string> = Object.fromEntries(
  allEntities.map((e) => [e.key, e.label]),
);

/**
 * Every valid `:entity` slug. Used by `useEntitySchema.ts`'s
 * `resolveEntityKey()` to tell a real key from a singular `refEntity` alias
 * before pluralizing.
 */
export const ADMIN_ENTITY_KEYS: ReadonlySet<string> = new Set(allEntities.map((e) => e.key));

export function isOrgScoped(key: string): boolean {
  return orgScopedEntities.some((e) => e.key === key);
}
