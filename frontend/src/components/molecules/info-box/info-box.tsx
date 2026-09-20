/**
 * `InfoBox` shared presentational primitive — a Tabler-native stat tile.
 *
 * Replaces AdminLTE's Info Box widget (`.info-box`/`.info-box-icon`/
 * `.info-box-content`/`.info-box-text`/`.info-box-number`) now that AdminLTE
 * is removed from this project entirely. The AdminLTE version had no direct
 * Tabler equivalent by that name — Tabler's own documented pattern for this
 * exact use case (a small labeled metric with an optional colored icon) is a
 * `.card` containing a `.row.align-items-center` with the icon in an
 * `.avatar` inside a `.col-auto`, and the label/value in a sibling `.col`.
 *
 * Markup provenance: `.avatar` and every `bg-{color}-lt` utility class below
 * are confirmed against `@tabler/core`'s own built CSS (`dist/css/
 * tabler.css`) — `.avatar` is a real documented Tabler UI component
 * (`scss/ui/_avatars.scss`), and all eight `bg-{color}-lt` variants
 * (`scss/utils/_colors.scss`) are present in the compiled stylesheet. `-lt`
 * ("light") tints the icon's background instead of filling it solid, which
 * is Tabler's own convention for a stat-tile icon badge — a solid
 * `bg-{color}` fill (AdminLTE's own choice) reads as heavier than Tabler's
 * other card-based widgets and would look inconsistent next to them.
 *
 * The props API is unchanged from the AdminLTE version on purpose — `OrgHome`
 * and every other call site need zero changes, only this component's
 * internal markup moved design systems.
 */
import { ReactNode } from "react";
import type { CWidgetStatsColor } from "./types";

/**
 * Icon-badge contextual color, looked up by `color` at render time.
 *
 * Exported so tests assert against the same source of truth the component
 * renders from, rather than re-hardcoding the class strings.
 */
export const infoBoxIconColorClassName: Record<CWidgetStatsColor, string> = {
  primary: "bg-primary-lt",
  secondary: "bg-secondary-lt",
  success: "bg-success-lt",
  danger: "bg-danger-lt",
  warning: "bg-warning-lt",
  info: "bg-info-lt",
  light: "bg-light-lt",
  dark: "bg-dark-lt",
};

export interface InfoBoxProps {
  /** Contextual color for the icon badge. Has no effect when `icon` is omitted. */
  color: CWidgetStatsColor;
  /** Small label, rendered under the number. Plain string — callers own any localization. */
  text: string;
  /**
   * The metric itself, rendered as the tile's headline value. `ReactNode` so
   * callers pass pre-formatted strings, counts, or their own sentinels (e.g.
   * a "Loading…"/"Unable to load" tri-state, or a `null` → "—" fallback) —
   * this component stays agnostic to which convention a caller uses.
   */
  number: ReactNode;
  /**
   * Optional Font Awesome class string, e.g. `"fa-solid fa-folder"`. When
   * supplied, renders the leading colored icon badge; when omitted, the
   * badge column is not rendered at all — not rendered empty.
   */
  icon?: string;
  /** Forwarded to the root `.card` element as `data-testid`. */
  testId?: string;
  /** Forwarded to the number element as `data-testid`, distinct from `testId` on the root. */
  numberTestId?: string;
  /** Appended last to the root's class list, for callers needing layout/spacing tweaks. */
  className?: string;
}

export function InfoBox({
  color,
  text,
  number,
  icon,
  testId,
  numberTestId,
  className,
}: InfoBoxProps) {
  const rootClassName = className ? `card ${className}` : "card";

  return (
    <div className={rootClassName} data-testid={testId}>
      <div className="card-body">
        <div className="row align-items-center">
          {icon !== undefined && (
            <div className="col-auto">
              <span className={`avatar ${infoBoxIconColorClassName[color]}`}>
                <i className={icon} aria-hidden="true" />
              </span>
            </div>
          )}
          <div className="col">
            <div className="font-weight-medium" data-testid={numberTestId}>
              {number}
            </div>
            <div className="text-secondary">{text}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
