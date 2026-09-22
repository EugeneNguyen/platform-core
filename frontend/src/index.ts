/**
 * Package entry point - what a consuming app (apps/main) imports.
 * `components/` (this package's whole design system) and `containers/`
 * (stateful feature compositions built on it) each have their own
 * docstring and AGENTS.md section; this file just re-exports both.
 */
export * from "./components";
export * from "./containers";
