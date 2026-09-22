import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DefaultLink } from "../../types";
import Sidebar from "./Sidebar";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Organizations", to: "/orgs" },
];

describe("Sidebar", () => {
  it("renders every nav item", () => {
    render(<Sidebar brand="GoalNexa" navItems={NAV_ITEMS} currentPath="/orgs" linkComponent={DefaultLink} />);
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Organizations" })).toBeInTheDocument();
  });

  it("marks only the item matching currentPath active", () => {
    render(<Sidebar brand="GoalNexa" navItems={NAV_ITEMS} currentPath="/orgs" linkComponent={DefaultLink} />);
    expect(screen.getByRole("link", { name: "Organizations" }).closest("li")).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Home" }).closest("li")).not.toHaveClass("active");
  });
});
