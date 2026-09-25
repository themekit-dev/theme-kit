// @vitest-environment node
/**
 * The contract that replaced the duplicated configuration: the integration
 * discovers `theme.config.ts`, derives the bootstrap from it, and transports the
 * same projection to the runtime.
 *
 * Node environment, deliberately. Discovery goes through Vite's
 * `loadConfigFromFile`, which bundles the config in the Node realm and asserts
 * on its own `Uint8Array` — under jsdom that global is a different realm's, and
 * the loader fails with `Invariant violation: "new TextEncoder().encode("")
 * instanceof Uint8Array" is incorrectly false`, which surfaces only as a warning
 * and a silent fall back to the built-in themes. The DOM tests live in
 * `integration.test.ts`; these need the real Node globals.
 *
 * The fixture lives inside this package on purpose: `loadThemeKitConfig`
 * resolves Vite through whichever framework hosts it, and from here `astro` —
 * and therefore Vite — is reachable by walking up to
 * `packages/astro/node_modules`. A fixture in a temp directory outside the
 * workspace would have no `node_modules` to walk to, and the test would be
 * measuring the resolver's fallback rather than the integration's behaviour.
 */
import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { themeKit } from "../src/integration";

interface SetupOptions {
  injectScript(stage: string, content: string): void;
  config?: { root: URL | string };
}

const FIXTURE_ROOT = pathToFileURL(
  path.join(import.meta.dirname, "fixtures", "discovery"),
);

/** Runs the hook against a given root and collects the injections. */
async function injectAtRoot(root: URL) {
  const injected: { stage: string; content: string }[] = [];
  const hook = themeKit().hooks["astro:config:setup"] as unknown as (
    setup: SetupOptions,
  ) => void | Promise<void>;

  await hook({
    config: { root },
    injectScript(stage, content) {
      injected.push({ stage, content });
    },
  });

  return injected;
}

describe("themeKit integration — config discovery", () => {
  it("transports the discovered config to the runtime", async () => {
    const injected = await injectAtRoot(FIXTURE_ROOT);
    const transport = injected.find((entry) =>
      entry.content.includes("__THEME_KIT_CONFIG__"),
    );

    expect(transport).toBeDefined();
    expect(transport!.stage).toBe("head-inline");

    // The bootstrap projection, not the whole config: `persistence`,
    // `transition`, `scrollbar`, `plugins` and `adapters` are runtime-only and
    // are deliberately not serialized into the page.
    const payload = JSON.parse(
      transport!.content
        .replace(/^window\.__THEME_KIT_CONFIG__=/, "")
        .replace(/;$/, ""),
    ) as Record<string, unknown>;

    expect(Object.keys(payload).sort()).toEqual(
      ["defaultTheme", "initialFamily", "initialMode", "themes"].sort(),
    );
    expect(payload.defaultTheme).toBe("fixture-dark");
    expect(payload.initialMode).toBe("system");
    expect(payload.initialFamily).toBe("fixture");
    expect((payload.themes as { name: string }[]).map((t) => t.name)).toEqual([
      "fixture-light",
      "fixture-dark",
    ]);
  });

  it("derives the bootstrap from the discovered config, not from the built-ins", async () => {
    const injected = await injectAtRoot(FIXTURE_ROOT);
    const bootstrap = injected.find((entry) => entry.content.includes("fp!=="));

    expect(bootstrap).toBeDefined();
    // The fixture's registry is what got inlined. The built-in neutral themes
    // would be the giveaway that discovery silently failed and the integration
    // fell back — the failure mode this whole path exists to prevent.
    expect(bootstrap!.content).toContain("fixture-light");
    expect(bootstrap!.content).toContain("fixture-dark");
    expect(bootstrap!.content).not.toContain("neutral-light");
  });

  it("resolves discovery from a string root as well as a URL", async () => {
    const injected = await injectAtRoot(
      fileURLToPath(FIXTURE_ROOT) as unknown as URL,
    );

    expect(
      injected.some((entry) => entry.content.includes("__THEME_KIT_CONFIG__")),
    ).toBe(true);
  });

  it("falls back to the built-in themes when the root has no config", async () => {
    // This package's own root: reachable, and no `theme.config.ts` in it.
    const injected = await injectAtRoot(pathToFileURL(import.meta.dirname));

    expect(
      injected.some((entry) => entry.content.includes("__THEME_KIT_CONFIG__")),
    ).toBe(false);
    expect(injected.some((entry) => entry.content.includes("fp!=="))).toBe(true);
  });
});
