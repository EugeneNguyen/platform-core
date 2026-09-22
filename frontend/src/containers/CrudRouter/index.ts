export { createCrudRouter } from "./CrudRouter";
export type { CrudRouter } from "./CrudRouter";

export { createCrudPaths } from "./lib/paths";
export type { CrudPaths } from "./lib/paths";

export { createDefaultCrudApi } from "./lib/api";

export * from "./lib/types";

export { useCrudForm } from "./lib/useCrudForm";

export { default as CrudListScreen } from "./screens/CrudListScreen";
export type { CrudListScreenProps } from "./screens/CrudListScreen";

export { default as CrudCreateScreen } from "./screens/CrudCreateScreen";
export type { CrudCreateScreenProps } from "./screens/CrudCreateScreen";

export { default as CrudEditScreen } from "./screens/CrudEditScreen";
export type { CrudEditScreenProps } from "./screens/CrudEditScreen";
