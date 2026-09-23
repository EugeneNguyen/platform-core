import { describe, expect, it } from "vitest";
import { isoToLocalInput, localInputToIso } from "./dateInput";

describe("dateInput", () => {
  it("round-trips local wall time through an absolute ISO timestamp", () => {
    const iso = localInputToIso("2026-09-23T09:30");
    expect(new Date(iso).getHours()).toBe(9);
    expect(isoToLocalInput(iso)).toBe("2026-09-23T09:30");
  });

  it("renders empty/invalid values as an empty input", () => {
    expect(isoToLocalInput(undefined)).toBe("");
    expect(isoToLocalInput(null)).toBe("");
    expect(isoToLocalInput("not a date")).toBe("");
  });
});
