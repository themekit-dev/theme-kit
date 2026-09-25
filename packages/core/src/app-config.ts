/**
 * The canonical Theme Kit application configuration.
 *
 * @packageDocumentation
 */
import type { ThemeDefinition, ThemeMode } from "./model/theme";
import { getBuiltInThemes } from "./built-in-themes";
import type { ThemeRuntimeOptions } from "./runtime";

/**
 * The application's Theme Kit configuration: one declaration, consumed by both
 * the runtime and the pre-paint bootstrap.
 *
 * @typeParam T - The theme definition type used by the application.
 *
 * @remarks
 * This exists to remove a class of bug rather than to add a feature. When the
 * theme registry, the fallback theme and the initial mode are declared twice —
 * once for the provider and once for whatever emits the pre-paint script — the
 * two drift, and a drift is visible: the script paints one theme, the runtime
 * corrects it a frame later, and any theme-name readout contradicts the control
 * that set it.
 *
 * Two projections read this object, and neither is a second declaration:
 *
 * - the **runtime projection** — everything below, handed to
 *   `createThemeRuntime`;
 * - the **bootstrap projection** — {@link toBootstrapConfig}, the subset the
 *   pre-paint script can act on.
 *
 * @see {@link defineThemeKitConfig}
 */
export interface ThemeKitConfig<T extends ThemeDefinition> {
  /** The theme definitions registered with the runtime. */
  themes: readonly T[];
  /** Theme name to fall back to when no selection is persisted. */
  defaultTheme?: T["name"];
  /** Mode used when no selection is persisted. Defaults to the fallback theme's own mode. */
  initialMode?: ThemeMode;
  /** Family used when no selection is persisted. */
  initialFamily?: string;
  /** localStorage key holding the persisted selection. Defaults to `"theme-selection"`. */
  storageKey?: string;
  /** CSS custom property prefix. Defaults to `"theme-"`. */
  prefix?: string;
  /**
   * Whether the selection is persisted across visits. `false` or `null` disables
   * it.
   *
   * @remarks
   * Runtime-only: the bootstrap projection ignores it. The pre-paint script
   * *always* reads the persisted selection when one exists, because that is what
   * the runtime does — disabling persistence is a runtime decision made after the
   * fact, and hiding it from the script would make the two disagree for one
   * frame.
   */
  persistence?: unknown;
  /** Transition configuration. Runtime-only. */
  transition?: unknown;
  /** Overlay scrollbar options. Runtime-only. */
  scrollbar?: unknown;
  /** Runtime plugins. Runtime-only, and **not serializable** — pass it to the provider, not here. */
  plugins?: readonly unknown[];
  /** Runtime adapters. Runtime-only, and **not serializable** — pass it to the provider, not here. */
  adapters?: readonly unknown[];
}

/**
 * The subset of {@link ThemeKitConfig} the pre-paint bootstrap can act on.
 *
 * @typeParam T - The theme definition type used by the application.
 *
 * @remarks
 * Split out deliberately. The bootstrap runs before any application code and
 * before the runtime exists, so it can only resolve a selection from a
 * registry, a fallback and a persisted key — everything else in the config is a
 * runtime concern. Naming that subset is what keeps the two projections honest
 * instead of letting them grow into each other.
 *
 * @see {@link toBootstrapConfig}
 */
export type ThemeBootstrapConfig<T extends ThemeDefinition> = Pick<
  ThemeKitConfig<T>,
  "themes" | "defaultTheme" | "initialMode" | "initialFamily" | "storageKey" | "prefix"
>;

/**
 * Declares the application's Theme Kit configuration.
 *
 * @typeParam T - The theme definition type used by the application.
 * @param config - The configuration.
 * @returns The same object, typed.
 *
 * @example
 * ```ts
 * // theme.config.ts — at the project root
 * import { defineTheme, defineThemeKitConfig } from "@theme-kit/core";
 *
 * const themes = [
 *   defineTheme({
 *     name: "brand-light",
 *     meta: { family: "brand", mode: "light" },
 *     tokens: { colors: { background: "#ffffff" } },
 *   }),
 *   defineTheme({
 *     name: "brand-dark",
 *     meta: { family: "brand", mode: "dark" },
 *     tokens: { colors: { background: "#101014" } },
 *   }),
 * ];
 *
 * export default defineThemeKitConfig({
 *   themes,
 *   defaultTheme: "brand-light",
 *   initialMode: "system",
 * });
 * ```
 *
 * @remarks
 * An identity function. Its job is to give the configuration a name, a type and
 * a validation point, so the Vite plugin can discover it by convention and the
 * provider can consume the same object rather than a copy of it.
 *
 * @see {@link ThemeKitConfig}
 */
