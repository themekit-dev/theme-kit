import { defineConfig } from "tsup";

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
});
