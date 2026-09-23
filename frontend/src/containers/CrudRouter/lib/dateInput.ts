/**
 * `<input type="datetime-local">` speaks local wall time with no zone
 * ("2026-09-23T09:30"); the API speaks absolute ISO timestamps. These
 * convert at the input's edge so form state stays in the API's format.
 */
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** API ISO timestamp -> `datetime-local` input value, in the browser's own timezone. */
export function isoToLocalInput(iso: unknown): string {
  if (typeof iso !== "string" || iso === "") return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** `datetime-local` input value (local wall time, no zone) -> absolute ISO timestamp for the API. */
export function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}
