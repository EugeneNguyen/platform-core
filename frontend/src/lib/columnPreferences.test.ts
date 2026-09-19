/**
 * (COLPREF-1) — the pure preference layer behind `EntityTable`'s
 * "Columns" dialog. No DOM rendering here beyond `localStorage` itself; the
 * component-level behaviour is covered by
 * `components/organisms/column-preferences-modal/column-preferences-modal.test.tsx`
 * and `components/organisms/entity-table.columnPreferences.test.tsx`.
 *
 * Covers (persistence round-trip), (per-entity key
 * isolation), (locked fields survive a stale stored preference),
 * and (graceful degradation on unavailable/corrupt storage).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EntityConfig, FieldConfig } from "../entityConfigs/types";
import {
  applyColumnPreferences,
  clearColumnPreferences,
  columnPreferencesKey,
  COLUMN_PREFERENCES_VERSION,
  defaultTableFields,
  loadColumnPreferences,
  lockedFieldNames,
  moveRow,
  parseColumnPreferences,
  preferencesFromRows,
  saveColumnPreferences,
  toPreferenceRows,
} from "./columnPreferences";

function field(name: string, extra: Partial<FieldConfig> = {}): FieldConfig {
  return { name, label: name.toUpperCase(), type: "string",...extra };
}

const FIELDS: FieldConfig[] = [
  field("name"),
  field("status"),
  field("owner"),
  field("created_at", { readOnly: true }),
  field("notes", { showInTable: false }),
];

function config(overrides: Partial<EntityConfig> = {}): EntityConfig {
  return {
    resource: "spec",
    path: "/specs",
    methods: ["list", "get", "create", "update", "delete"],
    fields: FIELDS,
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("defaultTableFields", () => {
  it("is the config's own `showInTable !== false` set, in config order", () => {
    expect(defaultTableFields(config()).map((f) => f.name)).toEqual(["name", "status", "owner", "created_at"]);
  });
});

describe("lockedFieldNames", () => {
  it("locks the detailLinkField when the config has a detailPath ", () => {
    expect(lockedFieldNames(config({ detailPath: "/projects/:id", detailLinkField: "name" }))).toEqual(["name"]);
  });

  it("locks nothing when the config has no detail navigation", () => {
    expect(lockedFieldNames(config())).toEqual([]);
  });

  it("locks nothing when a detailLinkField is declared without a detailPath", () => {
    expect(lockedFieldNames(config({ detailLinkField: "name" }))).toEqual([]);
  });
});

describe("toPreferenceRows / applyColumnPreferences", () => {
  it("falls back to config order with everything visible when there is no stored preference", () => {
    const rows = toPreferenceRows(defaultTableFields(config()), null, []);
    expect(rows.map((r) => r.field.name)).toEqual(["name", "status", "owner", "created_at"]);
    expect(rows.every((r) => r.visible)).toBe(true);
    expect(rows.every((r) => !r.locked)).toBe(true);
  });

  it("applies a stored order", () => {
    const prefs = { v: COLUMN_PREFERENCES_VERSION, order: ["owner", "name", "status", "created_at"], hidden: [] };
    expect(applyColumnPreferences(defaultTableFields(config()), prefs, []).map((f) => f.name)).toEqual([
      "owner",
      "name",
      "status",
      "created_at",
    ]);
  });

  it("hides stored-hidden fields and leaves the rest untouched ", () => {
    const prefs = { v: COLUMN_PREFERENCES_VERSION, order: [], hidden: ["status"] };
    expect(applyColumnPreferences(defaultTableFields(config()), prefs, []).map((f) => f.name)).toEqual([
      "name",
      "owner",
      "created_at",
    ]);
  });

  it("ignores a stored order naming a field the schema no longer serves", () => {
    const prefs = { v: COLUMN_PREFERENCES_VERSION, order: ["gone_field", "status", "name"], hidden: [] };
    expect(applyColumnPreferences(defaultTableFields(config()), prefs, []).map((f) => f.name)).toEqual([
      "status",
      "name",
      "owner",
      "created_at",
    ]);
  });

  it("appends a schema field the stored order never mentioned, in config order", () => {
    // A stored preference written before the entity gained `owner`/`created_at`.
    const prefs = { v: COLUMN_PREFERENCES_VERSION, order: ["status", "name"], hidden: [] };
    expect(applyColumnPreferences(defaultTableFields(config()), prefs, []).map((f) => f.name)).toEqual([
      "status",
      "name",
      "owner",
      "created_at",
    ]);
  });

  it("never drops a duplicate-named entry into the rendered list twice", () => {
    const prefs = { v: COLUMN_PREFERENCES_VERSION, order: ["name", "name", "status"], hidden: [] };
    expect(applyColumnPreferences(defaultTableFields(config()), prefs, []).map((f) => f.name)).toEqual([
      "name",
      "status",
      "owner",
      "created_at",
    ]);
  });

  it("renders a locked field even when a stale stored preference marks it hidden ", () => {
    const withDetail = config({ detailPath: "/projects/:id", detailLinkField: "name" });
    const prefs = { v: COLUMN_PREFERENCES_VERSION, order: [], hidden: ["name", "status"] };
    const rendered = applyColumnPreferences(defaultTableFields(withDetail), prefs, lockedFieldNames(withDetail));
    expect(rendered.map((f) => f.name)).toEqual(["name", "owner", "created_at"]);

    const rows = toPreferenceRows(defaultTableFields(withDetail), prefs, lockedFieldNames(withDetail));
    expect(rows.find((r) => r.field.name === "name")).toMatchObject({ visible: true, locked: true });
  });

  it("falls back to the full ordered set rather than rendering zero columns", () => {
    const prefs = {
      v: COLUMN_PREFERENCES_VERSION,
      order: [],
      hidden: ["name", "status", "owner", "created_at"],
    };
    expect(applyColumnPreferences(defaultTableFields(config()), prefs, []).map((f) => f.name)).toEqual([
      "name",
      "status",
      "owner",
      "created_at",
    ]);
  });
});

describe("preferencesFromRows", () => {
  it("serializes the current row order and the hidden set", () => {
    const rows = toPreferenceRows(defaultTableFields(config()), null, []).map((row) =>
      row.field.name === "status" ? {...row, visible: false }: row,
    );
    expect(preferencesFromRows(rows)).toEqual({
      v: COLUMN_PREFERENCES_VERSION,
      order: ["name", "status", "owner", "created_at"],
      hidden: ["status"],
    });
  });

  it("round-trips through apply: what the modal saves is what the table renders", () => {
    const initial = toPreferenceRows(defaultTableFields(config()), null, []);
    const reordered = moveRow(initial, 2, "up");
    const hidden = reordered.map((row) => (row.field.name === "created_at" ? {...row, visible: false }: row));
    const saved = preferencesFromRows(hidden);
    expect(applyColumnPreferences(defaultTableFields(config()), saved, []).map((f) => f.name)).toEqual([
      "name",
      "owner",
      "status",
    ]);
  });
});

describe("moveRow", () => {
  const rows = toPreferenceRows(defaultTableFields(config()), null, []);

  it("swaps with the previous row on up", () => {
    expect(moveRow(rows, 1, "up").map((r) => r.field.name)).toEqual(["status", "name", "owner", "created_at"]);
  });

  it("swaps with the next row on down", () => {
    expect(moveRow(rows, 0, "down").map((r) => r.field.name)).toEqual(["status", "name", "owner", "created_at"]);
  });

  it("is a no-op past either end ", () => {
    expect(moveRow(rows, 0, "up")).toBe(rows);
    expect(moveRow(rows, rows.length - 1, "down")).toBe(rows);
  });
});

describe("storage round-trip", () => {
  it("saves and loads a preference ", () => {
    const prefs = { v: COLUMN_PREFERENCES_VERSION, order: ["status", "name"], hidden: ["owner"] };
    saveColumnPreferences("spec", prefs);
    expect(loadColumnPreferences("spec")).toEqual(prefs);
  });

  it("keys storage per entity, so one entity's change never reaches another ", () => {
    saveColumnPreferences("spec", { v: COLUMN_PREFERENCES_VERSION, order: [], hidden: ["status"] });
    expect(columnPreferencesKey("spec")).toBe("platform-core.column-prefs.spec");
    expect(columnPreferencesKey("item")).toBe("platform-core.column-prefs.item");
    expect(loadColumnPreferences("item")).toBeNull();
    expect(applyColumnPreferences(defaultTableFields(config()), loadColumnPreferences("item"), []).length).toBe(
      4,
    );
  });

  it("does not leak between resource slugs where one is a prefix of the other ", () => {
    // own literal precondition: "resource slugs [that] differ
    // but are similar enough to catch a key-prefix bug". `widget`/`gadget`
    // (used by the component-level suite) are unrelated strings and would not
    // catch a `startsWith`-style lookup; these three would.
    saveColumnPreferences("item", { v: COLUMN_PREFERENCES_VERSION, order: ["a"], hidden: ["a"] });
    expect(loadColumnPreferences("item_step")).toBeNull();
    expect(loadColumnPreferences("criterion")).toBeNull();
    expect(loadColumnPreferences("test")).toBeNull();

    saveColumnPreferences("item_step", { v: COLUMN_PREFERENCES_VERSION, order: ["b"], hidden: [] });
    expect(loadColumnPreferences("item")).toEqual({
      v: COLUMN_PREFERENCES_VERSION,
      order: ["a"],
      hidden: ["a"],
    });
    expect(loadColumnPreferences("item_step")).toEqual({
      v: COLUMN_PREFERENCES_VERSION,
      order: ["b"],
      hidden: [],
    });
  });

  it("clears a preference", () => {
    saveColumnPreferences("spec", { v: COLUMN_PREFERENCES_VERSION, order: [], hidden: ["status"] });
    clearColumnPreferences("spec");
    expect(loadColumnPreferences("spec")).toBeNull();
  });
});

describe("parseColumnPreferences — hostile input ", () => {
  it.each([
    ["null", null],
    ["empty string", ""],
    ["not JSON", "{{{"],
    ["a JSON scalar", "42"],
    ["a JSON array", "[1,2,3]"],
    ["JSON null", "null"],
    ["a future version", JSON.stringify({ v: 99, order: [], hidden: [] })],
    ["a missing version", JSON.stringify({ order: [], hidden: [] })],
    ["a non-array order", JSON.stringify({ v: 1, order: "name", hidden: [] })],
    ["a non-array hidden", JSON.stringify({ v: 1, order: [], hidden: 3 })],
    ["non-string order entries", JSON.stringify({ v: 1, order: [1, 2], hidden: [] })],
  ])("returns null for %s", (_label, raw) => {
    expect(parseColumnPreferences(raw)).toBeNull();
  });

  it("accepts the exact current shape", () => {
    expect(parseColumnPreferences(JSON.stringify({ v: 1, order: ["a"], hidden: ["b"] }))).toEqual({
      v: 1,
      order: ["a"],
      hidden: ["b"],
    });
  });
});

describe("storage unavailable ", () => {
  it("loadColumnPreferences returns null instead of throwing", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("SecurityError: access denied");
    });
    expect(() => loadColumnPreferences("spec")).not.toThrow();
    expect(loadColumnPreferences("spec")).toBeNull();
  });

  it("saveColumnPreferences swallows a quota error", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() =>
      saveColumnPreferences("spec", { v: COLUMN_PREFERENCES_VERSION, order: [], hidden: [] }),
    ).not.toThrow();
  });

  it("clearColumnPreferences swallows a storage error", () => {
    vi.spyOn(window.localStorage, "removeItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(() => clearColumnPreferences("spec")).not.toThrow();
  });

  it("the table still renders its config defaults when storage is dead", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    const rendered = applyColumnPreferences(defaultTableFields(config()), loadColumnPreferences("spec"), []);
    expect(rendered.map((f) => f.name)).toEqual(["name", "status", "owner", "created_at"]);
  });
});
