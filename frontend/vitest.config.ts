import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vitest/config";

// Separate from vite.config.ts on purpose - that one configures the
// Module Federation host app (federation plugin, chrome89 build target),
// neither of which the component tests below need or want.
//
// The `as Plugin` cast: vitest 3's published peer range tops out at vite
// ^7 (this repo is on vite 8, ahead of that range), so npm installs a
// second, nested vite copy just for vitest - `defineConfig` here type-
// checks `plugins` against THAT copy's `Plugin` type, which structurally
// differs just enough from `@vitejs/plugin-react`'s (built against the
// top-level vite 8) to fail `tsc`. Both copies still agree on the actual
// plugin shape at runtime, so the cast is safe - revisit once vitest
// publishes a release with vite 8 in its peer range.
export default defineConfig({
  plugins: react() as unknown as Plugin[],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
