import { cpSync } from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/factory.ts"],
  format: ["esm"],
  sourcemap: true,
  clean: true,
  target: "es2022",
  outDir: "dist",
  external: ["react", "react-dom", "@theme-kit/core", "@theme-kit/adapters", "@theme-kit/react"],
  loader: {
    ".css": "text",
  },
  onSuccess: () => {
    cpSync("src/open-props.css", "dist/open-props.css");
  },
});