import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Checkbox from "./Checkbox";

describe("Checkbox", () => {
  it("calls onChange with the new checked state", () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="Select task" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Select task"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("adds table-selectable-check when tableSelect is set", () => {
    render(<Checkbox aria-label="Select task" tableSelect />);
    expect(screen.getByLabelText("Select task")).toHaveClass("table-selectable-check");
  });
});
