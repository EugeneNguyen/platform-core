import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BaseApi } from "../../lib/baseApi";
import type { SchemaField } from "../../lib/schema";
import CrudLinkModal from "./CrudLinkModal";

const RELATION: SchemaField = {
  name: "books",
  type: "relation",
  required: false,
  read_only: true,
  label: "Books",
  many: true,
  related_model: "Book",
  related_endpoint: "/api/v1/books",
  kind: "many_to_many",
  back_filter: "clubs",
  through_fields: [{ name: "role", type: "string", required: true, read_only: false, label: "Role" }],
};

const BOOKS_SCHEMA = { label_plural: "books", display_field: "title", searchable: true, fields: [] };

/** Answers the related schema fetch, and every list fetch with `page`. */
function mockRequest(page: unknown, schema: unknown = BOOKS_SCHEMA) {
  return vi.fn().mockImplementation(async (path: string) => (path.endsWith("/schema") ? schema : page));
}

function listCalls(request: ReturnType<typeof vi.fn>): string[] {
  return request.mock.calls.map((call) => call[0] as string).filter((path) => !path.endsWith("/schema"));
}

describe("CrudLinkModal", () => {
  it("offers only unlinked rows and links the picked ones with through values", async () => {
    const request = mockRequest({
      items: [
        { id: "b1", title: "Dune" },
        { id: "b2", title: "Emma" },
      ],
      total: 2,
      page: 1,
      page_size: 20,
    });
    const link = vi.fn().mockResolvedValue(undefined);
    const parentApi = { link } as unknown as BaseApi<unknown>;
    const onLinked = vi.fn();
    const onClose = vi.fn();
    render(
      <CrudLinkModal open relation={RELATION} parentApi={parentApi} parentId="c1" request={request} onLinked={onLinked} onClose={onClose} />,
    );

    await screen.findByText("Dune");
    expect(listCalls(request)[0]).toMatch(/^\/api\/v1\/books\?filter\{-clubs\}=c1&page_size=20$/);

    fireEvent.click(screen.getByLabelText("Emma"));
    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "pick" } });
    fireEvent.click(screen.getByRole("button", { name: "Link 1" }));
    await waitFor(() => expect(link).toHaveBeenCalledWith("c1", "books", ["b2"], { role: "pick" }));
    expect(onLinked).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("searches with ?q=", async () => {
    const request = mockRequest({ items: [], total: 0, page: 1, page_size: 20 });
    render(
      <CrudLinkModal open relation={RELATION} parentApi={{} as BaseApi<unknown>} parentId="c1" request={request} onLinked={vi.fn()} onClose={vi.fn()} />,
    );
    expect(await screen.findByText("Nothing left to link.")).toBeInTheDocument();
    fireEvent.change(await screen.findByRole("searchbox", { name: "Search" }), { target: { value: "du" } });
    await waitFor(() => expect(listCalls(request).at(-1)).toMatch(/&q=du$/));
  });

  it("has no search box when the related resource isn't searchable", async () => {
    const request = mockRequest({ items: [{ id: "b1", title: "Dune" }], total: 1, page: 1, page_size: 20 }, { ...BOOKS_SCHEMA, searchable: false });
    render(
      <CrudLinkModal open relation={RELATION} parentApi={{} as BaseApi<unknown>} parentId="c1" request={request} onLinked={vi.fn()} onClose={vi.fn()} />,
    );
    expect(await screen.findByText("Dune")).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });
});
