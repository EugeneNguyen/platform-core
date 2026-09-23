import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Icon from "./Icon";

describe("Icon", () => {
  it("renders a decorative Tabler-sized svg", () => {
    const { container } = render(<Icon name="pencil" className="me-1" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("icon", "me-1");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
