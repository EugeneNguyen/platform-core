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
 * `CrudField`, not exported (an implementation detail of those two, not
 * a `components/` design-system piece: it has no meaning without a
 * `CrudConfig`'s field list). A `checkbox` field renders as `FormCheck`
 * (label INSIDE the clickable control); everything else is a
 * `FormLabel` + `FormControl` pair, `type` passed straight to the native
 * `input`.
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
