import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FormControl from "./FormControl";

describe("FormControl", () => {
  it("renders a form-control input carrying through native props", () => {
    render(<FormControl aria-label="Email" type="email" required autoComplete="email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveClass("form-control");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("autocomplete", "email");
  });

  it("merges a caller-provided className", () => {
    render(<FormControl aria-label="Name" className="is-invalid" />);
    expect(screen.getByLabelText("Name")).toHaveClass("form-control", "is-invalid");
  });

  it("defaults to the small size", () => {
    render(<FormControl aria-label="Name" />);
    expect(screen.getByLabelText("Name")).toHaveClass("form-control-sm");
  });

  it("supports md/lg sizes", () => {
    const { rerender } = render(<FormControl aria-label="Name" size="md" />);
    expect(screen.getByLabelText("Name")).not.toHaveClass("form-control-sm", "form-control-lg");

    rerender(<FormControl aria-label="Name" size="lg" />);
    expect(screen.getByLabelText("Name")).toHaveClass("form-control-lg");
  });
});
