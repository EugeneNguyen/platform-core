import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import UserMenu from "./UserMenu";

const user = { name: "Dev User", email: "dev@example.com" };

function openMenu() {
  fireEvent.click(screen.getByRole("button", { name: "Account menu for Dev User" }));
}

describe("UserMenu", () => {
  it("is closed until the toggle is clicked, and calls onOpen", () => {
    const onOpen = vi.fn();
    render(<UserMenu user={user} items={[{ label: "Manage", to: "/orgs" }]} onOpen={onOpen} />);
    expect(screen.queryByRole("link", { name: "Manage" })).not.toBeInTheDocument();
    openMenu();
    expect(screen.getByRole("link", { name: "Manage" })).toHaveAttribute("href", "/orgs");
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("renders headers, marks the active entry, and closes after a pick", () => {
    const onPick = vi.fn();
    render(
      <UserMenu
        user={user}
        items={[
          { header: "Organization" },
          { label: "Acme", onClick: onPick, active: true },
          { label: "Globex", onClick: vi.fn() },
        ]}
      />,
    );
    openMenu();
    expect(screen.getByText("Organization")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Acme" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Globex" })).not.toHaveAttribute("aria-current");
    fireEvent.click(screen.getByRole("button", { name: "Acme" }));
    expect(onPick).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Globex" })).not.toBeInTheDocument();
  });

  it("closes on Escape and on an outside click", () => {
    render(<UserMenu user={user} onLogout={vi.fn()} />);
    openMenu();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("button", { name: "Log out" })).not.toBeInTheDocument();
    openMenu();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("button", { name: "Log out" })).not.toBeInTheDocument();
  });
});
