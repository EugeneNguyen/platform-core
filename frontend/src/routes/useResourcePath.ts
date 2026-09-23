import { useCallback, useContext } from "react";
import { UNSAFE_FrameworkContext } from "react-router";

interface ManifestRoute {
  id: string;
  parentId?: string;
  path?: string;
}

/**
 * Where a resource's pages are mounted in the HOST's route tree, from its
 * API base URL: `"/api/v1/orgs"` -> `"platform-org/orgs"` when the host
 * nested it (`createOrgsRoutes("platform-org")`), `"goals"` for a plain
 * `createCrudRoutes("/api/v1/goals")`. `null` when the host registered no
 * detail page for it.
 *
 * Read from the framework's route manifest: `createCrudRoutes` gives every
 * resource's detail route the id `crud-detail-<resource>`, so its full
 * path is its own `path` joined under its ancestors', minus the trailing
 * `:id`. Needs the host to ship the whole manifest
 * (`routeDiscovery: { mode: "initial" }` in its react-router config) -
 * with lazy discovery the client only knows routes matched so far. Outside
 * framework mode (no manifest) it falls back to the bare resource name.
 */
export function useResourcePath(): (endpoint: string) => string | null {
  const routes = useContext(UNSAFE_FrameworkContext)?.manifest.routes as Record<string, ManifestRoute | undefined> | undefined;
  return useCallback(
    (endpoint: string) => {
      const resource = endpoint.split("/").filter(Boolean).pop() ?? endpoint;
      if (!routes) return resource;
      let route = routes[`crud-detail-${resource}`];
      if (!route) return null;
      const segments: string[] = [];
      while (route) {
        if (route.path) segments.unshift(route.path.replace(/^\/+|\/+$/g, ""));
        route = route.parentId ? routes[route.parentId] : undefined;
      }
      return segments.join("/").replace(/\/?:id$/, "");
    },
    [routes],
  );
}
