import { defineConfig } from "tsup";
import { copyFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

function copyCSSFiles() {
  const srcDir = resolve("src");
  const destDir = resolve("dist");
  mkdirSync(destDir, { recursive: true });

  for (const entry of readdirSync(srcDir)) {
    const srcPath = resolve(srcDir, entry);
    if (statSync(srcPath).isFile() && entry.endsWith(".css")) {
      copyFileSync(srcPath, resolve(destDir, entry));
    }
  }
}

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  sourcemap: true,
  clean: true,
  target: "es2022",
  outDir: "dist",
  async onSuccess() {
    copyCSSFiles();
  },
});
