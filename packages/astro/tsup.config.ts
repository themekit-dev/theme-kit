import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    // Node / build-time: the integration and the server helpers. Imports
    // `node:url` and `@theme-kit/core/config`, so it must NOT be imported from
    // anything a browser bundles — see `src/runtime.ts`.
    index: "src/index.ts",
    // Browser, framework-neutral: `getThemeController()` and the DOM contract.
    runtime: "src/runtime.ts",
    // Browser, React: the optional island and its hooks.
    client: "src/client.tsx",
  },
  format: ["esm"],
  dts: false,
  clean: true,
  sourcemap: true,
  target: "es2022",
  outDir: "dist",
  external: [
    "react",
    "react-dom",
    "astro",
    "@theme-kit/core",
    "@theme-kit/web",
  ],
});
