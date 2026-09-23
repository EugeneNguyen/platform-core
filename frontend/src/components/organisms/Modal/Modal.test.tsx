import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Modal from "./Modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(
      <Modal open={false} title="Check in" onClose={vi.fn()}>
        body
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders a labelled dialog with body and footer, and locks page scroll", () => {
    render(
      <Modal open title="Check in" onClose={vi.fn()} footer={<button type="button">Save</button>}>
        <p>body</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog", { name: "Check in" })).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(document.body).toHaveClass("modal-open");
  });

  it("closes on Escape, the close button and a backdrop click - not a click inside", () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Check in" onClose={onClose}>
        <p>body</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.mouseDown(dialog);
    fireEvent.click(dialog);
    fireEvent.mouseDown(screen.getByText("body"));
    fireEvent.click(screen.getByText("body"));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("returns focus to the opener and unlocks scroll when closed", () => {
    function Harness({ open }: { open: boolean }) {
      return (
        <>
          <button type="button">opener</button>
          <Modal open={open} title="Check in" onClose={vi.fn()}>
            <input aria-label="Value" autoFocus />
          </Modal>
        </>
      );
    }
    const { rerender } = render(<Harness open={false} />);
    screen.getByRole("button", { name: "opener" }).focus();
    rerender(<Harness open />);
    expect(screen.getByLabelText("Value")).toHaveFocus();
    rerender(<Harness open={false} />);
    expect(screen.getByRole("button", { name: "opener" })).toHaveFocus();
    expect(document.body).not.toHaveClass("modal-open");
  });
});
