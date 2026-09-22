import { createCrudPaths, type CrudPaths } from "./lib/paths";
import type { CrudConfig } from "./lib/types";
import CrudCreateScreen from "./screens/CrudCreateScreen";
import CrudEditScreen from "./screens/CrudEditScreen";
import CrudListScreen from "./screens/CrudListScreen";

export interface CrudRouter<T> {
  paths: CrudPaths;
  screens: {
    List: typeof CrudListScreen<T>;
    Create: typeof CrudCreateScreen<T>;
    Edit: typeof CrudEditScreen<T>;
  };
}

/**
 * NOT a React Router `<Routes>`/`<Route>` tree - every frontend package
 * in this platform is router-agnostic on purpose (a host may be on a
 * different react-router major version, or a different router
 * altogether; see root `AGENTS.md`'s "no react-router dependency of its
 * own" rule and this package's own `AppShell`/`Table`/`DataTable`
 * docstrings for the same rule applied elsewhere). React Router's own
 * framework mode needs literal route FILES at build time anyway, so even
 * the host couldn't consume a runtime route tree here if this exported
 * one.
 *
 * What this actually bundles: the three CRUD screens plus the path
 * segments they expect (`createCrudPaths`, built from `config.resource`)
 * - a host wires the two together in its own `routes.ts`/router the same
 * three-line way it already does for `platform-auth-frontend`'s
 * `LoginScreen`/`SignupScreen` + `BASE_PATH`/`LOGIN_PATH`/`SIGNUP_PATH`:
 *
 * ```ts
 * const orgsRouter = createCrudRouter(orgsConfig);
 * route(orgsRouter.paths.listPath, "routes/orgs.tsx");       // renders <orgsRouter.screens.List config={orgsConfig} />
 * route(orgsRouter.paths.createPath, "routes/orgs-new.tsx"); // renders <orgsRouter.screens.Create config={orgsConfig} onCreated={...} />
 * route(orgsRouter.paths.editPath(":id"), "routes/orgs-edit.tsx"); // reads :id itself, passes it as the `id` prop
 * ```
 */
export function createCrudRouter<T>(config: CrudConfig<T>): CrudRouter<T> {
  return {
    paths: createCrudPaths(config.resource),
    screens: {
      List: CrudListScreen<T>,
      Create: CrudCreateScreen<T>,
      Edit: CrudEditScreen<T>,
    },
  };
}
