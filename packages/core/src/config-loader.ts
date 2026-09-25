/**
 * Build-time discovery of the application's `theme.config.ts`.
 *
 * @packageDocumentation
 */
import type { ThemeDefinition } from "./model/theme";
import type { ThemeKitConfig } from "./app-config";

/**
 * Frameworks whose build tool *is* Vite, and which therefore declare it.
 *
 * @remarks
 * An app using one of these never declares `vite` itself — it is a transitive
 * dependency — so under pnpm it is not linked into the project and cannot be
 * resolved from there. Resolving the framework and asking *it* for Vite is what
 * makes discovery work in those projects.
 */
const VITE_HOSTING_FRAMEWORKS = ["astro", "nuxt", "@sveltejs/kit", "@remix-run/dev"];

/**
 * Locates Vite's entry point for `loadConfigFromFile`.
 *
 * @param createRequire - `node:module`'s `createRequire`.
 * @param configPath - The config file being loaded, used as the first anchor.
 * @param root - The project root.
 * @returns The resolved entry point, or `null` when Vite cannot be found.
 *
 * @remarks
 * Tries the direct dependency first, then reaches it through the framework that
 * hosts Vite. Anchoring only at the config file is what failed in
 * `examples/apps/astro`: the app declares `astro`, never `vite`.
 */
function resolveVite(
  createRequire: (path: string) => NodeRequire,
  configPath: string,
  root: string,
): string | null {
  const anchors = [configPath, root];

  for (const anchor of anchors) {
    try {
      return createRequire(anchor).resolve("vite");
    } catch {
      /* try the next anchor */
    }
  }

  for (const framework of VITE_HOSTING_FRAMEWORKS) {
    for (const anchor of anchors) {
      try {
        const entry = createRequire(anchor).resolve(framework);
        return createRequire(entry).resolve("vite");
      } catch {
        /* try the next framework/anchor */
      }
    }
  }

  return null;
}

/**
 * Conventional config filenames, in resolution order.
 *
 * @see {@link loadThemeKitConfig}
 */
export const THEME_KIT_CONFIG_FILES = [
  "theme.config.ts",
  "theme.config.tsx",
  "theme.config.mts",
  "theme.config.mjs",
  "theme.config.js",
  "theme.config.cjs",
] as const;

/**
 * Finds and loads the application's {@link ThemeKitConfig}.
 *
 * @typeParam T - The theme definition type used by the application.
 * @param root - The project root to search.
 * @param configPath - An explicit path, relative to `root` or absolute. When
 *   omitted the conventional filenames are tried in order.
 * @returns The configuration, or `null` when there is none — or when it cannot
 *   be loaded, which is warned about rather than thrown, so a broken config
 *   cannot take a build down.
 *
 * @remarks
 * Shared by the Vite plugin and the Astro integration so both discover the
 * configuration the same way. Loading goes through Vite's own config loader
 * rather than a hand-rolled transform, so a TypeScript config resolves its
 * imports exactly as `vite.config.ts` does.
 *
 * `vite` is resolved from the *project*, not from here: core does not depend on
 * Vite, so a bare `import("vite")` fails wherever the package is only linked
 * where it is declared — which is the normal case under pnpm.
 *
 * @see {@link defineThemeKitConfig}
 */
export async function loadThemeKitConfig<T extends ThemeDefinition>(
  root: string,
  configPath?: string,
): Promise<ThemeKitConfig<T> | null> {
  const { existsSync } = await import("node:fs");
  const { isAbsolute, join } = await import("node:path");

  let path: string | null = null;
  if (configPath) {
    path = isAbsolute(configPath) ? configPath : join(root, configPath);
  } else {
    for (const name of THEME_KIT_CONFIG_FILES) {
      const candidate = join(root, name);
      if (existsSync(candidate)) {
        path = candidate;
        break;
      }
    }
  }
  if (!path || !existsSync(path)) return null;

  try {
    const { createRequire } = await import("node:module");
    const { pathToFileURL } = await import("node:url");
    const viteEntry = resolveVite(createRequire, path, root);
    if (!viteEntry) {
      console.warn(
        "[theme-kit] could not find Vite to load " +
          path +
          ". Pass `config` explicitly, or declare `vite` as a dependency.",
      );
      return null;
    }
    const vite = (await import(pathToFileURL(viteEntry).href)) as {
      loadConfigFromFile: (
        env: unknown,
        configFile: string,
        root: string,
      ) => Promise<{ config?: unknown } | null>;
    };
    const loaded = await vite.loadConfigFromFile(
      { command: "build", mode: "production" },
      path,
      root,
    );
    const exported = loaded?.config as { default?: ThemeKitConfig<T> } | undefined;
    return (exported?.default ?? (loaded?.config as ThemeKitConfig<T>)) ?? null;
  } catch (error) {
    console.warn(
      "[theme-kit] could not load " +
        path +
        ": " +
        (error instanceof Error ? error.message : String(error)),
    );
    return null;
  }
}
