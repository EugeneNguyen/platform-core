import type { LinkComponent, NavItem } from "../../types";

export interface SidebarNavItemProps {
  item: NavItem;
  active: boolean;
  linkComponent: LinkComponent;
  /** Sidebar is folded to its icon rail - the title is hidden (Tabler's own `.navbar-folded` CSS), so an item with no icon falls back to its first letter, and the label moves into a `title` tooltip. */
  folded?: boolean;
}

function SidebarNavItem({ item, active, linkComponent: Link, folded = false }: SidebarNavItemProps) {
  const icon = item.icon ?? (folded ? <span className="fw-bold">{item.label.charAt(0).toUpperCase()}</span> : null);
  return (
    <li className={`nav-item ${active ? "active" : ""}`} title={folded ? item.label : undefined}>
      <Link to={item.to} className="nav-link">
        {icon && <span className="nav-link-icon">{icon}</span>}
        <span className="nav-link-title">{item.label}</span>
      </Link>
    </li>
  );
}

export default SidebarNavItem;
