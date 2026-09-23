import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Drawer from "./Drawer";

describe("Drawer", () => {
  it("renders nothing when closed", () => {
    render(
      <Drawer open={false} title="Goal" onClose={vi.fn()}>
        body
      </Drawer>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders a labelled panel on the chosen edge and locks page scroll", () => {
    const { unmount } = render(
      <Drawer open title="Goal" onClose={vi.fn()} placement="start">
        <p>body</p>
      </Drawer>,
    );
    const dialog = screen.getByRole("dialog", { name: "Goal" });
    expect(dialog).toHaveClass("offcanvas", "offcanvas-start", "show");
    expect(screen.getByText("body")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes on Escape, the close button and a backdrop click - not a click inside", () => {
    const onClose = vi.fn();
    render(
      <Drawer open title="Goal" onClose={onClose}>
        <p>body</p>
      </Drawer>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(document.querySelector(".offcanvas-backdrop") as Element);
    fireEvent.click(screen.getByText("body"));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("leaves Escape to a modal open above it", () => {
    const onClose = vi.fn();
    render(
      <Drawer open title="Goal" onClose={onClose}>
        <p>body</p>
      </Drawer>,
    );
    document.body.classList.add("modal-open");
    fireEvent.keyDown(document, { key: "Escape" });
    document.body.classList.remove("modal-open");
    expect(onClose).not.toHaveBeenCalled();
  });
});
