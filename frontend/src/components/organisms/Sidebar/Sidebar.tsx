import type { ReactNode } from "react";
import Brand from "../../atoms/Brand";
import SidebarNavGroup from "../../molecules/SidebarNavGroup";
import SidebarNavItem from "../../molecules/SidebarNavItem";
import { isNavGroup, type LinkComponent, type NavEntry } from "../../types";

export interface SidebarProps {
  brand: ReactNode;
  /** Links and collapsible groups (`NavGroup` - an entry with `children`). */
  navItems: NavEntry[];
  currentPath: string;
  linkComponent: LinkComponent;
  /** Desktop (lg+) only: fold to Tabler's 4rem icon rail (`.navbar-folded` - Tabler's own CSS narrows it and re-offsets the header/page via `--tblr-sidebar-width`). Below lg the sidebar is the usual collapsible top bar either way. */
  folded?: boolean;
  /** Which groups are closed, by label (expanded sidebar) - absent = open. */
  closedGroups?: ReadonlySet<string>;
  onToggleGroup?: (label: string) => void;
}

function isActive(currentPath: string, to: string): boolean {
  return currentPath === to || currentPath.startsWith(`${to}/`);
}

/**
 * Tabler's vertical-navbar layout (docs.tabler.io/ui/layout/page-layouts,
 * "Sidebar layout") - a direct child of the host's `.page` wrapper
 * (see templates/DashboardLayout), not a standalone positioned element:
 * Tabler's own CSS gives `.navbar-vertical` its fixed positioning and
 * full height, and offsets `.page-wrapper` to make room for it.
 *
 * The mobile toggler (`data-bs-toggle="collapse"`) needs Bootstrap's
 * collapse JS to actually work - the host must load Tabler's JS bundle
 * (which includes it), same "host loads the design system" convention
 * as loading Tabler's CSS. See apps/main/frontend/app/root.tsx.
 */
function Sidebar({ brand, navItems, currentPath, linkComponent, folded = false, closedGroups, onToggleGroup }: SidebarProps) {
  return (
    <aside className={`navbar navbar-vertical navbar-expand-lg${folded ? " navbar-folded" : ""}`}>
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sidebar-menu"
          aria-controls="sidebar-menu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <Brand
          label={
            folded && typeof brand === "string" ? (
              // Folded is a desktop-only state - the mobile top bar keeps the full name.
              <>
                <span className="d-none d-lg-inline">{brand.charAt(0)}</span>
                <span className="d-lg-none">{brand}</span>
              </>
            ) : (
              brand
            )
          }
          linkComponent={linkComponent}
          // Tabler's lg sidebar brand is full-width `space-between`, which
          // puts a lone initial at the left edge - center it on the rail.
          className={folded ? "justify-content-lg-center" : undefined}
        />
        <div className="collapse navbar-collapse" id="sidebar-menu">
          <ul className="navbar-nav pt-lg-3">
            {navItems.map((item) =>
              isNavGroup(item) ? (
                <SidebarNavGroup
                  key={`group:${item.label}`}
                  group={item}
                  isActive={(to) => isActive(currentPath, to)}
                  linkComponent={linkComponent}
                  open={!closedGroups?.has(item.label)}
                  onToggle={() => onToggleGroup?.(item.label)}
                  folded={folded}
                />
              ) : (
                <SidebarNavItem
                  key={item.to}
                  item={item}
                  active={isActive(currentPath, item.to)}
                  linkComponent={linkComponent}
                  folded={folded}
                />
              ),
            )}
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
