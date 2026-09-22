import FormControl from "../../../../components/atoms/FormControl";
import FormLabel from "../../../../components/atoms/FormLabel";
import FormCheck from "../../../../components/molecules/FormCheck";
import type { CrudField } from "../../lib/types";

export interface CrudFormFieldsProps<T> {
  fields: CrudField<T>[];
  values: Partial<T>;
  onChange: <K extends keyof T>(key: K, value: T[K]) => void;
}

/**
 * Shared by `CrudCreateScreen`/`CrudEditScreen` - one `FormField` per
 * `CrudField` (auto-built from a `Schema` - see `schemaFields.ts`), not
 * exported (an implementation detail of those two, not a `components/`
 * design-system piece: it has no meaning without a field list). A
 * `checkbox` field renders as `FormCheck`
 * (label INSIDE the clickable control); a `select` field renders a plain
 * native `<select>` (Tabler's `form-select` class, same `sm`-by-default
 * convention as `FormControl`) from `field.options` - no design-system
 * `Select` atom exists yet, and one native element doesn't earn it;
 * everything else is a `FormLabel` + `FormControl` pair, `type` passed
 * straight to the native `input`.
 */
function CrudFormFields<T>({ fields, values, onChange }: CrudFormFieldsProps<T>) {
  return (
    <>
      {fields.map((field) => {
        if (field.type === "checkbox") {
          return (
            <div key={field.key} className="mb-3">
              <FormCheck
                label={field.label}
                required={field.required}
                checked={Boolean(values[field.key])}
                onChange={(event) => onChange(field.key, event.target.checked as T[typeof field.key])}
              />
            </div>
          );
        }

        const fieldId = `crud-field-${field.key}`;

        if (field.type === "select") {
          return (
            <div key={field.key} className="mb-3">
              <FormLabel htmlFor={fieldId} required={field.required}>
                {field.label}
              </FormLabel>
              <select
                id={fieldId}
                className="form-select form-select-sm"
                required={field.required}
                value={(values[field.key] as string | undefined) ?? ""}
                onChange={(event) => onChange(field.key, (event.target.value || null) as T[typeof field.key])}
              >
                {/* Only disabled when required - an optional select (e.g. an optional parent/relation) needs this as a real, re-selectable choice, not just an unpicked placeholder, so a caller can clear a previous selection back to "none". */}
                <option value="" disabled={field.required}>
                  {field.required ? "Select…" : "None"}
                </option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return (
          <div key={field.key} className="mb-3">
            <FormLabel htmlFor={fieldId} required={field.required}>
              {field.label}
            </FormLabel>
            <FormControl
              id={fieldId}
              type={field.type ?? "text"}
              required={field.required}
              autoComplete={field.autoComplete}
              value={(values[field.key] as string | number | undefined) ?? ""}
              onChange={(event) => {
                const raw = field.type === "number" ? event.target.valueAsNumber : event.target.value;
                onChange(field.key, raw as T[typeof field.key]);
              }}
            />
          </div>
        );
      })}
    </>
  );
}

export default CrudFormFields;
