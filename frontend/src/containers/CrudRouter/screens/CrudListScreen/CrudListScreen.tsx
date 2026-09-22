import { useState } from "react";
import { Button, Card, CardFooter, CardHeader, DefaultLink, FormControl, Pagination } from "../../../../components";
import { ColumnPicker, DataTable, useDataTable } from "../../../DataTable";
import type { DataTableColumn } from "../../../DataTable";
import { createDefaultCrudApi } from "../../lib/api";
import { createCrudPaths } from "../../lib/paths";
import type { CrudConfig } from "../../lib/types";

export interface CrudListScreenProps<T> {
  config: CrudConfig<T>;
  /** Fires after a row is successfully deleted - e.g. to show a toast. The list refetches itself either way. */
  onDeleted?: (row: T) => void;
}

/**
 * `DataTable` plus a "New" link and a per-row Edit/Delete column, framed
 * in a `Card` - the "R" (and the delete half of "D") of `CrudRouter`'s
 * three screens. Edit is a `linkComponent` link (routing, not a callback
 * - same "host's router owns navigation" rule the whole package
 * follows), Delete is a real action (calls `config.api.remove`/the
 * default REST call, confirms first).
 *
 * `useDataTable` is called HERE, not left to `DataTable`'s own default:
 * this screen owns the whole card's chrome (search + `ColumnPicker` in
 * `CardHeader`, `Pagination` in `CardFooter`) instead of `DataTable`'s
 * own bundled toolbar/pagination (`<DataTable table={table}>` renders in
 * BARE mode once given a lifted `table` - see its own docstring), so
 * every piece needs to read/write the SAME state, not independent
 * instances. After a delete, `table.refetch()` gets the list back in
 * sync with the server.
 *
 * Every DATA cell in the row opens the edit screen, not just the "Edit"
 * text - each gets its own invisible `.stretched-link` decoy anchor
 * (`tabIndex={-1}`/`aria-hidden`, no visible content, no `.btn` or any
 * other class carrying its OWN `position`) filling that cell's
 * `position-relative` box. Deliberately NOT one stretched-link spanning
 * the whole `<tr>`: verified against a real browser that `position:
 * relative` on a `<tr>` does not reliably act as the containing block
 * for an absolutely-positioned descendant (`::after` collapsed to the
 * anchor's own tiny content box instead of the row) - `<td>` does,
 * reliably. It's ALSO why the decoy can't just be the visible "Edit"
 * link with `.stretched-link` added: `.btn` itself sets `position:
 * relative`, which becomes the `::after`'s containing block INSTEAD of
 * the cell (same failure, one ancestor level closer) - a real Bootstrap
 * gotcha, not obvious from the docs.
 *
 * The ACTIONS cell (Edit/Delete themselves) deliberately does NOT get
 * this decoy, unlike every other cell - also verified against a real
 * browser, not assumed: `.btn`'s own `position: relative` on Edit/Delete
 * does NOT reliably paint over a same-cell decoy's `::after` the way
 * "later positioned sibling wins" suggests it should (confirmed by an
 * actual click on Delete hitting the decoy instead). Rather than fight
 * that stacking interaction, this cell just stays as it was - a small,
 * mostly-full-of-controls cell, so losing "click blank space here too"
 * costs little, in exchange for Delete definitely still working.
 */
function CrudListScreen<T>({ config, onDeleted }: CrudListScreenProps<T>) {
  const Link = config.linkComponent ?? DefaultLink;
  const paths = createCrudPaths(config.resource);
  const api = { ...createDefaultCrudApi<T>(config.endpoint), ...config.api };
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  async function handleDelete(row: T) {
    if (!window.confirm("Delete this item?")) return;
    const id = config.rowKey(row);
    setDeletingId(id);
    try {
      await api.remove(id);
      table.refetch();
      onDeleted?.(row);
    } finally {
      setDeletingId(null);
    }
  }

  function rowLink(row: T) {
    return <Link to={paths.editPath(config.rowKey(row))} tabIndex={-1} aria-hidden="true" className="stretched-link" />;
  }

  const columns: DataTableColumn<T>[] = [
    ...config.columns.map((column) => ({
      ...column,
      className: ["position-relative", column.className].filter(Boolean).join(" "),
      render: (row: T) => (
        <>
          {rowLink(row)}
          {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "")}
        </>
      ),
    })),
    {
      key: "__crud_actions",
      header: "",
      className: "w-1",
      render: (row) => {
        const id = config.rowKey(row);
        return (
          <div className="d-flex gap-2">
            <Link to={paths.editPath(id)} className="btn btn-link btn-sm p-0">
              Edit
            </Link>
            <Button
              type="button"
              variant="link"
              className="text-danger p-0"
              disabled={deletingId === id}
              onClick={() => handleDelete(row)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useDataTable({ ...config, columns, searchable: false });

  return (
    <Card>
      <CardHeader className="d-flex align-items-center gap-2">
        <Link to={paths.createPath} className="btn btn-primary btn-sm">
          New
        </Link>
        <div className="d-flex align-items-center gap-2 ms-auto">
          {config.searchable !== false && (
            <FormControl
              type="search"
              aria-label="Search"
              placeholder="Search…"
              value={table.search}
              onChange={(event) => table.setSearch(event.target.value)}
              style={{ maxWidth: 240 }}
            />
          )}
          <ColumnPicker
            columns={table.orderedColumns}
            hiddenColumns={table.hiddenColumns}
            onToggleColumn={table.toggleColumn}
            onMoveColumn={table.moveColumn}
          />
        </div>
      </CardHeader>
      <DataTable table={table} />
      <CardFooter>
        <Pagination
          page={table.page}
          pageCount={table.pageCount}
          onPageChange={table.setPage}
          pageSize={table.pageSize}
          pageSizeOptions={table.pageSizeOptions}
          onPageSizeChange={table.setPageSize}
        />
      </CardFooter>
    </Card>
  );
}

export default CrudListScreen;
