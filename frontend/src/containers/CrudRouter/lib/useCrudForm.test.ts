import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCrudForm } from "./useCrudForm";

interface Org {
  id: number;
  name: string;
}

describe("useCrudForm", () => {
  it("starts with the given initial values", () => {
    const { result } = renderHook(() => useCrudForm<Org>({ name: "Acme" }));
    expect(result.current.values).toEqual({ name: "Acme" });
  });

  it("setValue merges a single field", () => {
    const { result } = renderHook(() => useCrudForm<Org>());
    act(() => result.current.setValue("name", "Acme"));
    expect(result.current.values).toEqual({ name: "Acme" });
  });

  it("setValues replaces the whole form", () => {
    const { result } = renderHook(() => useCrudForm<Org>({ name: "Acme" }));
    act(() => result.current.setValues({ id: 1, name: "Globex" }));
    expect(result.current.values).toEqual({ id: 1, name: "Globex" });
  });

  it("submit calls the action with the current values and returns its result", async () => {
    const { result } = renderHook(() => useCrudForm<Org>({ name: "Acme" }));
    const action = vi.fn().mockResolvedValue({ id: 1, name: "Acme" });

    let returned: Org | null = null;
    await act(async () => {
      returned = await result.current.submit(action);
    });

    expect(action).toHaveBeenCalledWith({ name: "Acme" });
    expect(returned).toEqual({ id: 1, name: "Acme" });
    expect(result.current.submitting).toBe(false);
  });

  it("submit captures a rejection as error and returns null", async () => {
    const { result } = renderHook(() => useCrudForm<Org>());
    const action = vi.fn().mockRejectedValue(new Error("boom"));

    let returned: Org | null | undefined;
    await act(async () => {
      returned = await result.current.submit(action);
    });

    expect(returned).toBe(null);
    await waitFor(() => expect(result.current.error?.message).toBe("boom"));
  });
});
