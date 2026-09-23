import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { UNSAFE_FrameworkContext } from "react-router";
import { describe, expect, it } from "vitest";
import { useResourcePath } from "./useResourcePath";

const ROUTES = {
  root: { id: "root", path: "" },
  shell: { id: "shell", parentId: "root" },
  "crud-detail-goals": { id: "crud-detail-goals", parentId: "shell", path: "goals/:id" },
  "crud-detail-orgs": { id: "crud-detail-orgs", parentId: "shell", path: "platform-org/orgs/:id" },
};

function wrapper({ children }: { children: ReactNode }) {
  const value = { manifest: { routes: ROUTES } } as never;
  return <UNSAFE_FrameworkContext.Provider value={value}>{children}</UNSAFE_FrameworkContext.Provider>;
}

describe("useResourcePath", () => {
  it("resolves a resource's real mount from the route manifest", () => {
    const { result } = renderHook(() => useResourcePath(), { wrapper });
    expect(result.current("/api/v1/goals")).toBe("goals");
    expect(result.current("/api/v1/orgs")).toBe("platform-org/orgs");
    expect(result.current("/api/v1/widgets")).toBeNull();
  });

  it("falls back to the bare resource name outside framework mode", () => {
    const { result } = renderHook(() => useResourcePath());
    expect(result.current("/api/v1/goals")).toBe("goals");
  });
});
