import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AppFooter from "./app-footer";

/**
 * footer unit test,. Static content,
 * no per-route branching to partition — a single smoke-level render check
 * is the full coverage this component needs.
 */
describe("AppFooter", () => {
  it(": renders", () => {
    render(<AppFooter />);

    expect(screen.getByText("platform-core")).toBeInTheDocument();
    expect(
      screen.getByText("Self-hosted, ISTQB/IEEE 829-aligned test management"),
    ).toBeInTheDocument();
  });
});
