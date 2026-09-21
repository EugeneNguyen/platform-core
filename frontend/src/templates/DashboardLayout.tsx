import type { ReactNode } from "react";
import Header from "../organisms/Header";
import Sidebar from "../organisms/Sidebar";
import { DefaultLink, type AppShellUser, type LinkComponent, type NavItem } from "../types";

export interface DashboardLayoutProps {
  navItems: NavItem[];
  currentPath: string;
  linkComponent?: LinkComponent;
  brand?: ReactNode;
  user?: AppShellUser | null;
  onLogout?: () => void;
  children: ReactNode;
}

/**
 * Tabler's own "vertical sidebar + top navbar" page layout
 * (docs.tabler.io/ui/layout/page-layouts, "Navigation position": render
 * both navigations as direct children of `.page`, sidebar first) - not a
 * hand-rolled flex layout. `.page-wrapper`/`.page-body` offsetting around
 * the fixed sidebar is Tabler's own CSS, not this component's.
 */
function DashboardLayout({
  navItems,
  currentPath,
  linkComponent = DefaultLink,
  brand = "GoalNexa",
  user,
  onLogout,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="page">
      <Sidebar brand={brand} navItems={navItems} currentPath={currentPath} linkComponent={linkComponent} />
      <Header user={user} onLogout={onLogout} />
      <div className="page-wrapper">
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
