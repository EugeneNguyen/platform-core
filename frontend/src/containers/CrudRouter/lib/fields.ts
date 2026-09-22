import type { CrudField } from "./types";

/**
 * Keeps a submit payload to exactly the declared `fields` - without this,
 * `CrudEditScreen`'s form state (prefilled wholesale from `api.read`,
 * which returns the FULL record) would submit every extra property the
 * API happened to return (`id`, timestamps, computed fields, ...) right
 * back to `api.update`, not just the ones this form actually lets the
 * user edit.
 */
export function pickFieldValues<T>(values: Partial<T>, fields: CrudField<T>[]): Partial<T> {
  const picked = {} as Partial<T>;
  for (const field of fields) {
    if (field.key in values) picked[field.key] = values[field.key];
  }
  return picked;
}
