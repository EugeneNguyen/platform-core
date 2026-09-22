import { describe, expect, it } from "vitest";
import { pickFieldValues } from "./fields";
import type { CrudField } from "./types";

interface Org {
  id: number;
  name: string;
  createdAt: string;
}

const FIELDS: CrudField<Org>[] = [{ key: "name", label: "Name" }];

describe("pickFieldValues", () => {
  it("keeps only the declared fields, dropping everything else", () => {
    expect(pickFieldValues({ id: 1, name: "Acme", createdAt: "2026-01-01" }, FIELDS)).toEqual({ name: "Acme" });
  });

  it("omits a declared field that isn't present in values at all", () => {
    expect(pickFieldValues({ id: 1 }, FIELDS)).toEqual({});
  });
});
