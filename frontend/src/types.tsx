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
  children: ReactNode;
}

/**
 * Every level (atoms/molecules/organisms/templates) takes this instead of
 * calling a router hook directly - a consuming host may be on a different
 * react-router major version, or a separate module instance of the same
 * one, so a hook call here would throw. The host supplies its own `Link`.
 */
export type LinkComponent = ComponentType<LinkComponentProps>;

export function DefaultLink({ to, className, children }: LinkComponentProps) {
  return (
    <a href={to} className={className}>
      {children}
    </a>
  );
}
