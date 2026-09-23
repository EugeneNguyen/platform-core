export interface CrudPaths {
  basePath: string;
  listPath: string;
  createPath: string;
  editPath: (id: string | number) => string;
}

/**
 * URL segments for a resource, built from its own name - same "package
 * names its own bare segments, the host decides nesting/mounting"
 * convention `platform-auth-frontend`'s `BASE_PATH`/`LOGIN_PATH` use,
 * just computed instead of static since the resource name varies.
 * `createCrudRouter` and `createCrudRoutes` (see `routes.ts`) both build this the same way, from a
 * resource's own backend base URL's last `/`-segment - see their own
 * docstrings.
 */
export function createCrudPaths(resource: string): CrudPaths {
  return {
    basePath: resource,
    listPath: resource,
    createPath: `${resource}/new`,
    editPath: (id) => `${resource}/${id}/edit`,
  };
}
