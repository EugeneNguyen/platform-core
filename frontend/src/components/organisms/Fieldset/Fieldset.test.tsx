import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Fieldset from "./Fieldset";

describe("Fieldset", () => {
  it("renders the legend as the fieldset's accessible name", () => {
    render(
      <Fieldset legend="Contact details">
        <input aria-label="Full name" />
      </Fieldset>,
    );
    expect(screen.getByRole("group", { name: "Contact details" })).toBeInTheDocument();
  });

  it("disables every field inside when disabled is set", () => {
    render(
      <Fieldset legend="Contact details" disabled>
        <input aria-label="Full name" />
        <input aria-label="Email" />
      </Fieldset>,
    );
    expect(screen.getByLabelText("Full name")).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();
  });
});
