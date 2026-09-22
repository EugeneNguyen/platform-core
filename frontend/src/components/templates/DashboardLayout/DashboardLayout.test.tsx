import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DashboardLayout from "./DashboardLayout";

describe("DashboardLayout", () => {
  it("renders the sidebar's nav items and the children content", () => {
    render(
      <DashboardLayout navItems={[{ label: "Home", to: "/" }]} currentPath="/">
        <p>page content</p>
      </DashboardLayout>,
    );
    expect(screen.getByText("page content")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });

  it("defaults the brand to GoalNexa", () => {
    render(
      <DashboardLayout navItems={[]} currentPath="/">
        <div />
      </DashboardLayout>,
    );
    expect(screen.getByRole("link", { name: "GoalNexa" })).toBeInTheDocument();
  });
});
