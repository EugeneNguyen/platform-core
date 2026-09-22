import { Link as RouterLink, useLocation, useOutletContext } from "react-router";
import type { LinkComponentProps } from "../components/types";
import CrudListScreen from "../containers/CrudRouter/screens/CrudListScreen";

/**
 * ONE list route, shared by every `BaseViewSet`-backed resource - not
 * per-resource anymore, unlike `platform-org-frontend`'s/`goalnexa-frontend`'s
 * old `routes/orgs.tsx`/`goals.tsx`/etc (deleted; nothing left in either
 * package needs its own route files, or `react-router` as a dependency,
 * at all). `CrudListScreen`/`CrudCreateScreen`/`CrudEditScreen` are
 * already fully generic (schema-driven - see their own docstrings), so
 * the only thing that ever differed between one resource's route file
 * and another's was which `baseUrl` it passed down - derived HERE, at
 * render time, from the URL's own first path segment (`/goals` ->
 * `"goals"` -> `"/api/v1/goals"`), matching this platform's own
 * established "URL segment always equals the backend resource name"
 * convention (confirmed for orgs/goals/metrics/check-ins - see
 * `createCrudRoutes`'s own docstring, which registers THIS SAME file
 * under every resource's own URL path).
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

function resourceFromPathname(pathname: string): string {
  return pathname.split("/").filter(Boolean)[0] ?? "";
}

// oxlint-disable-next-line react/only-export-components
export function meta({ location }: { location: { pathname: string } }) {
  const resource = resourceFromPathname(location.pathname);
  return [{ title: resource.charAt(0).toUpperCase() + resource.slice(1).replace(/-/g, " ") }];
}

export default function CrudListRoute() {
  const accessToken = useOutletContext<string>();
  const location = useLocation();
  const resource = resourceFromPathname(location.pathname);
  return <CrudListScreen baseUrl={`/api/v1/${resource}`} accessToken={accessToken} linkComponent={CrudLink} />;
}
