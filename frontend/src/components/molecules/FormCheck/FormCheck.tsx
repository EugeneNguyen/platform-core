import type { InputHTMLAttributes, ReactNode } from "react";

export interface FormCheckProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  /** @default "checkbox" */
  type?: "checkbox" | "radio";
  label: ReactNode;
  /** `.required` on the label text - Tabler's CSS appends the asterisk. */
  required?: boolean;
  /** Class on the wrapping `<label class="form-check">`. */
  className?: string;
  /** Class on the `<input>` itself - e.g. `Table`'s `selectable` pairs with `.table-selectable-check` here. */
  inputClassName?: string;
}

/**
 * Tabler's `.form-check` - a checkbox/radio and its label as one clickable
 * unit (docs.tabler.io/ui/forms/fieldset, "Grouping choices"). Radios that
 * belong to one question share `name` (a plain prop passed through, same
 * as any other native `<input>` attribute) and only make sense grouped
 * under a `Fieldset`'s `legend` - see that component's own docstring.
 */
function FormCheck({ type = "checkbox", label, required, className, inputClassName, ...rest }: FormCheckProps) {
  const wrapperClasses = ["form-check", className].filter(Boolean).join(" ");
  const inputClasses = ["form-check-input", inputClassName].filter(Boolean).join(" ");
  const labelClasses = ["form-check-label", required && "required"].filter(Boolean).join(" ");

  return (
    <label className={wrapperClasses}>
      <input type={type} className={inputClasses} {...rest} />
      <span className={labelClasses}>{label}</span>
    </label>
  );
}

export default FormCheck;
