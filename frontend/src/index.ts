/**
 * Package entry point - what a consuming app (apps/main) imports.
 *
 * `AppShell` (an alias for `templates/DashboardLayout`) is pure
 * presentation: sidemenu + sticky header, built from Tabler's own vertical-
 * navbar page layout, composed atomic-design style (atoms/molecules/
 * organisms/templates - see AGENTS.md). Zero react-router dependency of
 * its own (see `LinkComponentProps`' own docstring in types.tsx) and zero
 * auth-state of its own (user/onLogout are passed in, same pattern as
 * platform-org-frontend's OrgsScreen taking an accessToken prop). The
 * host wraps its own <Outlet/> (or equivalent) as `children`.
 */
export { default as AppShell } from "./templates/DashboardLayout";
export type { DashboardLayoutProps as AppShellProps } from "./templates/DashboardLayout";
export type { AppShellUser, LinkComponent, LinkComponentProps, NavItem } from "./types";
