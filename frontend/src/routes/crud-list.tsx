import { Link as RouterLink, useLocation, useOutletContext } from "react-router";
import type { LinkComponentProps } from "../components/types";
import CrudListScreen from "../containers/CrudRouter/screens/CrudListScreen";

/**
 * ONE list route, shared by every `BaseViewSet`-backed resource - not
 * per-resource anymore, unlike `platform-org-frontend`'s/`goalnexa-frontend`'s
 * old `routes/orgs.tsx`/`goals.tsx`/etc (deleted; list/create for every
 * resource here uses this generic file, no per-resource route file or
 * `react-router` dependency needed for THAT). `goalnexa-frontend` does
 * still have its own `routes/goals-edit.tsx`/`metrics-edit.tsx` (and the
 * `react-router` dependency that requires) - see `createCrudRoutes`'s
 * `editFile` option - for the one thing this generic file genuinely
 * can't do: a resource whose edit page needs more than the plain
 * schema-driven form. `CrudListScreen`/`CrudCreateScreen`/`CrudEditScreen`
 * are otherwise fully generic (schema-driven - see their own
 * docstrings), so the only thing that ever differed between one
 * resource's route file and another's was which `baseUrl` it passed
 * down - derived HERE, at render time, from the URL's own LAST path
 * segment (`/goals` -> `"goals"` -> `"/api/v1/goals"`; `/platform-org/orgs`
 * -> `"orgs"` -> `"/api/v1/orgs"` - a nested mount adds segments in
 * FRONT, never changes the resource's own trailing one), matching this
 * platform's own established "URL's last segment always equals the
 * backend resource name" convention (confirmed for orgs/goals/metrics/
 * check-ins - see `createCrudRoutes`'s own docstring, which registers
 * THIS SAME file under every resource's own URL path).
 *
 * This is platform-core's own "module with its own route modules"
 * exception to "no react-router dependency of its own" (see root
 * AGENTS.md) - previously scoped to each domain module, now centralized
 * here since there's no per-resource UI left to justify keeping it
 * duplicated.
 */
function CrudLink({ to, className, children, ...rest }: LinkComponentProps) {
  return (
    <RouterLink to={`/${to}`} className={className} {...rest}>
      {children}
    </RouterLink>
  );
}

/**
 * The resource is the URL's own LAST segment, not the first - a plain
 * root-mounted resource (`/goals`) has only one segment either way, but
 * a host may nest a resource under its own prefix (e.g.
 * `platform-org-frontend`'s `orgs` under `"platform-org/orgs"` - see
 * `createCrudRoutes`'s `prefix()` note), and this route IS its own list
 * page - `basePath` (the whole mounted path, prefix included) is just
 * `segments.join("/")`, no different computation needed for it.
 */
function segmentsFromPathname(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

// oxlint-disable-next-line react/only-export-components
export function meta({ location }: { location: { pathname: string } }) {
  const segments = segmentsFromPathname(location.pathname);
  const resource = segments.at(-1) ?? "";
  return [{ title: resource.charAt(0).toUpperCase() + resource.slice(1).replace(/-/g, " ") }];
}

export default function CrudListRoute() {
  const accessToken = useOutletContext<string>();
  const location = useLocation();
  const segments = segmentsFromPathname(location.pathname);
  const resource = segments.at(-1) ?? "";
  const basePath = segments.join("/");
  return (
    // Keyed by resource: every resource's list is this one route file, so
    // /goals -> /metrics reuses the element, and the table's column state is
    // computed once at mount - without a remount it keeps the old resource's
    // columns (only same-named ones like `parent` would show).
    <CrudListScreen
      key={basePath}
      baseUrl={`/api/v1/${resource}`} basePath={basePath} accessToken={accessToken} linkComponent={CrudLink} />
  );
}
