import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InfoBox, infoBoxIconColorClassName } from "./info-box/info-box";

/**
 * Unit tests for `InfoBox` after its AdminLTE -> Tabler markup swap. Every
 * behavioral guarantee from the AdminLTE-era suite is carried over (icon
 * supplied vs. omitted, testId forwarding, color application, `ReactNode`
 * passthrough, `className` append) and re-aimed at the new `.card`/`.avatar`
 * shape — see `info-box.tsx`'s own header for the markup provenance.
 */
describe("InfoBox", () => {
  it("renders a Tabler card with the label and number", () => {
    const { container } = render(
      <InfoBox color="primary" text="Projects" number={42} icon="fa-solid fa-folder" />,
    );

    const root = container.firstElementChild;
    expect(root).toHaveClass("card");
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders a populated .avatar icon badge when `icon` is supplied", () => {
    const { container } = render(
      <InfoBox color="warning" text="Blocked" number={7} icon="fa-solid fa-gear" />,
    );

    const avatar = container.querySelector(".avatar");
    expect(avatar).not.toBeNull();
    expect(avatar).toHaveClass("bg-warning-lt");

    const glyph = avatar?.querySelector("i");
    expect(glyph).toHaveClass("fa-solid", "fa-gear");
    expect(glyph).toHaveAttribute("aria-hidden", "true");
  });

  it("renders no .avatar element at all when `icon` is omitted", () => {
    const { container } = render(<InfoBox color="secondary" text="Skipped" number={0} />);

    expect(container.querySelector(".avatar")).toBeNull();
    expect(screen.getByText("Skipped")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("applies the contextual color class for every member of the color union", () => {
    for (const [color, expectedClass] of Object.entries(infoBoxIconColorClassName)) {
      const { container, unmount } = render(
        <InfoBox
          color={color as keyof typeof infoBoxIconColorClassName}
          text="Label"
          number={1}
          icon="fa-solid fa-bell"
        />,
      );
      expect(container.querySelector(".avatar")).toHaveClass(expectedClass);
      unmount();
    }
  });

  it("forwards `testId` to the root .card", () => {
    render(<InfoBox color="primary" text="Projects" number={42} testId="widget-project-count" />);

    const root = screen.getByTestId("widget-project-count");
    expect(root).toHaveClass("card");
  });

  it("forwards `numberTestId` to the number element, not the root", () => {
    // Keeps existing call sites' `-count` testids resolving to the same
    // logical element they did pre-migration.
    render(
      <InfoBox
        color="success"
        text="Pass"
        number={12}
        testId="dashboard-tile-pass"
        numberTestId="dashboard-tile-pass-count"
      />,
    );

    const numberEl = screen.getByTestId("dashboard-tile-pass-count");
    expect(numberEl.textContent).toBe("12");
    expect(screen.getByTestId("dashboard-tile-pass")).toHaveClass("card");
  });

  it("omits both data-testid attributes entirely when neither prop is passed", () => {
    const { container } = render(<InfoBox color="primary" text="Projects" number={42} />);

    expect(container.querySelector(".card")).not.toHaveAttribute("data-testid");
  });

  it("renders a null/sentinel `number` verbatim, whatever convention the caller uses", () => {
    render(
      <InfoBox
        color="secondary"
        text="Skipped"
        number="—"
        numberTestId="dashboard-tile-skipped-count"
      />,
    );

    expect(screen.getByTestId("dashboard-tile-skipped-count").textContent).toBe("—");
  });

  it("renders a loading/error/count tri-state through the same `number` prop", () => {
    const { rerender } = render(
      <InfoBox color="primary" text="Projects" number="Loading…" testId="w" />,
    );
    expect(screen.getByTestId("w")).toHaveTextContent(/loading/i);
    expect(screen.getByTestId("w").textContent).not.toContain("—");

    rerender(<InfoBox color="primary" text="Projects" number="Unable to load" testId="w" />);
    expect(screen.getByTestId("w")).toHaveTextContent(/unable to load/i);

    rerender(<InfoBox color="primary" text="Projects" number={0} testId="w" />);
    expect(screen.getByTestId("w")).toHaveTextContent("0");
    expect(screen.getByTestId("w").textContent).not.toContain("—");
  });

  it("accepts arbitrary ReactNode for `number` (numbers, strings, JSX)", () => {
    const { rerender } = render(<InfoBox color="primary" text="Count" number={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();

    rerender(<InfoBox color="primary" text="Revenue" number="$1.999,50" />);
    expect(screen.getByText("$1.999,50")).toBeInTheDocument();

    rerender(
      <InfoBox
        color="primary"
        text="Status"
        number={<span data-testid="custom-number">Pending</span>}
      />,
    );
    expect(screen.getByTestId("custom-number")).toBeInTheDocument();
  });

  it("appends a caller-supplied className alongside the base card class", () => {
    const { container } = render(
      <InfoBox color="primary" text="Projects" number={42} className="mb-0" />,
    );

    const root = container.firstElementChild;
    expect(root).toHaveClass("card");
    expect(root).toHaveClass("mb-0");
  });
});
