export interface CrudPaths {
  basePath: string;
  listPath: string;
  createPath: string;
  editPath: (id: string | number) => string;
}

/**
 * Suggested URL segments for a resource, built from `CrudConfig.resource`
 * - the same "package names its own bare segments, the host decides
 * nesting/mounting" convention `platform-auth-frontend`'s `BASE_PATH`/
 * `LOGIN_PATH` and `platform-org-frontend`'s `ORGS_PATH` use, just
 * computed instead of static since the resource name varies per config.
 * A HOST wires these into its own router (react-router framework mode
 * needs literal route files, so even the host can't do this dynamically
 * either) - see `createCrudRouter`'s own docstring for why nothing here
 * is an actual `<Route>`.
 */
export function createCrudPaths(resource: string): CrudPaths {
  return {
    basePath: resource,
    listPath: resource,
    createPath: `${resource}/new`,
    editPath: (id) => `${resource}/${id}/edit`,
  };
}
