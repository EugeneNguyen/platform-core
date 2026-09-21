import type { LinkComponent, NavItem } from "../types";

export interface SidebarNavItemProps {
  item: NavItem;
  active: boolean;
  linkComponent: LinkComponent;
}

function SidebarNavItem({ item, active, linkComponent: Link }: SidebarNavItemProps) {
  return (
    <li className={`nav-item ${active ? "active" : ""}`}>
      <Link to={item.to} className="nav-link">
        {item.icon && <span className="nav-link-icon">{item.icon}</span>}
        <span className="nav-link-title">{item.label}</span>
      </Link>
    </li>
  );
}

export default SidebarNavItem;
