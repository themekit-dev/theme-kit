import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Reads the Theme Kit core package version at build/eval time.
 * Falls back gracefully during dev if the path resolution differs.
 */
let cached: string | undefined;

export function getPkgVersion(): string {
  if (cached !== undefined) return cached;
  try {
    // The docs app lives in apps/docs, so ../../packages/core resolves to the
    // core package from the workspace root.
    const candidates = [
      join(process.cwd(), "packages/core/package.json"),
      join(process.cwd(), "../../packages/core/package.json"),
    ];
    for (const candidate of candidates) {
      try {
        const pkg = JSON.parse(readFileSync(candidate, "utf8")) as {
          version: string;
        };
        cached = pkg.version ?? "0.0.0";
        return cached;
      } catch {
        continue;
      }
    }
  } catch {
    // fall through
  }
  cached = "0.0.0";
  return cached;
}

export const PKG_VERSION = getPkgVersion();
export const PKG_VERSION_BADGE = `v${PKG_VERSION}`;