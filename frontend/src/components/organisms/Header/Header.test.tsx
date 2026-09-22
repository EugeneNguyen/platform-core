import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Header from "./Header";

describe("Header", () => {
  it("renders no log out button when onLogout is omitted", () => {
    render(<Header />);
    expect(screen.queryByRole("button", { name: "Log out" })).not.toBeInTheDocument();
  });

  it("shows the user summary when a user is given", () => {
    render(<Header user={{ name: "Dev User", email: "dev@example.com" }} />);
    expect(screen.getByText("Dev User")).toBeInTheDocument();
  });

  it("calls onLogout when the log out button is clicked", () => {
    const onLogout = vi.fn();
    render(<Header onLogout={onLogout} />);
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(onLogout).toHaveBeenCalled();
  });
});
