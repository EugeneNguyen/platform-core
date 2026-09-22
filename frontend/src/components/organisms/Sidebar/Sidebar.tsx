import type { ReactNode } from "react";
import Brand from "../../atoms/Brand";
import SidebarNavItem from "../../molecules/SidebarNavItem";
import type { LinkComponent, NavItem } from "../../types";

export interface SidebarProps {
  brand: ReactNode;
  navItems: NavItem[];
  currentPath: string;
  linkComponent: LinkComponent;
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
function Sidebar({ brand, navItems, currentPath, linkComponent }: SidebarProps) {
  return (
    <aside className="navbar navbar-vertical navbar-expand-lg">
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
        <Brand label={brand} linkComponent={linkComponent} />
        <div className="collapse navbar-collapse" id="sidebar-menu">
          <ul className="navbar-nav pt-lg-3">
            {navItems.map((item) => (
              <SidebarNavItem
                key={item.to}
                item={item}
                active={isActive(currentPath, item.to)}
                linkComponent={linkComponent}
              />
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
