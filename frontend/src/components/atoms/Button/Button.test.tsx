import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Button from "./Button";

describe("Button", () => {
  it("defaults to a plain, colorless, small button of type button", () => {
    render(<Button>Click</Button>);
    const button = screen.getByRole("button", { name: "Click" });
    expect(button).toHaveClass("btn", "btn-sm");
    expect(button.className).not.toMatch(/btn-(primary|secondary|link)/);
    expect(button).toHaveAttribute("type", "button");
  });

  it("applies a solid variant class", () => {
    render(<Button variant="primary">Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveClass("btn-primary");
  });

  it("applies an outline variant class instead of a solid one", () => {
    render(
      <Button variant="danger" outline>
        Delete
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toHaveClass("btn-outline-danger");
    expect(button).not.toHaveClass("btn-danger");
  });

  it("renders the link variant without an outline form", () => {
    render(
      <Button variant="link" outline>
        Remove
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Remove" });
    expect(button).toHaveClass("btn-link");
    expect(button.className).not.toMatch(/outline/);
  });

  it("supports md/lg sizes", () => {
    const { rerender } = render(<Button size="md">Click</Button>);
    expect(screen.getByRole("button")).not.toHaveClass("btn-sm", "btn-lg");

    rerender(<Button size="lg">Click</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-lg");
  });

  it("adds btn-icon and merges a caller className", () => {
    render(
      <Button icon aria-label="Columns" className="btn-outline-secondary">
        X
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Columns" })).toHaveClass("btn-icon", "btn-outline-secondary");
  });

  it("respects an explicit type override for a real submit button", () => {
    render(<Button type="submit">Create</Button>);
    expect(screen.getByRole("button", { name: "Create" })).toHaveAttribute("type", "submit");
  });
});
