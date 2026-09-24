import { useEffect, useMemo, useState } from "react";
import type { DataTablePage } from "../../DataTable";
import type { BaseApiRequest } from "./baseApi";
import type { SchemaField } from "./schema";
import { loadSchema } from "./schemaCache";
import type { CrudField, CrudFieldOption } from "./types";

/**
 * A row's display label: its schema's `display_field` value (see
 * `core_api.viewsets._display_field` - chosen server-side, per resource),
 * or the row's id if that's empty or unknown.
 */
export function rowLabel(row: Record<string, unknown>, displayField?: string): string {
  const value = displayField ? row[displayField] : undefined;
  if (value != null && value !== "") return String(value);
  return String(row.id);
}

/**
 * `CrudCreateForm`/`CrudEditForm`'s own relation-picker fetch - the related
 * resource's schema (for its `display_field`, cached) plus a plain
 * `GET <relatedEndpoint>?page_size=<max>` (the same `request` they
 * already build `baseApi` from, so it carries the same auth) turned into
 * a `CrudField.options` list. Capped at `EnvelopePageNumberPagination`'s
 * own `max_page_size` (100, see core_api/pagination.py) - a relation
 * with more rows than that has no picker UI yet beyond "the first 100",
 * a known gap, not solved here.
 */
export async function fetchRelationOptions(endpoint: string, request: BaseApiRequest): Promise<CrudFieldOption[]> {
  const [schema, page] = await Promise.all([
    loadSchema(endpoint, request),
    request<DataTablePage<Record<string, unknown>>>(`${endpoint}?page_size=100`),
  ]);
  return page.items.map((row) => ({ value: String(row.id), label: rowLabel(row, schema.display_field) }));
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

/**
 * Each related endpoint's `display_field`, from its (cached) schema -
 * what a list needs to label sideloaded to-one relation cells (see
 * `createSchemaColumns`). Fills in as each schema resolves; a failed one
 * stays missing, so its cells fall back to the id.
 */
export function useRelatedDisplayFields(fields: SchemaField[], request: BaseApiRequest): Record<string, string | undefined> {
  const [displayFields, setDisplayFields] = useState<Record<string, string | undefined>>({});
  const endpoints = useMemo(
    () => Array.from(new Set(fields.map((field) => field.related_endpoint).filter((value): value is string => Boolean(value)))),
    [fields],
  );

  useEffect(() => {
    let cancelled = false;
    for (const endpoint of endpoints) {
      loadSchema(endpoint, request)
        .then((schema) => {
          if (!cancelled) setDisplayFields((prev) => ({ ...prev, [endpoint]: schema.display_field }));
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [endpoints, request]);

  return displayFields;
}
