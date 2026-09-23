import { describe, expect, it, vi } from "vitest";
import { fetchRelationOptions, rowLabel } from "./relationOptions";

describe("rowLabel", () => {
  it("uses the schema's display field, else the id", () => {
    expect(rowLabel({ id: 1, name: "Acme" }, "name")).toBe("Acme");
    expect(rowLabel({ id: 1, value: 42 }, "value")).toBe("42");
    expect(rowLabel({ id: 1, name: "" }, "name")).toBe("1");
    expect(rowLabel({ id: 1, name: "Acme" })).toBe("1");
  });
});

describe("fetchRelationOptions", () => {
  it("labels options by the related schema's display field, fetching that schema once", async () => {
    const request = vi.fn().mockImplementation(async (path: string) =>
      path.endsWith("/schema") ? { display_field: "title", fields: [] } : { items: [{ id: "g1", title: "Ship v1" }] },
    );
    expect(await fetchRelationOptions("/api/v1/goals", request)).toEqual([{ value: "g1", label: "Ship v1" }]);
    await fetchRelationOptions("/api/v1/goals", request);
    expect(request.mock.calls.filter(([path]) => path === "/api/v1/goals/schema")).toHaveLength(1);
  });
});
