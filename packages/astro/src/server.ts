import {
  computeFingerprint,
  resolveInitialTheme,
  type InitialThemeResolution,
  type ResolveInitialThemeOptions,
  type ThemeDefinition,
  type ThemeKitThemeConfig,
  type ThemeMode,
} from "@theme-kit/core";
import { publishTransportedConfig } from "./transport";

/**
 * Options for {@link getInitialThemeState}: the resolution inputs plus the
 * optional server-side system-preference read.
 *
 * @typeParam T - The theme definition type used by the application.
 *
 * @see {@link getInitialThemeState}
 */
export interface GetInitialThemeStateOptions<T extends ThemeDefinition>
  // `themes` is required by the resolution options but optional here, because
  // `config` supplies it. One of the two must be present at runtime.
  extends Omit<ResolveInitialThemeOptions<T>, "themes"> {
  /** The theme registry, when not supplied through {@link config}. */
  themes?: readonly T[];
  /**
   * The provider's theme configuration — the same object you pass to
   * `themeKit({ config })` and spread into `<ThemeProvider>`.
   *
   * @remarks
   * Prefer this to the individual `themes` / `defaultTheme` / `mode` options.
   * Those exist for the same reason and are what this derives from; declaring
   * the registry in several places is how the server resolution and the
   * pre-paint script drift apart.
   */
  config?: ThemeKitThemeConfig<T>;
  /**
   * Resolve `"system"` mode from the `Sec-CH-Prefers-Color-Scheme` client hint
   * instead of falling back to light. Defaults to `false`.
   *
   * @remarks
   * Without this, a `"system"` visitor's *server* render has to guess, because
   * the server cannot observe `prefers-color-scheme` — the pre-paint bootstrap
   * resolves it in the browser, which is correct for the canvas but means the
   * island's server-rendered theme name is the fallback until hydration. With
   * this enabled and the hint present, the server resolves the same theme the
   * browser will, so there is nothing left to settle.
   *
   * The hint is only sent once the deployment has advertised it, which the
   * application does by returning `Accept-CH: Sec-CH-Prefers-Color-Scheme`.
   * That makes it a *second-visit* optimisation: the first request has no hint
   * and takes the fallback, and every request after it is resolved server-side.
   * Browsers that do not implement the hint are unaffected.
   *
   * This needs a server-rendered deployment. A statically prerendered page
   * (`output: "static"`, as in `examples/apps/astro`) is built once with no
   * request, so it cannot read the hint and the pre-paint bootstrap resolves
   * `"system"` in the browser instead.
   */
  systemPreference?: boolean;
}

/**
 * Resolves the initial theme state server-side from the incoming request's
 * theme cookies, so the server-rendered HTML is already themed and a client
 * island can hydrate against the exact same state (zero-flash).
 *
 * Framework-neutral: only reads the standard `theme-mode` / `theme-family`
 * cookies, the optional `Sec-CH-Prefers-Color-Scheme` client hint, and the
 * theme registry, so it works from any Astro server context
 * (`Astro.request`) without pulling in a client framework runtime.
 *
 * @typeParam T - The theme definition type used by the application.
 * @param request - The incoming request (e.g. `Astro.request`).
 * @param options - The theme registry, fallback selection, and optional
 *   system-preference read (see {@link GetInitialThemeStateOptions}).
 * @returns The resolved initial theme state.
 *
 * @example
 * ```astro
 * ---
 * import { getInitialThemeState } from "@theme-kit/astro";
 * import { getBuiltInThemes } from "@theme-kit/core";
 *
 * const initial = await getInitialThemeState(Astro.request, {
 *   themes: getBuiltInThemes(),
 *   defaultTheme: "mint-light",
 *   mode: "system",
 *   systemPreference: true,
 * });
 * ---
 * ```
 *
 * @remarks
 * Pair this with `provider.astro` (which paints the themed `<html>` on the
 * server) and pass the result to the opt-in React island
 * (`@theme-kit/astro/client`) as its `initial` prop so hydration matches.
 *
 * @see `provider.astro`
 * @see `ThemeProviderClient`
 */
