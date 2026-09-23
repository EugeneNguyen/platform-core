import { describe, expect, it } from "vitest";
import { createCrudPaths } from "./paths";

describe("createCrudPaths", () => {
  it("builds every path off the resource name", () => {
    const paths = createCrudPaths("orgs");
    expect(paths.basePath).toBe("orgs");
    expect(paths.listPath).toBe("orgs");
    expect(paths.createPath).toBe("orgs/new");
    expect(paths.detailPath(42)).toBe("orgs/42");
    expect(paths.editPath(42)).toBe("orgs/42/edit");
    expect(paths.editPath("abc")).toBe("orgs/abc/edit");
  });
});
