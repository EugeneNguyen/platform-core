import { describe, expect, it } from "vitest";
import type { CrudConfig } from "./lib/types";
import CrudCreateScreen from "./screens/CrudCreateScreen";
import CrudEditScreen from "./screens/CrudEditScreen";
import CrudListScreen from "./screens/CrudListScreen";
import { createCrudRouter } from "./CrudRouter";

interface Org {
  id: number;
  name: string;
}

const CONFIG: CrudConfig<Org> = {
  resource: "orgs",
  endpoint: "/api/v1/orgs",
  columns: [{ key: "name", header: "Name" }],
  fields: [{ key: "name", label: "Name", required: true }],
  rowKey: (row) => row.id,
};

describe("createCrudRouter", () => {
  it("builds paths from the config's resource", () => {
    const router = createCrudRouter(CONFIG);
    expect(router.paths).toEqual({
      basePath: "orgs",
      listPath: "orgs",
      createPath: "orgs/new",
      editPath: expect.any(Function),
    });
    expect(router.paths.editPath(1)).toBe("orgs/1/edit");
  });

  it("bundles the three CRUD screen components", () => {
    const router = createCrudRouter(CONFIG);
    expect(router.screens.List).toBe(CrudListScreen);
    expect(router.screens.Create).toBe(CrudCreateScreen);
    expect(router.screens.Edit).toBe(CrudEditScreen);
  });
});
