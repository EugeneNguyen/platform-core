import type { DataTableColumn } from "../../DataTable";
import { formatFieldValue } from "./format";
import type { Schema, SchemaField } from "./schema";

function isDisplayable(field: SchemaField): boolean {
  if (field.name === "id") return false;
  // A to-many relation can't render sensibly in one flat cell (and is
  // deferred by default anyway - see Schema's own docstring), unlike a
  // to-one relation, which is just a bare id/pk already sitting on the
  // row.
  if (field.type === "relation" && field.many) return false;
  return true;
}

/**
 * Builds `DataTable`'s columns straight from a `BaseViewSet.schema()`
 * response, one column per displayable field (see `isDisplayable`) -
 * `CrudListScreen`'s whole reason for loading the schema first. A
 * relation column still renders its bare id, not a looked-up label
 * (e.g. a goal's title instead of its uuid) - that needs either a
 * second fetch (the relevant `?include[]=`'d rows) or a resource-
 * specific lookup this generic function has no way to know about; left
 * as a known gap for a later step, not solved here.
 */
export function createSchemaColumns<T>(schema: Schema): DataTableColumn<T>[] {
  return schema.fields.filter(isDisplayable).map(
    (field): DataTableColumn<T> => ({
      key: field.name,
      header: field.label,
      sortable: field.type !== "relation",
      // An opaque read-only id (e.g. `owner_id`) or long text is noise in
      // a row - still available through the column picker.
      hidden: (field.format === "uuid" && field.read_only && field.type !== "relation") || Boolean(field.multiline),
      truncate: field.multiline,
      render: (row) => formatFieldValue(field, (row as Record<string, unknown>)[field.name]),
    }),
  );
}
