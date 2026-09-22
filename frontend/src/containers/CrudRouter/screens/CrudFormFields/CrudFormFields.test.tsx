import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CrudField } from "../../lib/types";
import CrudFormFields from "./CrudFormFields";

interface Org {
  id: number;
  name: string;
  seats: number;
  active: boolean;
}

const FIELDS: CrudField<Org>[] = [
  { key: "name", label: "Name", required: true },
  { key: "seats", label: "Seats", type: "number" },
  { key: "active", label: "Active", type: "checkbox" },
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

  it("calls onChange with the field key and the new value", () => {
    const onChange = vi.fn();
    render(<CrudFormFields fields={FIELDS} values={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Globex" } });
    expect(onChange).toHaveBeenCalledWith("name", "Globex");

    fireEvent.change(screen.getByLabelText("Seats"), { target: { value: "12" } });
    expect(onChange).toHaveBeenCalledWith("seats", 12);

    fireEvent.click(screen.getByRole("checkbox", { name: "Active" }));
    expect(onChange).toHaveBeenCalledWith("active", true);
  });
});
