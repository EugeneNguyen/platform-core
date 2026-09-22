import type { ReactNode } from "react";

export interface FieldsetProps {
  /** The group's name - the ONLY thing connecting it to assistive tech (docs.tabler.io/ui/forms/fieldset). Always required, always the first thing rendered. */
  legend: ReactNode;
  children: ReactNode;
  /** Disables every control inside at once - also removes them from the tab order and the submitted data. Use `readonly` on an individual `FormControl` instead when a value should still be sent. */
  disabled?: boolean;
  className?: string;
}

/**
 * Groups related fields under a `legend` - not just a visual box: a
 * `legend`-less `fieldset` (or a heading placed above a plain `div`)
 * looks the same but isn't connected to its fields for a screen reader.
 * The only correct way to group a set of radios/checkboxes
 * (`FormCheck`s sharing a `name`) that all answer one question; a set of
 * text fields only needs one when they really form a set (e.g. an
 * address), not for every `mb-3` block on the page.
 */
function Fieldset({ legend, children, disabled, className }: FieldsetProps) {
  const classes = ["form-fieldset", className].filter(Boolean).join(" ");
  return (
    <fieldset className={classes} disabled={disabled}>
      <legend className="form-label">{legend}</legend>
      {children}
    </fieldset>
  );
}

export default Fieldset;
