import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CrudConfig } from "../../lib/types";
import CrudEditScreen from "./CrudEditScreen";

interface Org {
  id: number;
  name: string;
}

function baseConfig(overrides: Partial<CrudConfig<Org>> = {}): CrudConfig<Org> {
  return {
    resource: "orgs",
    endpoint: "/api/v1/orgs",
    columns: [{ key: "name", header: "Name" }],
    fields: [{ key: "name", label: "Name", required: true }],
    rowKey: (row) => row.id,
    ...overrides,
  };
}

describe("CrudEditScreen", () => {
  it("loads the record and prefills the form", async () => {
    const read = vi.fn().mockResolvedValue({ id: 1, name: "Acme" });
    render(<CrudEditScreen config={baseConfig({ api: { read } })} id={1} />);

    expect(screen.getByText("Loading…")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Name")).toHaveValue("Acme"));
    expect(read).toHaveBeenCalledWith(1);
  });

  it("submits the edited values to update and calls onUpdated", async () => {
    const read = vi.fn().mockResolvedValue({ id: 1, name: "Acme" });
    const update = vi.fn().mockResolvedValue({ id: 1, name: "Acme Inc" });
    const onUpdated = vi.fn();

    render(<CrudEditScreen config={baseConfig({ api: { read, update } })} id={1} onUpdated={onUpdated} />);
    await waitFor(() => expect(screen.getByLabelText("Name")).toHaveValue("Acme"));

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Acme Inc" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(update).toHaveBeenCalledWith(1, { name: "Acme Inc" }));
    expect(onUpdated).toHaveBeenCalledWith({ id: 1, name: "Acme Inc" });
  });

  it("deletes after confirmation and calls onDeleted", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const read = vi.fn().mockResolvedValue({ id: 1, name: "Acme" });
    const remove = vi.fn().mockResolvedValue(undefined);
    const onDeleted = vi.fn();

    render(<CrudEditScreen config={baseConfig({ api: { read, remove } })} id={1} onDeleted={onDeleted} />);
    await waitFor(() => expect(screen.getByLabelText("Name")).toHaveValue("Acme"));

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith(1));
    expect(onDeleted).toHaveBeenCalled();
  });

  it("shows a load error instead of the form when read rejects", async () => {
    const read = vi.fn().mockRejectedValue(new Error("Not found"));
    render(<CrudEditScreen config={baseConfig({ api: { read } })} id={999} />);

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Not found"));
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("frames the fields and Save/Delete buttons in a Card", async () => {
    const read = vi.fn().mockResolvedValue({ id: 1, name: "Acme" });
    render(<CrudEditScreen config={baseConfig({ api: { read } })} id={1} />);
    await waitFor(() => expect(screen.getByLabelText("Name")).toHaveValue("Acme"));

    expect(screen.getByLabelText("Name").closest(".card-body")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" }).closest(".card-footer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" }).closest(".card-footer")).toBeInTheDocument();
  });
});
