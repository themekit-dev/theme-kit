import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["solid-js"],
  esbuildOptions: (options) => {
    options.jsx = "automatic";
    options.jsxImportSource = "solid-js";
  },
});
