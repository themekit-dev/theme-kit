import { cpSync } from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  sourcemap: true,
  clean: true,
  target: "es2022",
  outDir: "dist",
  external: [
    "react",
    "react-dom",
    "@theme-kit/core",
    "@theme-kit/adapters",
    "@theme-kit/react",
    "@mui/material",
    "@emotion/react",
    "@emotion/styled",
  ],
  onSuccess: () => {
    cpSync("src/theme-augmentation.d.ts", "dist/theme-augmentation.d.ts");
  },
});