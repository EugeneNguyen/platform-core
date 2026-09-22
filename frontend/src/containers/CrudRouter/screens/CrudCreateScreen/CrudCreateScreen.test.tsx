import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CrudConfig } from "../../lib/types";
import CrudCreateScreen from "./CrudCreateScreen";

interface Org {
  id: number;
  name: string;
  active: boolean;
}

function baseConfig(overrides: Partial<CrudConfig<Org>> = {}): CrudConfig<Org> {
  return {
    resource: "orgs",
    endpoint: "/api/v1/orgs",
    columns: [{ key: "name", header: "Name" }],
    fields: [
      { key: "name", label: "Name", required: true },
      { key: "active", label: "Active", type: "checkbox" },
    ],
    rowKey: (row) => row.id,
    ...overrides,
  };
}

describe("CrudCreateScreen", () => {
  it("submits the entered field values and calls onCreated", async () => {
    const create = vi.fn().mockResolvedValue({ id: 1, name: "Acme", active: true });
    const onCreated = vi.fn();

    render(<CrudCreateScreen config={baseConfig({ api: { create } })} onCreated={onCreated} />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Acme" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Active" }));
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => expect(create).toHaveBeenCalledWith({ name: "Acme", active: true }));
    expect(onCreated).toHaveBeenCalledWith({ id: 1, name: "Acme", active: true });
  });

  it("shows the error and does not call onCreated when create rejects", async () => {
    const create = vi.fn().mockRejectedValue(new Error("Name already taken"));
    const onCreated = vi.fn();

    render(<CrudCreateScreen config={baseConfig({ api: { create } })} onCreated={onCreated} />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Acme" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Name already taken"));
    expect(onCreated).not.toHaveBeenCalled();
  });

  it("marks a required field as required", () => {
    render(<CrudCreateScreen config={baseConfig()} />);
    expect(screen.getByLabelText("Name")).toBeRequired();
  });

  it("frames the fields and submit button in a Card", () => {
    render(<CrudCreateScreen config={baseConfig()} />);
    expect(screen.getByLabelText("Name").closest(".card-body")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" }).closest(".card-footer")).toBeInTheDocument();
  });
});
