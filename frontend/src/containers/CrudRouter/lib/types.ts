import type { ReactNode } from "react";
import type { LinkComponent } from "../../../components";
import type { DataTableColumn, DataTableFetcher } from "../../DataTable";

export type CrudFieldType = "text" | "email" | "tel" | "password" | "number" | "checkbox";

export interface CrudField<T> {
  key: keyof T & string;
  label: ReactNode;
  /** @default "text" */
  type?: CrudFieldType;
  required?: boolean;
  autoComplete?: string;
}

export interface CrudApi<T> {
  create: (values: Partial<T>) => Promise<T>;
  read: (id: string | number) => Promise<T>;
  update: (id: string | number, values: Partial<T>) => Promise<T>;
  remove: (id: string | number) => Promise<void>;
}

export interface CrudConfig<T> {
  /** URL segment this resource lives under, e.g. `"orgs"` - `createCrudPaths` builds every path from this. */
  resource: string;
  /** List/detail REST base, e.g. `"/api/v1/orgs"` - list/create at this exact path, retrieve/update/destroy at `${endpoint}/${id}`, same routes any `BaseViewSet`'s `router.register` gives you. */
  endpoint: string;
  columns: DataTableColumn<T>[];
  fields: CrudField<T>[];
  rowKey: (row: T) => string | number;
  /** Overrides individual CRUD calls - anything left out falls back to the plain-fetch defaults in `api.ts`, built from `endpoint`. */
  api?: Partial<CrudApi<T>>;
  /** Forwarded straight to `CrudListScreen`'s `DataTable` - `DataTableConfig`'s own escape hatch for auth headers/a non-`fetch` client, kept separate from `api` above since listing is `DataTable`'s concern, not a CRUD mutation. @default DataTable's own plain-fetch default */
  fetcher?: DataTableFetcher<T>;
  /** Shows `CrudListScreen`'s `CardHeader` search box, wired to the same `DataTable` state as everything else on the list. @default true */
  searchable?: boolean;
  /** Same convention as every other `components`/`containers` piece - defaults to a plain `<a>` (`DefaultLink`) when the host doesn't pass its own router's `Link`. */
  linkComponent?: LinkComponent;
}
