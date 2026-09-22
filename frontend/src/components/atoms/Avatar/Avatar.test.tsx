import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Avatar from "./Avatar";

describe("Avatar", () => {
  it("renders the first and last initials, uppercased", () => {
    render(<Avatar name="dev user" />);
    expect(screen.getByText("DU")).toBeInTheDocument();
  });

  it("renders a single initial for a one-word name", () => {
    render(<Avatar name="cher" />);
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("applies the size class", () => {
    const { container } = render(<Avatar name="Dev User" size="md" />);
    expect(container.querySelector(".avatar-md")).toBeInTheDocument();
  });
});
