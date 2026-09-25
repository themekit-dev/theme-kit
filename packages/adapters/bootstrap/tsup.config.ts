import { cpSync } from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/factory.ts",
    "src/react.ts",
    "src/vue.ts",
    "src/svelte.ts",
    "src/solid.ts",
    "src/angular.ts",
  ],
  format: ["esm"],
  sourcemap: true,
  clean: true,
  target: "es2022",
  outDir: "dist",
  external: [
    "react",
    "react-dom",
    "vue",
    "svelte",
    "solid-js",
    "@angular/core",
    "@theme-kit/core",
    "@theme-kit/adapters",
  ],
  loader: {
    ".css": "text",
  },
  onSuccess: () => {
    cpSync("src/bootstrap.css", "dist/bootstrap.css");
  },
});