import { useEffect, useMemo, useState } from "react";
import type { DataTablePage } from "../../DataTable";
import type { BaseApiRequest } from "./baseApi";
import type { CrudField, CrudFieldOption } from "./types";

const LABEL_FIELD_CANDIDATES = ["title", "name", "label", "email"];

/**
 * Picks a relation row's own display label - tried in order, the first
 * one present and non-empty wins. No schema-driven way to know which
 * field a given resource considers its "name" (that's not something
 * `BaseViewSet.schema()` describes), so this is a plain convention
 * instead: every resource in this platform happens to have one of these.
 * Falls back to the row's own id - still correct, just less readable.
 */
function relationOptionLabel(row: Record<string, unknown>): string {
  for (const key of LABEL_FIELD_CANDIDATES) {
    const value = row[key];
    if (typeof value === "string" && value) return value;
  }
  return String(row.id);
}

/**
 * `CrudCreateForm`/`CrudEditForm`'s own relation-picker fetch - a plain
 * `GET <relatedEndpoint>?page_size=<max>` (the same `request` they
 * already build `baseApi` from, so it carries the same auth) turned into
 * a `CrudField.options` list. Capped at `EnvelopePageNumberPagination`'s
 * own `max_page_size` (100, see core_api/pagination.py) - a relation
 * with more rows than that has no picker UI yet beyond "the first 100",
 * a known gap, not solved here.
 */
export async function fetchRelationOptions(endpoint: string, request: BaseApiRequest): Promise<CrudFieldOption[]> {
  const page = await request<DataTablePage<Record<string, unknown>>>(`${endpoint}?page_size=100`);
  return page.items.map((row) => ({ value: String(row.id), label: relationOptionLabel(row) }));
}

/**
 * `CrudCreateForm`/`CrudEditForm`'s shared hook: takes the STATIC fields
 * `createSchemaFields` already built (structure/type/required never
 * change once `schema` is loaded) and layers in each relation field's
 * `options`, fetched once per distinct `relatedEndpoint` as they resolve
 * - each one independently, not blocking the others (a slow `?include[]=`-
 * heavy related resource shouldn't hold up a fast one). A field with no
 * `relatedEndpoint` (everything non-relation, plus a relation with no
 * registered endpoint - see `schemaFields.ts`) passes through untouched.
 */
export function useRelationFields<T>(baseFields: CrudField<T>[], request: BaseApiRequest): CrudField<T>[] {
  const [optionsByEndpoint, setOptionsByEndpoint] = useState<Record<string, CrudFieldOption[]>>({});
  const endpoints = useMemo(
    () => Array.from(new Set(baseFields.map((field) => field.relatedEndpoint).filter((value): value is string => Boolean(value)))),
    [baseFields],
  );

  useEffect(() => {
    let cancelled = false;
    for (const endpoint of endpoints) {
      fetchRelationOptions(endpoint, request)
        .then((options) => {
          if (!cancelled) setOptionsByEndpoint((prev) => ({ ...prev, [endpoint]: options }));
        })
        // A relation picker that fails to load just stays an empty
        // select (still submittable for an optional relation) rather
        // than breaking the whole form - not caught-and-surfaced like
        // the schema/record fetch errors above it.
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [endpoints, request]);

  return useMemo(
    () => baseFields.map((field) => (field.relatedEndpoint ? { ...field, options: optionsByEndpoint[field.relatedEndpoint] ?? field.options } : field)),
    [baseFields, optionsByEndpoint],
  );
}
