import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CrudConfig } from "../../lib/types";
import CrudListScreen from "./CrudListScreen";

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
    fetcher: vi.fn().mockResolvedValue({ items: [{ id: 1, name: "Acme" }], total: 1, page: 1, page_size: 25 }),
    ...overrides,
  };
}

describe("CrudListScreen", () => {
  it("renders a New link to the create path and an Edit link per row", async () => {
    render(<CrudListScreen config={baseConfig()} />);
    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());

    expect(screen.getByRole("link", { name: "New" })).toHaveAttribute("href", "orgs/new");
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute("href", "orgs/1/edit");
  });

  it("frames the New link and search box in the Card header, table full-bleed in the Card", async () => {
    const { container } = render(<CrudListScreen config={baseConfig()} />);
    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());

    const card = container.querySelector(".card");
    expect(card).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New" }).closest(".card-header")).toBeInTheDocument();
    expect(screen.getByLabelText("Search").closest(".card-header")).toBeInTheDocument();
    // No .card-body padding wrapper around the table itself (Tabler's
    // own "toolbar in the header, table full-bleed below" card shape).
    expect(screen.getByRole("table").closest(".card-body")).not.toBeInTheDocument();
    expect(card?.contains(screen.getByRole("table"))).toBe(true);
  });

  it("puts the Columns picker in the Card header and Pagination in the Card footer", async () => {
    render(<CrudListScreen config={baseConfig()} />);
    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());

    expect(screen.getByRole("button", { name: "Columns" }).closest(".card-header")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 1").closest(".card-footer")).toBeInTheDocument();
  });

  it("aligns Edit and Delete as matching small link-styled buttons", async () => {
    render(<CrudListScreen config={baseConfig()} />);
    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());

    const edit = screen.getByRole("link", { name: "Edit" });
    const del = screen.getByRole("button", { name: "Delete" });
    expect(edit).toHaveClass("btn", "btn-link", "btn-sm");
    expect(del).toHaveClass("btn", "btn-link", "btn-sm");
  });

  it("gives every DATA cell (not the actions cell) an invisible, unfocusable decoy link to the edit page", async () => {
    render(<CrudListScreen config={baseConfig()} />);
    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());

    const row = screen.getByText("Acme").closest("tr")!;
    const decoys = row.querySelectorAll("a.stretched-link");
    expect(decoys.length).toBeGreaterThan(0);
    for (const decoy of decoys) {
      expect(decoy).toHaveAttribute("href", "orgs/1/edit");
      expect(decoy).toHaveAttribute("tabindex", "-1");
      expect(decoy).toHaveAttribute("aria-hidden", "true");
      // Every decoy's own cell (not the whole `<tr>`) is the positioned
      // container it stretches to fill - a `<tr>` doesn't reliably act
      // as one in real browsers, see this file's own docstring.
      expect(decoy.closest("td")).toHaveClass("position-relative");
    }

    // The actions cell (Edit/Delete) deliberately has none - see this
    // file's own docstring for why a same-cell decoy there blocked
    // Delete's clicks in a real browser.
    const actionsCell = screen.getByRole("button", { name: "Delete" }).closest("td")!;
    expect(actionsCell.querySelector("a.stretched-link")).not.toBeInTheDocument();
  });

  it("hides the search box when config.searchable is false", async () => {
    render(<CrudListScreen config={baseConfig({ searchable: false })} />);
    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());
    expect(screen.queryByLabelText("Search")).not.toBeInTheDocument();
  });

  it("refetches through the header's search box (shares state with DataTable, not a second instance)", async () => {
    const fetcher = vi.fn().mockResolvedValue({ items: [{ id: 1, name: "Acme" }], total: 1, page: 1, page_size: 25 });
    render(<CrudListScreen config={baseConfig({ fetcher })} />);
    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "acme" } });
    await waitFor(() =>
      expect(fetcher).toHaveBeenLastCalledWith(expect.stringContaining("q=acme")),
    );
  });

  it("deletes a row after confirmation and calls onDeleted", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const remove = vi.fn().mockResolvedValue(undefined);
    const onDeleted = vi.fn();
    const config = baseConfig({ api: { remove } });

    render(<CrudListScreen config={config} onDeleted={onDeleted} />);
    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith(1));
    expect(onDeleted).toHaveBeenCalledWith({ id: 1, name: "Acme" });
  });

  it("does not delete when the confirmation is declined", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const remove = vi.fn();
    render(<CrudListScreen config={baseConfig({ api: { remove } })} />);
    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(remove).not.toHaveBeenCalled();
  });
});
