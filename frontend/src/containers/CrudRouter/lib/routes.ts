import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { route, type RouteConfigEntry } from "@react-router/dev/routes";
import { createCrudPaths } from "./paths";

/**
 * `../../../routes` from THIS file's own location
 * (`src/containers/CrudRouter/lib/routes.ts`) resolves to
 * `src/routes/` - `crud-list.tsx`/`crud-new.tsx`/`crud-edit.tsx` (see
 * their own docstrings for why there's exactly one of each, shared by
 * every resource). Built from `import.meta.url` (Node ESM's own
 * `__dirname` equivalent), NOT a relative string like
 * `"../../platform-core/frontend/src/routes"` - that would bake in an
 * assumption about the CALLER's own directory depth, which is exactly
 * the fragility this avoids: this path only ever has to be correct
 * relative to `routes.ts` itself, regardless of which host imports
 * `createCrudRoutes` or from where. `path.resolve`'s own "an absolute
 * path wins over its base, unchanged" behavior is what makes the
 * RESULT still resolve correctly once react-router's tooling joins it
 * against the CALLER's `appDirectory` - see `createCrudRoutes`'s own
 * docstring for the same rule applied there.
 */
const routesDir = join(dirname(fileURLToPath(import.meta.url)), "../../../routes");

/**
 * The three `route()` calls every `BaseViewSet`-backed resource needs
 * (list/create/edit), ALL THREE pointing at platform-core's own generic
 * route files (`crud-list.tsx`/etc - shared by every resource, not one
 * set per module - see their own docstrings) - a host's `routes.ts`
 * registers a whole resource with one call, giving only the resource's
 * own backend base URL:
 * ```ts
 * // apps/main/frontend/app/routes.ts
 * import { createCrudRoutes } from "platform-core/routes";
 * ...
 * layout("routes/app-shell.tsx", [
 *   ...createCrudRoutes("/api/v1/orgs"),
 *   ...createCrudRoutes("/api/v1/goals"),
 * ]),
 * ```
 * Deliberately its OWN `package.json` `exports` subpath
 * (`"platform-core/routes"`), not part of the main `"."` entry
 * `AppShell`/`CrudListScreen`/etc. ship from - `apps/main/routes.ts` is
 * the only caller this is meant for, and it's a pure Node/build-time
 * file (react-router's own tooling reads it directly, in Node, before
 * any client bundling starts - never part of the browser bundle). The
 * main entry stays free of `@react-router/dev/routes` for exactly the
 * reason documented in root `AGENTS.md`'s "A module with its own route
 * modules..." section: that package IS client-bundled (`AppShell`
 * pulls it into `app-shell.tsx`), so anything it re-exports rides along
 * - measured there at a real ~16KB cost for code that never runs in a
 * browser. This file avoids that by living somewhere the client bundle
 * never reaches.
 */
export function createCrudRoutes(apiPath: string): RouteConfigEntry[] {
  const resource = apiPath.split("/").filter(Boolean).pop() ?? apiPath;
  const paths = createCrudPaths(resource);
  // Every resource points at the SAME three files (see routesDir's own
  // docstring) - react-router derives a route's `id` from its `file` by
  // default, so without an explicit one here, two resources registering
  // the same file would collide ("duplicate route id", confirmed the
  // hard way). `id` just needs to be unique per route, not meaningful.
  return [
    route(paths.listPath, join(routesDir, "crud-list.tsx"), { id: `crud-list-${resource}` }),
    route(paths.createPath, join(routesDir, "crud-new.tsx"), { id: `crud-new-${resource}` }),
    route(paths.editPath(":id"), join(routesDir, "crud-edit.tsx"), { id: `crud-edit-${resource}` }),
  ];
}
