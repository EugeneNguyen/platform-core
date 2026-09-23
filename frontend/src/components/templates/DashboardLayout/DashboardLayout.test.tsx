import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  describe("sidebar folding", () => {
    // In-memory Storage - Node 25's own experimental `localStorage` global
    // shadows jsdom's and isn't usable without a backing file.
    beforeEach(() => {
      const store = new Map<string, string>();
      vi.stubGlobal("localStorage", {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => void store.set(key, value),
        removeItem: (key: string) => void store.delete(key),
        clear: () => store.clear(),
      });
    });
    afterEach(() => vi.unstubAllGlobals());

    it("toggles the sidebar fold from the header and remembers it", () => {
      const { unmount } = render(
        <DashboardLayout navItems={[{ label: "Home", to: "/" }]} currentPath="/">
          <div />
        </DashboardLayout>,
      );
      expect(document.querySelector("aside")).not.toHaveClass("navbar-folded");
      fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
      expect(document.querySelector("aside")).toHaveClass("navbar-folded");
      expect(window.localStorage.getItem("platform-core:sidebar-folded")).toBe("1");
      unmount();

      render(
        <DashboardLayout navItems={[{ label: "Home", to: "/" }]} currentPath="/">
          <div />
        </DashboardLayout>,
      );
      expect(document.querySelector("aside")).toHaveClass("navbar-folded");
      fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
      expect(document.querySelector("aside")).not.toHaveClass("navbar-folded");
    });
  });

  it("narrows the sidebar through Tabler's width variable", () => {
    const { container } = render(<DashboardLayout navItems={[]} currentPath="/">content</DashboardLayout>);
    expect((container.querySelector(".page") as HTMLElement).style.getPropertyValue("--tblr-sidebar-width")).toBe("13rem");
  });
});
