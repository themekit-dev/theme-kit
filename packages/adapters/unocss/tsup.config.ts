import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  sourcemap: true,
  clean: true,
  target: "es2022",
  outDir: "dist",
  external: ["unocss", "@unocss/core", "@theme-kit/core", "@theme-kit/adapters"],
});