export async function getInitialThemeState<T extends ThemeDefinition>(
  request: Request,
  options: GetInitialThemeStateOptions<T>,
): Promise<InitialThemeResolution<T>> {
  const { systemPreference, config, ...resolveOptions } = options;

  // `config` is the provider's own configuration, so it wins outright rather
  // than merging: a value has exactly one source.
  const themes = config?.themes ?? resolveOptions.themes;
  if (!themes?.length) {
    throw new Error(
      "[theme-kit] getInitialThemeState needs the theme registry: pass `config` " +
        "(the object you spread into your provider) or `themes`.",
    );
  }

  const effective: ResolveInitialThemeOptions<T> = config
    ? {
        ...resolveOptions,
        themes,

        ...(config.defaultTheme !== undefined
          ? { defaultTheme: config.defaultTheme }
          : {}),

        ...(config.initialMode !== undefined ? { mode: config.initialMode } : {}),

        ...(config.initialFamily !== undefined ? { family: config.initialFamily } : {}),
      }
    : { ...resolveOptions, themes };

  const cookieHeader = request.headers.get("Cookie") ?? "";

  function getCookie(name: string): string | undefined {
    const match = cookieHeader.match(
      new RegExp(`(?:^|;\\s*)${encodeURIComponent(name)}=([^;]*)`),
    );
    return match ? decodeURIComponent(match[1]!) : undefined;
  }

  const mode = getCookie("theme-mode");
  const family = getCookie("theme-family");
  const savedFingerprint = getCookie("theme-fingerprint");



  // Reject a selection written by a *different* theme configuration, exactly as
  // the pre-paint bootstrap script and `provider.astro` do. Without this the
  // server would honour a stale cookie that the document and the injected
  // script both refuse — so the resolved theme would disagree with the one the
  // document paints, which is the drift this function exists to prevent.
  const fingerprint = computeFingerprint(effective.themes, effective.defaultTheme);
  const cookiesAreCurrent =
    !savedFingerprint || savedFingerprint === fingerprint;

  // `Sec-CH-Prefers-Color-Scheme` is a structured-header string, so the value
  // arrives as `"dark"` on some servers and `dark` on others. Accept both, and
  // treat anything else (`?`, absent, a browser that never sends it) as unknown
  // rather than as light — an unknown preference must not be resolved as an
  // explicit one.
  const prefersDark = systemPreference
    ? readPrefersDark(request.headers.get("sec-ch-prefers-color-scheme"))
    : undefined;

  const resolution = await resolveInitialTheme({
    ...effective,
    ...(cookiesAreCurrent &&
      mode &&
      (mode === "light" || mode === "dark" || mode === "system") && {
        mode: mode as ThemeMode,
      }),
    ...(cookiesAreCurrent &&
      family && {
        family,
      }),
    ...(prefersDark !== undefined ? { prefersDark } : {}),
  });

  // Publish the handoff the build integration injects for the browser, so an
  // island rendered on the *server* builds its runtime from the real
  // configuration rather than the built-in fallback. This runs in the page's
  // frontmatter, which is the earliest point a page controls.
  //
  // It is not the *only* publisher: `provider.astro` publishes the same
  // configuration from its own frontmatter, which Astro runs before the slot it
  // wraps. That covers the Astro-native case — a provider with no page-level
  // `getInitialThemeState()` call at all — which is the common one now that the
  // native `<ThemeToggle />` exists. See `publishTransportedConfig`.
  if (config) publishTransportedConfig(config);

  return resolution;
}

/** Reads a `Sec-CH-Prefers-Color-Scheme` value into `prefersDark`. */
function readPrefersDark(value: string | null): boolean | undefined {
  const hint = value?.replace(/"/g, "").trim().toLowerCase();
  if (hint === "dark") return true;
  if (hint === "light") return false;
  return undefined;
}
