/**
 * The `:entity` route-param registry — nav and route wiring only.
 *
 * Field-level shape (which columns exist, which are required, FK targets)
 * is NOT declared here — the backend serves that from
 * `GET /entities/{resource}/schema` (see `useEntitySchema.ts`). This file
 * only says which entities exist, what they're called in the nav, and
 * which of the two admin route shapes each lives under.
 *
 * platform-core ships 6 entities, all org-scoped. A downstream project
 * consuming this repo as a git submodule ("consume in place" — importing
 * these files directly rather than copying them) has no clean way to add a
 * 7th entity by editing this file, since edits to a submodule's own tree
 * aren't how that integration shape is meant to work. Use
 * `registerOrgScopedEntity`/`registerProjectScopedEntity` instead, called
 * once at app startup (in `main.tsx`, before the app renders) alongside
 * registering the matching backend `CrudEntityConfig` via
 * `app/api/entity_registry.py`'s `register_entity_config`.
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

export const allEntities: RegistryEntry[] = [...orgScopedEntities,...projectScopedEntities];

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

/**
 * Registers an additional org-scoped entity from a downstream app, without
 * editing this file. Mutates the existing `orgScopedEntities`/`allEntities`
 * arrays and `entityLabelByKey`/`ADMIN_ENTITY_KEYS` in place (never
 * reassigned) so every module that already imported them — `AppSidebar`,
 * `AppBreadcrumb`, `useAdminRouteContext`, `useEntitySchema` — sees the
 * addition immediately, with no import-order dependency on when this runs,
 * as long as it runs before the app's first render. A duplicate `key` is a
 * no-op rather than a second entry.
 */
export function registerOrgScopedEntity(newEntry: RegistryEntry): void {
  if (orgScopedEntities.some((e) => e.key === newEntry.key)) return;
  orgScopedEntities.push(newEntry);
  allEntities.push(newEntry);
  entityLabelByKey[newEntry.key] = newEntry.label;
  (ADMIN_ENTITY_KEYS as Set<string>).add(newEntry.key);
}

/** Same as `registerOrgScopedEntity`, for a project-scoped entity instead. */
export function registerProjectScopedEntity(newEntry: RegistryEntry): void {
  if (projectScopedEntities.some((e) => e.key === newEntry.key)) return;
  projectScopedEntities.push(newEntry);
  allEntities.push(newEntry);
  entityLabelByKey[newEntry.key] = newEntry.label;
  (ADMIN_ENTITY_KEYS as Set<string>).add(newEntry.key);
}
