import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import UserSummary from "./UserSummary";

describe("UserSummary", () => {
  it("renders the user's name and email", () => {
    render(<UserSummary user={{ name: "Dev User", email: "dev@example.com" }} />);
    expect(screen.getByText("Dev User")).toBeInTheDocument();
    expect(screen.getByText("dev@example.com")).toBeInTheDocument();
  });
});
