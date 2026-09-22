import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardBody, CardFooter, CardHeader, CardImage, CardSubtitle, CardTitle } from "./Card";

describe("Card", () => {
  it("assembles header/title/subtitle/body/footer with the right classes", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Invoice #1024</CardTitle>
          <CardSubtitle>Due in 14 days</CardSubtitle>
        </CardHeader>
        <CardBody>Line items go here.</CardBody>
        <CardFooter>Total: $240</CardFooter>
      </Card>,
    );

    expect(screen.getByText("Line items go here.")).toHaveClass("card-body");
    expect(screen.getByText("Total: $240")).toHaveClass("card-footer");
    expect(screen.getByText("Due in 14 days")).toHaveClass("card-subtitle");
    expect(screen.getByRole("heading", { name: "Invoice #1024" })).toHaveClass("card-title");
    expect(screen.getByRole("heading", { name: "Invoice #1024" }).closest(".card-header")).toBeInTheDocument();
  });

  it("defaults CardTitle to an h3 and honors the as prop", () => {
    render(
      <>
        <CardTitle>Default level</CardTitle>
        <CardTitle as="h1">Top level</CardTitle>
      </>,
    );
    expect(screen.getByRole("heading", { name: "Default level", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Top level", level: 1 })).toBeInTheDocument();
  });

  it("renders CardImage with the position-specific class", () => {
    const { rerender } = render(<CardImage src="/a.jpg" alt="A" />);
    expect(screen.getByRole("img", { name: "A" })).toHaveClass("card-img-top");

    rerender(<CardImage src="/a.jpg" alt="A" position="bottom" />);
    expect(screen.getByRole("img", { name: "A" })).toHaveClass("card-img-bottom");
  });

  it("merges a caller-provided className on Card itself", () => {
    render(<Card className="border-danger">content</Card>);
    expect(screen.getByText("content")).toHaveClass("card", "border-danger");
  });
});
