import type { ReactNode } from "react";
import Header from "../../organisms/Header";
import Sidebar from "../../organisms/Sidebar";
import { DefaultLink, type AppShellUser, type LinkComponent, type NavItem } from "../../types";

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
 *
 * `.page-body` itself only adds vertical padding - the horizontal gutter
 * (and the max-width that keeps a wide viewport from stretching content
 * edge to edge) comes from Tabler's own `.container-xl`, which has to be
 * an explicit child (Tabler doesn't put it on `.page-body` for you,
 * since not every page wants the same container width).
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
        <main className="page-body">
          <div className="container-xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
