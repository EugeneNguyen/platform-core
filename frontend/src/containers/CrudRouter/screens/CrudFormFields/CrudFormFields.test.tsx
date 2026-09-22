import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CrudField } from "../../lib/types";
import CrudFormFields from "./CrudFormFields";

interface Org {
  id: number;
  name: string;
  seats: number;
  active: boolean;
  plan: string;
}

const FIELDS: CrudField<Org>[] = [
  { key: "name", label: "Name", required: true },
  { key: "seats", label: "Seats", type: "number" },
  { key: "active", label: "Active", type: "checkbox" },
  {
    key: "plan",
    label: "Plan",
    type: "select",
    options: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
    ],
  },
];

describe("CrudFormFields", () => {
  it("renders a FormControl per non-checkbox field, prefilled from values", () => {
    render(<CrudFormFields fields={FIELDS} values={{ name: "Acme", seats: 5 }} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Name")).toHaveValue("Acme");
    expect(screen.getByLabelText("Seats")).toHaveValue(5);
  });

  it("renders a checkbox field as FormCheck", () => {
    render(<CrudFormFields fields={FIELDS} values={{ active: true }} onChange={vi.fn()} />);
    expect(screen.getByRole("checkbox", { name: "Active" })).toBeChecked();
  });

  it("renders a select field with its options, prefilled from values", () => {
    render(<CrudFormFields fields={FIELDS} values={{ plan: "pro" }} onChange={vi.fn()} />);
    const select = screen.getByLabelText("Plan");
    expect(select).toHaveValue("pro");
    expect(screen.getByRole("option", { name: "Free" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Pro" })).toBeInTheDocument();
  });

  it("calls onChange with the field key and the new value", () => {
    const onChange = vi.fn();
    render(<CrudFormFields fields={FIELDS} values={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Globex" } });
    expect(onChange).toHaveBeenCalledWith("name", "Globex");

    fireEvent.change(screen.getByLabelText("Seats"), { target: { value: "12" } });
    expect(onChange).toHaveBeenCalledWith("seats", 12);

    fireEvent.click(screen.getByRole("checkbox", { name: "Active" }));
    expect(onChange).toHaveBeenCalledWith("active", true);

    fireEvent.change(screen.getByLabelText("Plan"), { target: { value: "pro" } });
    expect(onChange).toHaveBeenCalledWith("plan", "pro");
  });

  it("lets an optional select be cleared back to null", () => {
    const onChange = vi.fn();
    render(<CrudFormFields fields={FIELDS} values={{ plan: "pro" }} onChange={onChange} />);

    const select = screen.getByLabelText("Plan") as HTMLSelectElement;
    expect(select.querySelector('option[value=""]')).not.toBeDisabled();
    fireEvent.change(select, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith("plan", null);
  });

  it("doesn't offer a re-selectable empty option on a required select", () => {
    const requiredFields: CrudField<Org>[] = [{ ...FIELDS[3], required: true }];
    render(<CrudFormFields fields={requiredFields} values={{}} onChange={vi.fn()} />);
    const select = screen.getByLabelText("Plan") as HTMLSelectElement;
    expect(select.querySelector('option[value=""]')).toBeDisabled();
  });
});
