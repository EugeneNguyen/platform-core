import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Header from "../../organisms/Header";
import Sidebar from "../../organisms/Sidebar";
import { DefaultLink, type AppShellUser, type LinkComponent, type NavEntry } from "../../types";

export interface DashboardLayoutProps {
  /** Links and collapsible groups (an entry with `children` - `NavGroup`); a group's open/closed state is remembered per browser. */
  navItems: NavEntry[];
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
const CLOSED_GROUPS_KEY = "platform-core:sidebar-closed-groups";

/** Which sidebar groups the viewer closed (by label) - remembered the same way as the fold (see `useSidebarFolded`). Groups start open. */
function useClosedGroups() {
  const [closed, setClosed] = useState<ReadonlySet<string>>(() => new Set());
  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(CLOSED_GROUPS_KEY) ?? "[]");
      if (Array.isArray(stored)) setClosed(new Set(stored.filter((value) => typeof value === "string")));
    } catch {
      // unavailable or malformed - all open
    }
  }, []);
  function toggle(label: string) {
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      try {
        window.localStorage.setItem(CLOSED_GROUPS_KEY, JSON.stringify([...next]));
      } catch {
        // unavailable - still toggles for this page view
      }
      return next;
    });
  }
  return [closed, toggle] as const;
}

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
 * comes from Tabler's own `.container-fluid`, which has to be an explicit
 * child (Tabler doesn't put it on `.page-body` for you). Fluid, not
 * `.container-xl`: content (and the header, which matches it) uses the
 * whole width beside the sidebar, with no max-width.
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
  const [closedGroups, toggleGroup] = useClosedGroups();
  return (
    <div className="page" style={{ "--tblr-sidebar-width": sidebarWidth } as CSSProperties}>
      <Sidebar
        brand={brand}
        navItems={navItems}
        currentPath={currentPath}
        linkComponent={linkComponent}
        folded={folded}
        closedGroups={closedGroups}
        onToggleGroup={toggleGroup}
      />
      <Header user={user} onLogout={onLogout} onToggleSidebar={toggleFolded} sidebarFolded={folded} />
      <div className="page-wrapper">
        <main className="page-body">
          <div className="container-fluid">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
