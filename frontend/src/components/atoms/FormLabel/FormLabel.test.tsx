import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FormLabel from "./FormLabel";

describe("FormLabel", () => {
  it("associates with its field via htmlFor", () => {
    render(<FormLabel htmlFor="name">Full name</FormLabel>);
    expect(screen.getByText("Full name")).toHaveAttribute("for", "name");
  });

  it("adds the required class when required is set", () => {
    render(<FormLabel required>Full name</FormLabel>);
    expect(screen.getByText("Full name")).toHaveClass("required");
  });

  it("omits the required class by default", () => {
    render(<FormLabel>Phone number</FormLabel>);
    expect(screen.getByText("Phone number")).not.toHaveClass("required");
  });
});
