import { describe, expect, it } from "vitest";
import { createCrudRoutes, prefixRoutes, routeFilePath } from "./routes";

describe("routeFilePath", () => {
  it("resolves relative to the calling module's own directory", () => {
    expect(routeFilePath("file:///a/b/c/mod.ts", "../../routes/x.tsx")).toBe("/a/routes/x.tsx");
    expect(routeFilePath("file:///a/b/mod.ts", "./routes/x.tsx")).toBe("/a/b/routes/x.tsx");
    expect(routeFilePath("file:///a%20b/mod.ts", "x.tsx")).toBe("/a b/x.tsx");
  });
});

describe("createCrudRoutes", () => {
  it("nests list/new/detail/edit under the resource name, with unique ids", () => {
    const routes = createCrudRoutes("/api/v1/goals", { editFile: "/abs/goals-edit.tsx" });
    expect(routes.map(({ path, index, id }) => ({ path, index, id }))).toEqual([
      { path: "goals", index: true, id: "crud-list-goals" },
      { path: "goals/new", index: undefined, id: "crud-new-goals" },
      { path: "goals/:id", index: undefined, id: "crud-detail-goals" },
      { path: "goals/:id/edit", index: undefined, id: "crud-edit-goals" },
    ]);
    expect(routes[0].file).toMatch(/\/src\/routes\/crud-list\.tsx$/);
    expect(routes[2].file).toMatch(/\/src\/routes\/crud-detail\.tsx$/);
    expect(routes[3].file).toBe("/abs/goals-edit.tsx");
  });

  it("composes with prefixRoutes", () => {
    expect(prefixRoutes("platform-org/", createCrudRoutes("/api/v1/orgs")).map((r) => r.path)).toEqual([
      "platform-org/orgs",
      "platform-org/orgs/new",
      "platform-org/orgs/:id",
      "platform-org/orgs/:id/edit",
    ]);
  });
});
