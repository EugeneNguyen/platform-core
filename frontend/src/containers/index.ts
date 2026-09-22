/**
 * Feature-level, stateful compositions - the layer above `components/`.
 * `components/` is this package's pure design system: presentation only,
 * no owned state, no data-fetching (see its own docstring - `AppShell`/
 * `Table`/`Fieldset` etc. all take everything as props). A container is
 * the opposite: it OWNS state/effects/data-fetching and composes several
 * `components/` pieces into one feature (`DataTable` below owns paging/
 * sort/filter/search state and the fetch effect, then renders it with
 * plain `Table` pieces).
 */

export * from "./DataTable";
export * from "./CrudRouter";
