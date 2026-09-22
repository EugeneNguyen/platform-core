import { afterEach, describe, expect, it, vi } from "vitest";
import { createDefaultCrudApi } from "./api";

interface Org {
  id: number;
  name: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("createDefaultCrudApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates via POST to the bare endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 1, name: "Acme" }));
    vi.stubGlobal("fetch", fetchMock);

    const api = createDefaultCrudApi<Org>("/api/v1/orgs");
    const row = await api.create({ name: "Acme" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/orgs",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ name: "Acme" }) }),
    );
    expect(row).toEqual({ id: 1, name: "Acme" });
  });

  it("reads/updates/removes against endpoint/:id", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 1, name: "Acme" }))
      .mockResolvedValueOnce(jsonResponse({ id: 1, name: "Acme Inc" }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const api = createDefaultCrudApi<Org>("/api/v1/orgs");

    await api.read(1);
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/v1/orgs/1");

    await api.update(1, { name: "Acme Inc" });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/v1/orgs/1",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ name: "Acme Inc" }) }),
    );

    await api.remove(1);
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/v1/orgs/1", expect.objectContaining({ method: "DELETE" }));
  });

  it("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    const api = createDefaultCrudApi<Org>("/api/v1/orgs");
    await expect(api.read(1)).rejects.toThrow(/500/);
  });
});
