import { useLocation, useNavigate, useOutletContext } from "react-router";
import { createCrudPaths } from "../containers/CrudRouter/lib/paths";
import CrudEditScreen from "../containers/CrudRouter/screens/CrudEditScreen";

/** See `crud-list.tsx`'s own docstring for why this is ONE shared file, not one per resource. The resource is the URL's own FIRST segment (`/goals/:id/edit` -> `"goals"`). */
function resourceFromPathname(pathname: string): string {
  return pathname.split("/").filter(Boolean)[0] ?? "";
}

// oxlint-disable-next-line react/only-export-components
export function meta({ location }: { location: { pathname: string } }) {
  const resource = resourceFromPathname(location.pathname);
  return [{ title: `Edit ${resource.replace(/-/g, " ").replace(/s$/, "")}` }];
}

/**
 * `params` arrives as an ordinary prop regardless of where this file
 * lives (see the deleted per-module route files' own former docstrings
 * on why no generated `./+types/...` import is available here either -
 * this file lives outside `apps/main`'s own `app/` directory, same as
 * they did).
 */
export default function CrudEditRoute({ params }: { params: { id: string } }) {
  const accessToken = useOutletContext<string>();
  const navigate = useNavigate();
  const location = useLocation();
  const resource = resourceFromPathname(location.pathname);
  const paths = createCrudPaths(resource);
  const goToList = () => navigate(`/${paths.listPath}`);

  return (
    <CrudEditScreen
      baseUrl={`/api/v1/${resource}`}
      accessToken={accessToken}
      id={params.id}
      onUpdated={goToList}
      onDeleted={goToList}
    />
  );
}
