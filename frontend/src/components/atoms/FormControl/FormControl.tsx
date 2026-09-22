import type { InputHTMLAttributes } from "react";

export type FormControlSize = "sm" | "md" | "lg";

export interface FormControlProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** @default "sm" - this design system stays compact throughout (`Button` does the same); pass `"md"` for Tabler's plain, unmodified `.form-control` sizing. Named `size` like `Button`'s, not the native HTML `size` attribute (visible character width) - that one's omitted here since the two would otherwise collide on the same prop name. */
  size?: FormControlSize;
}

function FormControl({ className, size = "sm", ...rest }: FormControlProps) {
  const classes = ["form-control", size === "sm" && "form-control-sm", size === "lg" && "form-control-lg", className]
    .filter(Boolean)
    .join(" ");
  return <input className={classes} {...rest} />;
}

export default FormControl;
