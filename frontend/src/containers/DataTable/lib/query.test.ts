import { describe, expect, it } from "vitest";
import { buildDataTableUrl, nextSort, sortDirectionForColumn } from "./query";
import type { DataTableColumn } from "./types";

interface Row {
  id: number;
  name: string;
  status: string;
}

const NAME_COLUMN: DataTableColumn<Row> = { key: "name", header: "Name", sortable: true };
const STATUS_COLUMN: DataTableColumn<Row> = { key: "status", header: "Status" };
const OWNER_COLUMN: DataTableColumn<Row> = { key: "owner", header: "Owner", sortable: true, sortKey: "owner__name" };

const BASE_STATE = { page: 1, pageSize: 25, sort: null, search: "" };

describe("buildDataTableUrl", () => {
  it("always sends page and page_size", () => {
    const url = buildDataTableUrl("/api/v1/orgs", BASE_STATE);
    expect(url).toBe("/api/v1/orgs?page=1&page_size=25");
  });

  it("omits sort and q when unset", () => {
    const url = buildDataTableUrl("/api/v1/orgs", { ...BASE_STATE, page: 2, pageSize: 10 });
    expect(url).toBe("/api/v1/orgs?page=2&page_size=10");
  });

  it("adds sort and q when set", () => {
    const url = buildDataTableUrl("/api/v1/orgs", { ...BASE_STATE, sort: "-name", search: "acme" });
    const params = new URL(url, "http://example.test").searchParams;
    expect(params.get("sort")).toBe("-name");
    expect(params.get("q")).toBe("acme");
  });

  it("appends to an endpoint that already has a query string", () => {
    const url = buildDataTableUrl("/api/v1/orgs?tenant=1", BASE_STATE);
    expect(url.startsWith("/api/v1/orgs?tenant=1&page=1")).toBe(true);
  });
});

describe("sortDirectionForColumn / nextSort", () => {
  it("reads no direction when sort doesn't match the column", () => {
    expect(sortDirectionForColumn(null, NAME_COLUMN)).toBe(null);
    expect(sortDirectionForColumn("status", NAME_COLUMN)).toBe(null);
  });

  it("reads ascending/descending off the bare/negated field name", () => {
    expect(sortDirectionForColumn("name", NAME_COLUMN)).toBe("asc");
    expect(sortDirectionForColumn("-name", NAME_COLUMN)).toBe("desc");
  });

  it("uses sortKey instead of key when given", () => {
    expect(sortDirectionForColumn("owner__name", OWNER_COLUMN)).toBe("asc");
    expect(sortDirectionForColumn("owner", OWNER_COLUMN)).toBe(null);
  });

  it("cycles none -> asc -> desc -> none", () => {
    const asc = nextSort(null, NAME_COLUMN);
    expect(asc).toBe("name");
    const desc = nextSort(asc, NAME_COLUMN);
    expect(desc).toBe("-name");
    expect(nextSort(desc, NAME_COLUMN)).toBe(null);
  });

  it("switching sort to another column starts that column at ascending", () => {
    expect(nextSort("-name", STATUS_COLUMN)).toBe("status");
  });
});
