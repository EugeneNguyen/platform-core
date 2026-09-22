import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Breadcrumb from "./Breadcrumb";

describe("Breadcrumb", () => {
  it("renders every item as a link except the last, which is the current page", () => {
    render(<Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Library", to: "/library" }, { label: "Data" }]} />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Library" })).toHaveAttribute("href", "/library");
    expect(screen.queryByRole("link", { name: "Data" })).not.toBeInTheDocument();

    const current = screen.getByText("Data");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveClass("breadcrumb-item", "active");
  });

  it("treats the last item as the current page even if it has a to", () => {
    render(<Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Data", to: "/data" }]} />);
    expect(screen.queryByRole("link", { name: "Data" })).not.toBeInTheDocument();
    expect(screen.getByText("Data")).toHaveAttribute("aria-current", "page");
  });

  it("wraps the list in a nav labeled Breadcrumb", () => {
    render(<Breadcrumb items={[{ label: "Home" }]} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("applies the separator and muted classes", () => {
    render(<Breadcrumb items={[{ label: "Home" }]} separator="dots" muted />);
    const list = screen.getByRole("list");
    expect(list).toHaveClass("breadcrumb", "breadcrumb-dots", "breadcrumb-muted");
  });

  it("uses a custom linkComponent for non-current items", () => {
    render(
      <Breadcrumb
        items={[{ label: "Home", to: "/" }, { label: "Data" }]}
        linkComponent={({ to, children }) => <a href={`custom:${to}`}>{children}</a>}
      />,
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "custom:/");
  });
});
