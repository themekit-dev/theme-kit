import { defineConfig } from "tsup";

// Builds both executable entries in one pass:
//   dist/cli{,.cjs}   — the `theme-kit` binary  (bin -> dist/cli.cjs)
//   dist/index{,.cjs} — the @theme-kit/cli library API (main -> dist/index.js)
export default defineConfig({
  entry: {
    cli: "src/cli.ts",
    index: "src/index.ts",
  },
  format: ["esm", "cjs"],
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false,
  target: "es2022",
  banner: { js: "#!/usr/bin/env node" },
});
