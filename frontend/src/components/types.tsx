import type { ComponentType, ReactNode } from "react";

export interface NavItem {
  label: string;
  to: string;
  icon?: ReactNode;
  /** The permission codename needed to open it (e.g. `"orgs.view"`) - metadata for the HOST to filter on (e.g. platform-auth's `filterNavByPermissions`); AppShell itself renders every item it's given. */
  permission?: string;
}

/** A collapsible sidebar group - a heading (label + icon) over its own links. Its open/closed state is remembered per browser, keyed by `label`. */
export interface NavGroup {
  label: string;
  icon?: ReactNode;
  children: NavItem[];
}

/** One sidebar entry: a link, or a collapsible group of links. */
export type NavEntry = NavItem | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

export interface AppShellUser {
  name: string;
  email: string;
}

export interface LinkComponentProps {
  to: string;
  className?: string;
  /** Optional, not just permissive typing - `CrudListScreen`'s per-cell "click row to open detail" decoy anchors render with none (a `.stretched-link` whose whole job is an invisible, full-cell click target has no visible content to show). */
  children?: ReactNode;
  /** Passed through for the SAME decoy anchors - `tabIndex={-1}` + `aria-hidden` keep them out of the tab order and off screen readers, since the one VISIBLE, labeled link (e.g. "Edit") already provides the real keyboard/screen-reader path to the same destination. */
  tabIndex?: number;
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * Every level (atoms/molecules/organisms/templates) takes this instead of
 * calling a router hook directly - a consuming host may be on a different
 * react-router major version, or a separate module instance of the same
 * one, so a hook call here would throw. The host supplies its own `Link`.
 */
export type LinkComponent = ComponentType<LinkComponentProps>;

export function DefaultLink({ to, className, children, ...rest }: LinkComponentProps) {
  return (
    <a href={to} className={className} {...rest}>
      {children}
    </a>
  );
}

/**
 * One entry in the header's user menu (AppShell's `userMenu`): a link
 * (`to`, rendered with the host's `linkComponent`), a button (`onClick`),
 * a section heading (`header`) or a divider. `active` marks the current
 * choice (e.g. the selected organization) with a check. "Log out" is not
 * an entry - it's always last, from `onLogout`.
 */
export type UserMenuEntry =
  | { label: ReactNode; to: string; icon?: ReactNode; active?: boolean }
  | { label: ReactNode; onClick: () => void; icon?: ReactNode; active?: boolean }
  | { header: ReactNode }
  | { divider: true };
