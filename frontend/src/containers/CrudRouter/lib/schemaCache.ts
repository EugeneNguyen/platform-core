import type { BaseApiRequest } from "./baseApi";
import type { Schema } from "./schema";

const cache = new WeakMap<BaseApiRequest, Map<string, Promise<Schema>>>();

/**
 * `GET <endpoint>/schema`, once per `request` (i.e. per access token) and
 * endpoint - for a RELATED resource's schema, which several pieces of one
 * screen need at once (its `display_field` for labels and picker options,
 * its names, whether it's searchable). A failed fetch is dropped from the
 * cache so the next caller retries.
 */
export function loadSchema(endpoint: string, request: BaseApiRequest): Promise<Schema> {
  let byEndpoint = cache.get(request);
  if (!byEndpoint) {
    byEndpoint = new Map();
    cache.set(request, byEndpoint);
  }
  let pending = byEndpoint.get(endpoint);
  if (!pending) {
    pending = request<Schema>(`${endpoint}/schema`);
    byEndpoint.set(endpoint, pending);
    pending.catch(() => byEndpoint.delete(endpoint));
  }
  return pending;
}
