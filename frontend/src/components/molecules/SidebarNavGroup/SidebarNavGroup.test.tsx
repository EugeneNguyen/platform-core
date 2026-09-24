import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DefaultLink } from "../../types";
import SidebarNavGroup from "./SidebarNavGroup";

const GROUP = { label: "Access", children: [{ label: "Users", to: "/users" }, { label: "Roles", to: "/roles" }] };

function renderGroup(props: Partial<Parameters<typeof SidebarNavGroup>[0]> = {}) {
  return render(
    <ul>
      <SidebarNavGroup
        group={GROUP}
        isActive={(to) => to === "/roles"}
        linkComponent={DefaultLink}
        open
        onToggle={() => {}}
        {...props}
      />
    </ul>,
  );
}

describe("SidebarNavGroup", () => {
  it("shows its links when open and marks the group and the current link active", () => {
    const { container } = renderGroup();
    expect(container.querySelector(".dropdown-menu")).toHaveClass("show");
    expect(container.querySelector("li")).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Roles" })).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Users" })).not.toHaveClass("active");
  });

  it("hides its links when closed and asks the caller to toggle", () => {
    const onToggle = vi.fn();
    const { container } = renderGroup({ open: false, onToggle });
    expect(container.querySelector(".dropdown-menu")).not.toHaveClass("show");
    fireEvent.click(screen.getByRole("button", { name: "Access" }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("folded: opens as a flyout on hover only, ignoring the remembered state", () => {
    const onToggle = vi.fn();
    const { container } = renderGroup({ folded: true, open: true, onToggle });
    const menu = container.querySelector(".dropdown-menu");
    expect(menu).not.toHaveClass("show");
    fireEvent.mouseEnter(container.querySelector("li") as HTMLElement);
    expect(menu).toHaveClass("show");
    fireEvent.mouseLeave(container.querySelector("li") as HTMLElement);
    expect(menu).not.toHaveClass("show");
    expect(onToggle).not.toHaveBeenCalled();
  });
});
