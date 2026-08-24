import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/vanilla.ts", "src/vite-plugin.ts"],
  format: ["esm", "cjs"],
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false,
  target: "es2022",
});
