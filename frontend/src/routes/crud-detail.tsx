import { Link as RouterLink, useLocation, useNavigate, useOutletContext } from "react-router";
import type { LinkComponentProps } from "../components/types";
import CrudDetailScreen from "../containers/CrudRouter/screens/CrudDetailScreen";
import { useResourcePath } from "./useResourcePath";

/**
 * See `crud-list.tsx`'s own docstring for why this is ONE shared file,
 * not one per resource. The resource is the URL's SECOND-TO-LAST segment
 * (`/goals/:id` -> `"goals"`; `/platform-org/orgs/:id` -> `"orgs"`),
 * same end-anchored rule as the other generic route files; `basePath`
 * (for the Edit link, and the list to go back to after a delete) is
 * every segment but the id.
 */
function CrudLink({ to, className, children, ...rest }: LinkComponentProps) {
  return (
    <RouterLink to={`/${to}`} className={className} {...rest}>
      {children}
    </RouterLink>
  );
}

function segmentsFromPathname(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

// oxlint-disable-next-line react/only-export-components
export function meta({ location }: { location: { pathname: string } }) {
  const resource = segmentsFromPathname(location.pathname).at(-2) ?? "";
  const singular = resource.replace(/-/g, " ").replace(/s$/, "");
  return [{ title: singular.charAt(0).toUpperCase() + singular.slice(1) }];
}

export default function CrudDetailRoute({ params }: { params: { id: string } }) {
  const accessToken = useOutletContext<string>();
  const navigate = useNavigate();
  const location = useLocation();
  const segments = segmentsFromPathname(location.pathname);
  const resource = segments.at(-2) ?? "";
  const basePath = segments.slice(0, -1).join("/");
  const resourcePath = useResourcePath();

  return (
    <CrudDetailScreen
      // Keyed by id: following a link to another row of the same resource
      // reuses this route element, and every piece of state below is per row.
      key={`${resource}/${params.id}`}
      baseUrl={`/api/v1/${resource}`}
      accessToken={accessToken}
      id={params.id}
      basePath={basePath}
      linkComponent={CrudLink}
      resourcePath={resourcePath}
      onDeleted={() => navigate(`/${basePath}`)}
    />
  );
}
