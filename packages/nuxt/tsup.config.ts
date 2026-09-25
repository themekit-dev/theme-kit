import { defineConfig } from "tsup";
import { cpSync } from "node:fs";
import { resolve } from "node:path";

/**
 * `clean: true` wipes `dist` on every build, so the SFCs that the module
 * registers with `addComponentsDir` have to be copied back afterwards.
 *
 * This lives in tsup rather than only in the package's `build` script so that
 * *any* build path keeps the package valid. While the copy was a trailing `&&`
 * step, invoking tsup directly (the documented workaround for the broken `pnpm`
 * in this repo) produced a `dist` with no `runtime/components`, and
 * `ThemeScope` / `ThemeScrollbar` then silently failed to resolve at runtime.
 */
function copyComponents() {
  cpSync(resolve("src/runtime/components"), resolve("dist/runtime/components"), {
    recursive: true,
  });
}

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "runtime/plugin/index": "src/runtime/plugin/index.ts",
    "runtime/composables/index": "src/runtime/composables/index.ts",
  },
  format: ["esm"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: "es2022",
  outDir: "dist",
  external: ["nuxt", "vue", "@theme-kit/core", "@theme-kit/vue", "@nuxt/kit", "@nuxt/schema", "#app", "#imports"],
  async onSuccess() {
    copyComponents();
  },
});
