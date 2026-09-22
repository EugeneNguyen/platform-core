import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DataTableColumn, DataTablePage } from "./types";
import { useDataTable } from "./useDataTable";

interface Row {
  id: number;
  name: string;
  status: string;
}

const COLUMNS: DataTableColumn<Row>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "status", header: "Status" },
  { key: "id", header: "ID", hidden: true },
];

function page(items: Row[], overrides: Partial<DataTablePage<Row>> = {}): DataTablePage<Row> {
  return { items, total: items.length, page: 1, page_size: 25, ...overrides };
}

describe("useDataTable", () => {
  it("fetches page 1 on mount and exposes the result", async () => {
    const fetcher = vi.fn().mockResolvedValue(page([{ id: 1, name: "Acme", status: "active" }], { total: 1 }));
    const { result } = renderHook(() => useDataTable({ endpoint: "/api/v1/orgs", columns: COLUMNS, rowKey: (r) => r.id, fetcher }));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetcher).toHaveBeenCalledWith("/api/v1/orgs?page=1&page_size=25");
    expect(result.current.items).toEqual([{ id: 1, name: "Acme", status: "active" }]);
    expect(result.current.total).toBe(1);
  });

  it("hides columns marked hidden by default", async () => {
    const fetcher = vi.fn().mockResolvedValue(page([]));
    const { result } = renderHook(() => useDataTable({ endpoint: "/api/v1/orgs", columns: COLUMNS, rowKey: (r) => r.id, fetcher }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.visibleColumns.map((c) => c.key)).toEqual(["name", "status"]);
    expect(result.current.orderedColumns.map((c) => c.key)).toEqual(["name", "status", "id"]);
  });

  it("refetches with the new page when setPage is called", async () => {
    const fetcher = vi.fn().mockResolvedValue(page([]));
    const { result } = renderHook(() => useDataTable({ endpoint: "/api/v1/orgs", columns: COLUMNS, rowKey: (r) => r.id, fetcher }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith("/api/v1/orgs?page=2&page_size=25"));
  });

  it("resets to page 1 when the page size changes", async () => {
    const fetcher = vi.fn().mockResolvedValue(page([]));
    const { result } = renderHook(() => useDataTable({ endpoint: "/api/v1/orgs", columns: COLUMNS, rowKey: (r) => r.id, fetcher }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(3));
    await waitFor(() => expect(result.current.page).toBe(3));
    act(() => result.current.setPageSize(50));
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith("/api/v1/orgs?page=1&page_size=50"));
  });

  it("cycles a sortable column's sort and resets to page 1", async () => {
    const fetcher = vi.fn().mockResolvedValue(page([]));
    const { result } = renderHook(() => useDataTable({ endpoint: "/api/v1/orgs", columns: COLUMNS, rowKey: (r) => r.id, fetcher }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));
    await waitFor(() => expect(result.current.page).toBe(2));

    act(() => result.current.toggleSort(COLUMNS[0]));
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith("/api/v1/orgs?page=1&page_size=25&sort=name"));

    act(() => result.current.toggleSort(COLUMNS[0]));
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith("/api/v1/orgs?page=1&page_size=25&sort=-name"));
  });

  it("sends search as ?q= and resets to page 1", async () => {
    const fetcher = vi.fn().mockResolvedValue(page([]));
    const { result } = renderHook(() => useDataTable({ endpoint: "/api/v1/orgs", columns: COLUMNS, rowKey: (r) => r.id, fetcher }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setSearch("acme"));
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith("/api/v1/orgs?page=1&page_size=25&q=acme"));
  });

  it("moves a column's order with moveColumn", async () => {
    const fetcher = vi.fn().mockResolvedValue(page([]));
    const { result } = renderHook(() => useDataTable({ endpoint: "/api/v1/orgs", columns: COLUMNS, rowKey: (r) => r.id, fetcher }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.moveColumn("status", -1));
    expect(result.current.orderedColumns.map((c) => c.key)).toEqual(["status", "name", "id"]);
  });

  it("surfaces a rejected fetch as an error", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useDataTable({ endpoint: "/api/v1/orgs", columns: COLUMNS, rowKey: (r) => r.id, fetcher }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.message).toBe("boom");
  });
});
