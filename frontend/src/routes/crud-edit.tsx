import { useLocation, useNavigate, useOutletContext } from "react-router";
import CrudEditScreen from "../containers/CrudRouter/screens/CrudEditScreen";

/**
 * See `crud-list.tsx`'s own docstring for why this is ONE shared file,
 * not one per resource. The resource is the URL's own THIRD-TO-LAST
 * segment (`/goals/:id/edit` -> `"goals"`; `/platform-org/orgs/:id/edit`
 * -> `"orgs"` - end-anchored, same "last segment(s), not first" rule
 * `crud-list.tsx`/`crud-new.tsx` follow - a PREVIOUS version of this
 * file used the URL's first segment instead, which only happened to
 * work because nothing was nested yet). After a save it goes back to the row's detail page; the list path
 * (`onDeleted`'s navigate target) is those same segments minus the
 * trailing `":id/edit"` - no `createCrudPaths` needed here, same reason
 * `crud-new.tsx` doesn't need it either.
 */
function segmentsFromPathname(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

// oxlint-disable-next-line react/only-export-components
export function meta({ location }: { location: { pathname: string } }) {
  const segments = segmentsFromPathname(location.pathname);
  const resource = segments.at(-3) ?? segments[0] ?? "";
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
  const segments = segmentsFromPathname(location.pathname);
  const resource = segments.at(-3) ?? segments[0] ?? "";
  const listPath = segments.slice(0, -2).join("/");
  const goToList = () => navigate(`/${listPath}`);
  const goToDetail = () => navigate(`/${segments.slice(0, -1).join("/")}`);

  return (
    <CrudEditScreen
      // Keyed by resource and row: one route file serves every edit form.
      key={`${resource}/${params.id}`}
      baseUrl={`/api/v1/${resource}`}
      accessToken={accessToken}
      id={params.id}
      onUpdated={goToDetail}
      onDeleted={goToList}
    />
  );
}
