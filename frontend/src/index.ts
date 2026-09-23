/**
 * Package entry point - what a consuming app (apps/main) imports.
 * `components/` (this package's whole design system) and `containers/`
 * (stateful feature compositions built on it) each have their own
 * docstring and AGENTS.md section; this file just re-exports both.
 */
export * from "./components";
export * from "./containers";
// For a host's own route module that renders a CRUD screen outside the
// generic route files (e.g. a detail screen in a drawer) and wants its
// relation links to land where the host mounted each resource.
export { useResourcePath } from "./routes/useResourcePath";
