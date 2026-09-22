import type { CrudApi } from "./types";

async function parseResponse<R>(response: Response): Promise<R> {
  if (!response.ok) throw new Error(`Request to ${response.url} failed with ${response.status}`);
  if (response.status === 204) return undefined as R;
  return response.json() as Promise<R>;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

/**
 * Plain `fetch` calls against the exact routes any `BaseViewSet`'s
 * `router.register` gives you: `POST endpoint` (create), `GET
 * endpoint/:id` (read), `PATCH endpoint/:id` (update), `DELETE
 * endpoint/:id` (remove) - zero server-side glue needed for a resource
 * that's already wired the standard way. `CrudConfig.api` overrides
 * individual calls (auth headers, a non-`fetch` client, a different verb)
 * without having to reimplement the rest.
 */
export function createDefaultCrudApi<T>(endpoint: string): CrudApi<T> {
  return {
    create: (values) =>
      fetch(endpoint, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(values) }).then((r) =>
        parseResponse<T>(r),
      ),
    read: (id) => fetch(`${endpoint}/${id}`).then((r) => parseResponse<T>(r)),
    update: (id, values) =>
      fetch(`${endpoint}/${id}`, { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify(values) }).then((r) =>
        parseResponse<T>(r),
      ),
    remove: (id) => fetch(`${endpoint}/${id}`, { method: "DELETE" }).then((r) => parseResponse<void>(r)),
  };
}
