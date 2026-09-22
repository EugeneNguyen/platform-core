import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Brand from "./Brand";

describe("Brand", () => {
  it("renders the label inside a link to the default href", () => {
    render(<Brand label="GoalNexa" />);
    expect(screen.getByRole("link", { name: "GoalNexa" })).toHaveAttribute("href", "/");
  });

  it("uses a custom linkComponent when given", () => {
    render(
      <Brand
        label="GoalNexa"
        href="/home"
        linkComponent={({ to, children }) => <a href={`custom:${to}`}>{children}</a>}
      />,
    );
    expect(screen.getByRole("link", { name: "GoalNexa" })).toHaveAttribute("href", "custom:/home");
  });
});
