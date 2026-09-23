import { createElement, type ReactElement } from "react";
import { createCrudPaths, type CrudPaths } from "./lib/paths";
import CrudCreateScreen from "./screens/CrudCreateScreen";
import CrudDetailScreen from "./screens/CrudDetailScreen";
import type { CrudDetailScreenProps } from "./screens/CrudDetailScreen";
import type { CrudCreateScreenProps } from "./screens/CrudCreateScreen";
import CrudEditScreen from "./screens/CrudEditScreen";
import type { CrudEditScreenProps } from "./screens/CrudEditScreen";
import CrudListScreen from "./screens/CrudListScreen";
import type { CrudListScreenProps } from "./screens/CrudListScreen";

export interface CrudRouter<T> {
  paths: CrudPaths;
  List: (props: Omit<CrudListScreenProps<T>, "baseUrl">) => ReactElement;
  Create: (props: Omit<CrudCreateScreenProps<T>, "baseUrl">) => ReactElement;
  Edit: (props: Omit<CrudEditScreenProps<T>, "baseUrl">) => ReactElement;
  Detail: (props: Omit<CrudDetailScreenProps, "baseUrl">) => ReactElement;
}

/**
 * One resource's worth of wiring, from just its own base URL - `paths`
 * (`createCrudPaths`, built from the URL's own last `/`-segment, e.g.
 * `"/api/v1/goals"` -> `"goals"` -> `{listPath: "goals", ...}`) plus
 * `List`/`Create`/`Edit`/`Detail`, each `CrudListScreen`/`CrudCreateScreen`/
 * `CrudEditScreen` with `baseUrl` already bound - a caller only ever
 * passes the REST (`accessToken`, `linkComponent`, `id`, `onDeleted`,
 * ...), never `baseUrl` again once the router itself is built.
 *
 * A route file (react-router framework mode) reaches for `.List`/
 * `.Create`/`.Edit` directly:
 * ```ts
 * // some module's own lib/goalsRouter.ts
 * export const GoalsRouter = createCrudRouter<Goal>("/api/v1/goals");
 *
 * // routes/goals.tsx
 * import { GoalsRouter } from "../lib/goalsRouter";
 * export default function GoalsRoute() {
 *   const accessToken = useOutletContext<string>();
 *   return <GoalsRouter.List accessToken={accessToken} linkComponent={GoalsLink} />;
 * }
 * ```
 * Built fresh on every `createCrudRouter` call (not memoized/cached) -
 * cheap (three closures + a `createCrudPaths` call, no network of its
 * own), so a module calls it once at its own top level (as above) and
 * reuses the same router value everywhere, rather than needing this
 * function itself to dedupe repeated calls for the same `baseUrl`.
 */
export function createCrudRouter<T>(baseUrl: string): CrudRouter<T> {
  const resource = baseUrl.split("/").filter(Boolean).pop() ?? baseUrl;
  return {
    paths: createCrudPaths(resource),
    List: (props) => createElement(CrudListScreen<T>, { baseUrl, ...props }),
    Create: (props) => createElement(CrudCreateScreen<T>, { baseUrl, ...props }),
    Edit: (props) => createElement(CrudEditScreen<T>, { baseUrl, ...props }),
    Detail: (props) => createElement(CrudDetailScreen, { baseUrl, ...props }),
  };
}
