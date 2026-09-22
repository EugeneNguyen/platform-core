import axios from "axios";
import type { BaseApiRequest } from "./baseApi";

/**
 * A `BaseApiRequest` (see `baseApi.ts`) - currently backed by axios
 * under the hood, but the name stays transport-neutral on purpose
 * (`BaseApiRequest` itself is; a caller shouldn't have to know or care
 * which HTTP client built the one it got, and this could switch
 * transports later without every `createXBaseApi` call site changing).
 * Same calling convention every `createXBaseApi` factory already uses
 * (`init.body` as an already-`JSON.stringify`'d string, `init.method`,
 * matching this platform's `apiFetch` convention).
 *
 * Scoped to `createBaseApi` callers only (`CrudListScreen`'s
 * `schema`/`list`/`remove`) for now - `apiFetch` (Create/Edit screens,
 * `DataTable`'s own default fetcher, the nested `GoalMetricsSection`/
 * `MetricCheckInsSection` sections) is untouched, same "refactor part by
 * part" scope this whole schema-driven `CrudListScreen` change is under.
 */
export function createRequest(accessToken: string, baseURL = ""): BaseApiRequest {
  const client = axios.create({
    baseURL,
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
  });

  return async function request<R>(path: string, init?: RequestInit): Promise<R> {
    try {
      const response = await client.request<R>({
        url: path,
        method: init?.method ?? "GET",
        data: init?.body,
        headers: init?.headers as Record<string, string> | undefined,
      });
      return response.data;
    } catch (thrown) {
      if (axios.isAxiosError(thrown)) {
        const body = thrown.response?.data as { message?: string } | undefined;
        throw new Error(body?.message ?? thrown.message);
      }
      throw thrown;
    }
  };
}
