import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
      client: "src/client.ts",
    },
    format: ["esm", "cjs"],
    dts: false,
    clean: true,
    sourcemap: true,
    target: "es2022",
    outDir: "dist",
  },
  {
    entry: {
      "server/index": "src/server/index.ts",
    },
    format: ["esm", "cjs"],
    dts: false,
    clean: false,
    sourcemap: true,
    target: "es2022",
    outDir: "dist",
  },
]);
