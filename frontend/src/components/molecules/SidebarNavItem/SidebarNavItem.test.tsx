import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DefaultLink } from "../../types";
import SidebarNavItem from "./SidebarNavItem";

describe("SidebarNavItem", () => {
  it("marks the item active when active is true", () => {
    render(
      <ul>
        <SidebarNavItem item={{ label: "Home", to: "/" }} active linkComponent={DefaultLink} />
      </ul>,
    );
    expect(screen.getByRole("listitem")).toHaveClass("active");
  });

  it("links to the item's path", () => {
    render(
      <ul>
        <SidebarNavItem item={{ label: "Orgs", to: "/orgs" }} active={false} linkComponent={DefaultLink} />
      </ul>,
    );
    expect(screen.getByRole("link", { name: "Orgs" })).toHaveAttribute("href", "/orgs");
  });
});