export function defineThemeKitConfig<T extends ThemeDefinition>(
  config: ThemeKitConfig<T>,
): ThemeKitConfig<T> {
  if (!config?.themes?.length) {
    throw new Error(
      "[theme-kit] defineThemeKitConfig needs a non-empty `themes` registry — " +
        "it is what the pre-paint script resolves the initial theme from.",
    );
  }
  return config;
}

/**
 * Projects a {@link ThemeKitConfig} down to what the pre-paint bootstrap needs.
 *
 * @typeParam T - The theme definition type used by the application.
 * @param config - The full application configuration.
 * @returns The bootstrap subset.
 *
 * @see {@link ThemeBootstrapConfig}
 */
export function toBootstrapConfig<T extends ThemeDefinition>(
  config: ThemeKitConfig<T>,
): ThemeBootstrapConfig<T> {
  return {
    themes: config.themes,

    ...(config.defaultTheme !== undefined ? { defaultTheme: config.defaultTheme } : {}),

    ...(config.initialMode !== undefined ? { initialMode: config.initialMode } : {}),

    ...(config.initialFamily !== undefined ? { initialFamily: config.initialFamily } : {}),

    ...(config.storageKey !== undefined ? { storageKey: config.storageKey } : {}),

    ...(config.prefix !== undefined ? { prefix: config.prefix } : {}),
  };
}

/**
 * Reads the configuration a build integration transported to the runtime.
 *
 * @typeParam T - The theme definition type used by the application.
 * @returns The transported configuration, or `null` when no integration ran.
 *
 * @remarks
 * A build integration (the Vite plugin, the Astro integration) puts the
 * {@link ThemeBootstrapConfig} projection of `theme.config.ts` on the global
 * scope before any application code runs. Reading it is what lets a provider
 * take no theme props — and it is the mechanism that makes "one declaration,
 * two consumers" true rather than aspirational.
 *
 * `globalThis` rather than `window`, because the same read has to work during
 * SSR and prerender, where there is no `window`. The server entries set the
 * same global for exactly that reason.
 *
 * @see {@link resolveRuntimeOptions}
 */
export function readTransportedConfig<T extends ThemeDefinition>(): ThemeBootstrapConfig<T> | null {
  const scope = globalThis as unknown as Record<string, unknown>;
  const transported = scope.__THEME_KIT_CONFIG__;
  return transported && typeof transported === "object"
    ? (transported as ThemeBootstrapConfig<T>)
    : null;
}

/**
 * Merges the transported configuration under a provider's own options.
 *
 * @typeParam T - The theme definition type used by the application.
 * @param options - The provider's own options. These win, so a local override
 *   stays possible.
 * @returns The options a runtime should be created from.
 *
 * @remarks
 * The order is the contract: transported first, provider second. A provider
 * that supplies `themes` is overriding the application configuration, which is
 * legitimate for a test or a storybook but is otherwise the duplication this
 * whole mechanism exists to remove.
 *
 * Provider options whose value is `undefined` are dropped rather than spread.
 * That is not a detail — Vue and Svelte hand the provider an object containing
 * *every* declared prop, with `undefined` for the ones the app did not pass, so
 * a plain spread would overwrite the transported value with `undefined` and the
 * provider would silently fall back to the built-in themes.
 *
 * `themes` is always resolved to a non-empty array. `createThemeRuntime` falls
 * back to the built-in themes only when `themes` is `undefined`, so an empty
 * array — a provider given `themes={[]}`, or a config whose registry was
 * filtered to nothing — would otherwise produce a runtime with no registry at
 * all, which throws on the first selection.
 *
 * An explicit empty array counts as *not set*, not as "no themes": the Web
 * Components provider parses an absent `themes` attribute into `[]`, and
 * treating that as an override would shadow the transported registry with
 * nothing.
 *
 * @example
 * ```ts
 * const resolved = resolveRuntimeOptions<T>(props);
 * const runtime = createThemeRuntime(resolved);
 * ```
 *
 * @see {@link readTransportedConfig}
 */
export function resolveRuntimeOptions<T extends ThemeDefinition>(
  options: Partial<ThemeRuntimeOptions<T>> = {},
): Partial<ThemeRuntimeOptions<T>> {
  const transported = readTransportedConfig<T>();

  const defined: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined) defined[key] = value;
  }

  const explicit = defined.themes as readonly T[] | undefined;
  // An explicit array wins only when it is non-empty. An empty one means "not
  // set" rather than "no themes": the Web Components provider parses an absent
  // `themes` attribute into `[]`, and treating that as an override would shadow
  // the transported registry with nothing.
  const explicitOrTransported = explicit?.length
    ? explicit
    : (transported?.themes as readonly T[] | undefined);

  return {
    ...(transported ?? {}),
    ...defined,
    themes: explicitOrTransported?.length
      ? explicitOrTransported
      : (getBuiltInThemes() as unknown as readonly T[]),
  } as Partial<ThemeRuntimeOptions<T>>;
}
