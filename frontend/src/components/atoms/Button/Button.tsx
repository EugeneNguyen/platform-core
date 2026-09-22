import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** No default - an unset variant renders Tabler's own plain, colorless `.btn` (its actual base class, not a missing choice). Every colored use (primary submit, danger delete, ...) states its color explicitly. */
  variant?: ButtonVariant;
  /** `.btn-outline-{variant}` instead of the solid `.btn-{variant}` fill. No effect on the `"link"` variant, which has no outline form. */
  outline?: boolean;
  /** @default "sm" - this design system stays compact throughout (`Table`/`Pagination`/`ColumnPicker` are all `.btn-sm`); pass `"md"` for Tabler's plain, unmodified `.btn` sizing. */
  size?: ButtonSize;
  /** `.btn-icon` - square, for an icon-only button. Give it an `aria-label` too, same as `ColumnPicker`'s trigger. */
  icon?: boolean;
  /** @default "button" - the native default is `"submit"`, which silently submits the nearest form; explicit here so a `Button` used for a plain action inside a `<form>` (e.g. a row's own Delete) never does that by accident. A real submit button still states `type="submit"` itself. */
  type?: "button" | "submit" | "reset";
}

function Button({ variant, outline, size = "sm", icon, type = "button", className, ...rest }: ButtonProps) {
  const variantClass = !variant ? undefined : variant === "link" ? "btn-link" : `btn-${outline ? "outline-" : ""}${variant}`;
  const classes = ["btn", variantClass, size === "sm" && "btn-sm", size === "lg" && "btn-lg", icon && "btn-icon", className]
    .filter(Boolean)
    .join(" ");

  return <button type={type} className={classes} {...rest} />;
}

export default Button;
