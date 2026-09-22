import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FormCheck from "./FormCheck";

describe("FormCheck", () => {
  it("defaults to a checkbox and toggles on click", () => {
    const onChange = vi.fn();
    render(<FormCheck label="By email" onChange={onChange} />);
    const input = screen.getByRole("checkbox", { name: "By email" });
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalled();
  });

  it("renders a radio when type is radio, grouped by name", () => {
    render(
      <>
        <FormCheck type="radio" name="contact" label="By email" defaultChecked />
        <FormCheck type="radio" name="contact" label="By phone" />
      </>,
    );
    expect(screen.getByRole("radio", { name: "By email" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "By phone" })).not.toBeChecked();
  });

  it("marks the label required", () => {
    render(<FormCheck label="I agree to the Terms" required />);
    expect(screen.getByText("I agree to the Terms")).toHaveClass("required");
  });
});
