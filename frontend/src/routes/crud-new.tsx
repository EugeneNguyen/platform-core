import { useLocation, useNavigate, useOutletContext } from "react-router";
import CrudCreateScreen from "../containers/CrudRouter/screens/CrudCreateScreen";

/**
 * See `crud-list.tsx`'s own docstring for why this is ONE shared file,
 * not one per resource. The resource is the URL's own SECOND-TO-LAST
 * segment (`/goals/new` -> `"goals"`; `/platform-org/orgs/new` ->
 * `"orgs"` - end-anchored, so a nested mount's extra FRONT segments
 * never throw this off), same "last segment(s), not first" rule
 * `crud-list.tsx` follows. The list path (`onCreated`'s navigate target)
 * is just those same segments minus the trailing `"new"` (`onCreated` goes to the new row's detail page under it) - no
 * `createCrudPaths` needed here at all, since this file already has the
 * one thing that ever mattered: its own REAL mounted `location.pathname`.
 */
function segmentsFromPathname(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

// oxlint-disable-next-line react/only-export-components
export function meta({ location }: { location: { pathname: string } }) {
  const segments = segmentsFromPathname(location.pathname);
  const resource = segments.at(-2) ?? segments[0] ?? "";
  return [{ title: `New ${resource.replace(/-/g, " ").replace(/s$/, "")}` }];
}

export default function CrudNewRoute() {
  const accessToken = useOutletContext<string>();
  const navigate = useNavigate();
  const location = useLocation();
  const segments = segmentsFromPathname(location.pathname);
  const resource = segments.at(-2) ?? segments[0] ?? "";
  const listPath = segments.slice(0, -1).join("/");

  return (
    <CrudCreateScreen
      baseUrl={`/api/v1/${resource}`}
      accessToken={accessToken}
      // To the new row's detail page, where its relations can be filled in.
      onCreated={(row) => navigate(`/${listPath}/${(row as { id: string | number }).id}`)}
    />
  );
}
