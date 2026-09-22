import type { ReactNode } from "react";

export interface FormLabelProps {
  children: ReactNode;
  htmlFor?: string;
  /** `.required` - Tabler's CSS appends the asterisk, no `*` in `children` needed. */
  required?: boolean;
  className?: string;
}

function FormLabel({ children, htmlFor, required, className }: FormLabelProps) {
  const classes = ["form-label", required && "required", className].filter(Boolean).join(" ");
  return (
    <label htmlFor={htmlFor} className={classes}>
      {children}
    </label>
  );
}

export default FormLabel;
