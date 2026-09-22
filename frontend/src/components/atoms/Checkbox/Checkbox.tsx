import type { InputHTMLAttributes } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  onChange?: (checked: boolean) => void;
  /**
   * Adds `.table-selectable-check` - the exact hook `Table`'s `selectable`
   * prop's CSS keys off to highlight a checked row's background with no
   * JavaScript involved. Only meaningful inside a `selectable` `Table`.
   */
  tableSelect?: boolean;
}

function Checkbox({ className, tableSelect, onChange, ...rest }: CheckboxProps) {
  const classes = ["form-check-input", tableSelect && "table-selectable-check", className].filter(Boolean).join(" ");
  return <input type="checkbox" className={classes} onChange={(event) => onChange?.(event.target.checked)} {...rest} />;
}

export default Checkbox;
