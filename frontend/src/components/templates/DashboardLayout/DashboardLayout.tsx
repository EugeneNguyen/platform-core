import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
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
  /** Whether the desktop sidebar starts folded to its icon rail, before any remembered choice is read. @default false */
  defaultSidebarFolded?: boolean;
  /**
   * The unfolded desktop sidebar's width - Tabler's `--tblr-sidebar-width`
   * (its own default is 16rem), set on `.page` so the sidebar, header and
   * page offset all follow it. Folding still wins: Tabler sets the folded
   * width directly on the sidebar and its siblings. @default "13rem"
   */
  sidebarWidth?: string;
  children: ReactNode;
}

const FOLDED_KEY = "platform-core:sidebar-folded";

/**
 * Remembered per browser (localStorage - a per-viewer convenience, fine to
 * lose). Read AFTER mount, not in the initial state: the server render
 * can't see localStorage, and reading it during the first client render
 * would mismatch hydration. Storage can throw (private mode, blocked
 * site data) - then it just isn't remembered.
 */
function useSidebarFolded(initial: boolean) {
  const [folded, setFolded] = useState(initial);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FOLDED_KEY);
      if (stored !== null) setFolded(stored === "1");
    } catch {
      // unavailable - keep the default
    }
  }, []);
  function toggle() {
    setFolded((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(FOLDED_KEY, next ? "1" : "0");
      } catch {
        // unavailable - still toggles for this page view
      }
      return next;
    });
  }
  return [folded, toggle] as const;
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
  defaultSidebarFolded = false,
  sidebarWidth = "13rem",
  children,
}: DashboardLayoutProps) {
  const [folded, toggleFolded] = useSidebarFolded(defaultSidebarFolded);
  return (
    <div className="page" style={{ "--tblr-sidebar-width": sidebarWidth } as CSSProperties}>
      <Sidebar
        brand={brand}
        navItems={navItems}
        currentPath={currentPath}
        linkComponent={linkComponent}
        folded={folded}
      />
      <Header user={user} onLogout={onLogout} onToggleSidebar={toggleFolded} sidebarFolded={folded} />
      <div className="page-wrapper">
        <main className="page-body">
          <div className="container-xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
