import { useState } from "react";
import type { LinkComponent, NavGroup } from "../../types";

export interface SidebarNavGroupProps {
  group: NavGroup;
  /** Whether each child link is the current page. */
  isActive: (to: string) => boolean;
  linkComponent: LinkComponent;
  /** Expanded sidebar: whether the group is open (the caller owns and remembers it). */
  open: boolean;
  onToggle: () => void;
  /** Folded icon rail: the group opens as Tabler's flyout on hover/focus instead - never left open, so it can't cover the page. */
  folded?: boolean;
}

/**
 * Tabler's own vertical-sidebar dropdown markup (`.nav-item.dropdown` >
 * `.dropdown-toggle` + `.dropdown-menu`), driven by React state rather
 * than Bootstrap's dropdown JS: expanded, Tabler renders the open menu
 * inline under its heading; folded, as a flyout beside the rail.
 */
function SidebarNavGroup({ group, isActive, linkComponent: Link, open, onToggle, folded = false }: SidebarNavGroupProps) {
  const [hovered, setHovered] = useState(false);
  const active = group.children.some((child) => isActive(child.to));
  const shown = folded ? hovered : open;
  const icon = group.icon ?? (folded ? <span className="fw-bold">{group.label.charAt(0).toUpperCase()}</span> : null);
  const menuId = `sidebar-group-${group.label.toLowerCase().replace(/\W+/g, "-")}`;

  return (
    <li
      className={`nav-item dropdown${active ? " active" : ""}`}
      title={folded ? group.label : undefined}
      onMouseEnter={folded ? () => setHovered(true) : undefined}
      onMouseLeave={folded ? () => setHovered(false) : undefined}
      onFocus={folded ? () => setHovered(true) : undefined}
      onBlur={
        folded
          ? (event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHovered(false);
            }
          : undefined
      }
    >
      <button
        type="button"
        className={`nav-link dropdown-toggle${shown ? " show" : ""}`}
        aria-expanded={shown}
        aria-controls={menuId}
        onClick={folded ? () => setHovered((prev) => !prev) : onToggle}
      >
        {icon && <span className="nav-link-icon">{icon}</span>}
        <span className="nav-link-title">{group.label}</span>
      </button>
      <div id={menuId} className={`dropdown-menu${shown ? " show" : ""}`}>
        {group.children.map((child) => (
          <Link key={child.to} to={child.to} className={`dropdown-item${isActive(child.to) ? " active" : ""}`}>
            {child.label}
          </Link>
        ))}
      </div>
    </li>
  );
}

export default SidebarNavGroup;
