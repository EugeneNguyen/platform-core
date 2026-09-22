import { useLocation, useNavigate, useOutletContext } from "react-router";
import { createCrudPaths } from "../containers/CrudRouter/lib/paths";
import CrudCreateScreen from "../containers/CrudRouter/screens/CrudCreateScreen";

/** See `crud-list.tsx`'s own docstring for why this is ONE shared file, not one per resource. The resource comes from the URL's own second-to-last segment (`/goals/new` -> `"goals"`, `createCrudPaths(resource).createPath`'s own shape). */
function resourceFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return segments.at(-2) ?? segments[0] ?? "";
}

// oxlint-disable-next-line react/only-export-components
export function meta({ location }: { location: { pathname: string } }) {
  const resource = resourceFromPathname(location.pathname);
  return [{ title: `New ${resource.replace(/-/g, " ").replace(/s$/, "")}` }];
}

export default function CrudNewRoute() {
  const accessToken = useOutletContext<string>();
  const navigate = useNavigate();
  const location = useLocation();
  const resource = resourceFromPathname(location.pathname);
  const paths = createCrudPaths(resource);

  return (
    <CrudCreateScreen
      baseUrl={`/api/v1/${resource}`}
      accessToken={accessToken}
      onCreated={() => navigate(`/${paths.listPath}`)}
    />
  );
}
