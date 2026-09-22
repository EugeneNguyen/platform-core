import type { ComponentType, ReactNode } from "react";

export interface NavItem {
  label: string;
  to: string;
  icon?: ReactNode;
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
