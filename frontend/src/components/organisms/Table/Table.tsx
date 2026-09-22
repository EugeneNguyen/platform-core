import type { ReactNode } from "react";

/**
 * Tabler's `.table` family (docs.tabler.io/ui/components/table), as
 * composable pieces instead of one do-everything component - a caller
 * builds `<Table><TableHead>...</TableHead><TableBody>...</TableBody>
 * </Table>` the same shape as a plain HTML table, with props adding the
 * documented modifier classes. Sorting/selection STATE stays with the
 * caller (same "props in, no owned state" convention as `AppShell` -
 * see types.tsx's `LinkComponent` docstring): these components only ever
 * render the class names/attributes Tabler's CSS keys off, never decide
 * what "sorted"/"selected" means.
 */

export type TableVariant = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
export type TableBreakpoint = "sm" | "md" | "lg" | "xl";
export type SortDirection = "asc" | "desc" | null;

function classNames(...parts: Array<string | false | undefined>): string | undefined {
  const joined = parts.filter(Boolean).join(" ");
  return joined || undefined;
}

export interface TableProps {
  children: ReactNode;
  className?: string;
  caption?: ReactNode;
  /** `.table-responsive`, or `.table-responsive-{bp}` from that breakpoint up. */
  responsive?: boolean | TableBreakpoint;
  /** `.table-vcenter` - vertically centers cell content. */
  vcenter?: boolean;
  /** `.table-nowrap` - keeps cell content on one line. */
  nowrap?: boolean;
  /** `.table-borderless` */
  borderless?: boolean;
  /** `.table-center` - centers every cell's content. */
  center?: boolean;
  /** `.table-transparent` - clears header/body backgrounds. */
  transparent?: boolean;
  /** `.table-selectable` - pair with a `tableSelect` `Checkbox` in each row for CSS-only selected-row highlighting. */
  selectable?: boolean;
  /** `.table-mobile-{bp}` - stacks rows into a list below this breakpoint. Give every `TableCell` a `label` when set. */
  mobileBreakpoint?: TableBreakpoint;
}

export function Table({
  children,
  className,
  caption,
  responsive,
  vcenter,
  nowrap,
  borderless,
  center,
  transparent,
  selectable,
  mobileBreakpoint,
}: TableProps) {
  const table = (
    <table
      className={classNames(
        "table",
        vcenter && "table-vcenter",
        nowrap && "table-nowrap",
        borderless && "table-borderless",
        center && "table-center",
        transparent && "table-transparent",
        selectable && "table-selectable",
        mobileBreakpoint && `table-mobile-${mobileBreakpoint}`,
        className,
      )}
    >
      {caption && <caption>{caption}</caption>}
      {children}
    </table>
  );

  if (!responsive) return table;
  const responsiveClass = responsive === true ? "table-responsive" : `table-responsive-${responsive}`;
  return <div className={responsiveClass}>{table}</div>;
}

export interface TableHeadProps {
  children: ReactNode;
  className?: string;
  /** `.sticky-top` - keeps the header row visible while the body scrolls. */
  sticky?: boolean;
}

export function TableHead({ children, className, sticky }: TableHeadProps) {
  return <thead className={classNames(sticky && "sticky-top", className)}>{children}</thead>;
}

export interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

export interface TableRowProps {
  children: ReactNode;
  className?: string;
  /** `.table-{variant}` - colors the row to highlight its meaning. */
  variant?: TableVariant;
}

export function TableRow({ children, className, variant }: TableRowProps) {
  return <tr className={classNames(variant && `table-${variant}`, className)}>{children}</tr>;
}

export interface TableHeaderCellProps {
  children: ReactNode;
  className?: string;
  scope?: "col" | "row";
  /**
   * Renders `children` inside a `.table-sort` button instead of as plain
   * text, wiring `aria-sort` off the same value - pass this (and `onSort`)
   * to make the column sortable; omit both for a plain header cell.
   * `null` means "sortable, not currently sorted" (renders the neutral
   * arrow, `aria-sort="none"`).
   */
  sort?: SortDirection;
  onSort?: () => void;
  /** `data-sort` on the button - Tabler's own List.js demo reads this to know which field to sort by. */
  sortKey?: string;
}

export function TableHeaderCell({ children, className, scope = "col", sort, onSort, sortKey }: TableHeaderCellProps) {
  if (!onSort) {
    return (
      <th scope={scope} className={className}>
        {children}
      </th>
    );
  }

  const ariaSort = sort === "asc" ? "ascending" : sort === "desc" ? "descending" : "none";
  return (
    <th scope={scope} className={className} aria-sort={ariaSort}>
      <button
        type="button"
        className={classNames("table-sort", sort === "asc" && "asc", sort === "desc" && "desc")}
        data-sort={sortKey}
        onClick={onSort}
      >
        {children}
      </button>
    </th>
  );
}

export interface TableCellProps {
  children: ReactNode;
  className?: string;
  /** The label shown above this cell's value once `Table`'s `mobileBreakpoint` stacks the table. */
  label?: string;
  /** `td-truncate` + an inner `.text-truncate` wrapper - stops one long value from stretching every column. */
  truncate?: boolean;
}

export function TableCell({ children, className, label, truncate }: TableCellProps) {
  return (
    <td className={classNames(truncate && "td-truncate", className)} data-label={label}>
      {truncate ? <div className="text-truncate">{children}</div> : children}
    </td>
  );
}
