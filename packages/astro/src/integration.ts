import type { AstroIntegration } from "astro";
import { fileURLToPath } from "node:url";
import {
  buildThemeCssMap,
  createPrePaintScrollbarScript,
  getBuiltInThemes,
  resolveInitialTheme,
  type PrePaintScrollbarOptions,
  type ThemeDefinition,
  type ThemeKitConfig,
  type ThemeKitThemeConfig,
  type ThemeMode,
  toBootstrapConfig,
} from "@theme-kit/core";
// Build-time only: `@theme-kit/core/config` is a separate entry precisely so the
// runtime entry never pulls in node builtins.
import { loadThemeKitConfig } from "@theme-kit/core/config";
import {
  buildThemeBootstrapPayload,
  createBlockingScript,
  systemModeCSSTemplate,
} from "./blocking-script";
import { createNavigationScript } from "./navigation-script";
import { computeFingerprint } from "./fingerprint";

/**
 * Options for {@link themeKit}. Configures the theme registry the injected
 * bootstrap resolves against and the fallback selection used when no
 * persisted cookie is present.
 *
 * @see {@link themeKit}
 */
export interface ThemeKitIntegrationOptions {
  /**
   * The provider's theme configuration — the same object you pass to
   * `getInitialThemeState` and `provider.astro`.
   *
   * @remarks
   * Prefer this to the individual `themes` / `defaultTheme` / `mode` options.
   * The integration owns the pre-paint script, the page owns the server
   * resolution and the provider owns the runtime; giving all three one object
   * is what stops them disagreeing about the registry, the fallback theme or the
   * initial mode — a disagreement the visitor sees as a flash of the wrong
   * theme, with any theme-name readout contradicting the control that set it.
   */
  config?: ThemeKitThemeConfig<ThemeDefinition>;
  /**
   * The theme registry the bootstrap resolves against. Defaults to the
   * built-in neutral themes when omitted or empty.
   *
   * @deprecated Pass {@link ThemeKitIntegrationOptions.config} instead.
   */
  themes?: readonly ThemeDefinition[];
  /**
   * Fallback theme name when no selection is persisted.
   * @deprecated Pass {@link ThemeKitIntegrationOptions.config} instead.
   */
  defaultTheme?: string;
  /**
   * Fallback mode when no selection is persisted. Defaults to the fallback
   * theme's own mode — the mode `defaultTheme` resolves to.
   *
   * @remarks
   * Pass `"system"` to follow `prefers-color-scheme` instead. Whatever you
   * choose, the React island that mounts the runtime must be given the same
   * value as its `initialMode`; the integration owns the script and the island
   * owns the runtime, and a disagreement between them makes the runtime correct
   * the paint the script already produced.
   *
   * @deprecated Pass {@link ThemeKitIntegrationOptions.config} instead — one
   * object, so there is nothing to mirror.
   */
  mode?: ThemeMode;
  /**
   * Set to `false` to skip injecting the pre-paint bootstrap script (e.g. when
   * you emit it yourself with `createBlockingScript`). Defaults to `true`.
   */
  injectBootstrap?: boolean;
  /**
   * Hide the native scrollbar before first paint, so the Theme Kit overlay
   * scrollbar (`ThemeScrollbar`) is the only scrollbar from the first frame —
   * the same guarantee the Vite plugin and the Nuxt module provide.
   *
   * `true` hides it on fine-pointer (desktop) devices; pass
   * `{ touch: true }` to hide it on coarse-pointer devices too. Defaults to
   * `false` — only enable it when the page actually mounts `ThemeScrollbar`.
   *
   * @remarks
   * The injected script keeps native scrollbars on coarse-pointer devices
   * unless `touch` is set. Pass `scrollbar` to `provider.astro` instead when
   * you want the `tk-scrollbar` class in the server-rendered HTML (no script,
   * but then it applies to every device, like `@theme-kit/nuxt`).
   */
  scrollbar?: boolean | PrePaintScrollbarOptions;
  /**
   * Keep the resolved theme across Astro client-side navigations
   * (`<ClientRouter />`). Defaults to `true`.
   *
   * @remarks
   * Astro copies each incoming page's `<html>` attributes over the live root,
   * which would revert a client navigation to that page's build-time theme
   * until the island re-hydrates. The injected listener re-applies the live
   * state on `astro:before-swap`, before Astro reads those attributes. It is
   * inert on sites without `<ClientRouter />`.
   */
  navigation?: boolean;
}

/**
 * Builds the inline bootstrap string injected into every page's `<head>`: the
 * zero-flash blocking script plus, for `system` mode, a
 * `prefers-color-scheme: dark` stylesheet so dark-mode visitors are themed
 * even before the script runs.
 */
function buildBootstrap(
  fingerprint: string,
  themes: readonly ThemeDefinition[],
  defaultTheme: string | undefined,
  mode: ThemeMode | undefined,
): string {
  const themeCssMap = buildThemeCssMap(themes);

  const initial = resolveInitialTheme({
    themes,
    ...(defaultTheme !== undefined ? { defaultTheme } : {}),
    ...(mode !== undefined ? { mode } : {}),
  });

  // One resolution contract: the fallback family, its light/dark variables, the
  // theme-name lookup AND the fallback mode all come from the same
  // `resolveInitialTheme` call the client runtime makes, so the pre-paint script
  // cannot disagree with it. The mode was the one that used to disagree: `mode`
  // was forwarded to a plan that defaulted its own fallback to `"system"` while
  // this resolution defaulted to the fallback theme's mode, so an app that
  // omitted `mode` painted one theme and corrected to another.
  const {
    names,
    defaults,
    family: fallbackFamily,
    families,
  } = buildThemeBootstrapPayload(themes, initial.selection.family);

  const script = createBlockingScript(fingerprint, themeCssMap, {
    // Always forward the mode resolved above rather than letting this function
    // apply its own `"system"` default. That default was a second, independent
    // source of truth for the same decision — the drift the shared applier
    // exists to prevent — and it disagreed with the resolution above whenever
    // `mode` was omitted, which is how a default-config Astro app flashed.
    mode: initial.selection.mode,
    family: fallbackFamily,
    // The registry's families, so the script can reject a `theme-family` cookie
    // left over from before the app changed its family set instead of naming a
    // family with no variables behind it.
    families,
    names,
    defaults,
  });

  if (initial.selection.mode !== "system") {
    return script;
  }

  // `"system"` cannot be expressed as an inline `style` on <html>: the server
  // would have to commit to light or dark, and an inline declaration outranks
  // the media query meant to correct it. So the whole selection is expressed in
  // CSS instead — both schemes, no inline variables — which is also what keeps
  // an OS-dark visitor correct when scripts are blocked.
  const systemCss = systemModeCSSTemplate(defaults.light, defaults.dark);

  // `head-inline` injects this string as the *body* of a <script> tag, so the
  // stylesheet is installed as a DOM write rather than raw CSS. The guard keeps
  // the install idempotent: `provider.astro` can emit the same stylesheet
  // statically, and without the guard a second install stacks a duplicate sheet.
  return (
    `${script};(function(){try{` +
    `if(document.querySelector('style[data-theme-kit="system"]'))return;` +
    `var s=document.createElement("style");` +
    `s.setAttribute("data-theme-kit","system");` +
    `s.textContent=${JSON.stringify(systemCss)};` +
    `document.head.appendChild(s)` +
    `}catch(e){}})()`
  );
}

/**
 * Theme Kit Astro integration. Registers the pre-paint theme bootstrap with
 * Astro so every page is themed before first paint (zero-flash), without
 * requiring a client-side framework runtime.
 *
 * @param options - The integration options (see {@link ThemeKitIntegrationOptions}).
 * @returns An Astro integration to register in `astro.config.ts`.
 *
 * @example
 * ```ts
 * // astro.config.ts — register the integration. No theme data.
 * import { defineConfig } from "astro/config";
 * import themeKit from "@theme-kit/astro";
 *
 * export default defineConfig({
 *   integrations: [themeKit()],
 * });
 * ```
 *
 * @remarks
 * **Config discovery.** The integration finds the application's
 * `theme.config.ts` in Astro's root, trying `theme.config.ts`, `.tsx`, `.mts`,
 * `.mjs`, `.js` and `.cjs` in that order, and requires a default export — the
 * object {@link defineThemeKitConfig} returns. Passing `config` skips discovery
 * and accepts either the object or a path to it.
 *
 * **Two consumers, one declaration.** The discovered configuration is projected
 * twice: {@link buildBootstrap} derives the blocking script from it, and the
 * same projection is injected as `window.__THEME_KIT_CONFIG__` from `<head>`.
 * The island reads that global instead of taking theme props, so the markup the
 * server renders and the markup the browser hydrates come from the same
 * registry — a mismatch there is visible as the panel repainting as the real
 * families replace the presets. `getInitialThemeState` publishes the same global
 * on the server, because no integration runs there.
 *
 * When the app has no discoverable config, the built-in neutral themes are used
 * and nothing fails.
 *
 * The integration owns the framework/build boundary only. Server-rendering the
 * themed `<html>` element is handled by `@theme-kit/astro/provider.astro`, and
 * interactive controls are opt-in islands — React users import the island from
 * `@theme-kit/astro/client`, which is the only entry that depends on React.
 *
 * The bootstrap is injected at the **`head-inline`** stage, and that choice is
 * load-bearing rather than incidental. `before-hydration` looks equivalent —
 * both run before the island hydrates — but it ships the script as a *module*
 * (resolved and bundled by Vite), so it executes after the browser has already
 * painted. Measured on a prerendered page, where the server cannot know the
 * visitor's selection and always emits the default theme:
 *
 * | condition | `head-inline` | `before-hydration` |
 * |---|---|---|
 * | OS dark, no cookie | dark at 84 ms, never corrected | light painted at 74 ms, corrected at 98 ms |
 * | dark cookie, cold cache + slow network | dark at 518 ms, never corrected | light painted at 513 ms, corrected at 1052 ms |
 *
 * So `before-hydration` does not merely weaken the guarantee — it produces a
 * visible flash of the *wrong* theme, up to ~540 ms of it. Paint ordering
 * requires the inline head script; pre-hydration is not sufficient.
 *
 * For a `"system"` selection the script is not the first line of defence —
 * CSS is. The server cannot know the visitor's preference, so it must not
 * commit to one: an inline `style` on `<html>` outranks every stylesheet rule,
 * which means inlining a guess would silently defeat the
 * `prefers-color-scheme` block meant to correct it. Measured on the built
 * example with page scripts blocked and the OS set to dark, the
 * inline-variables-plus-dark-block combination painted the *light* canvas
 * (`rgb(248, 250, 252)`); emitting both schemes as media blocks and no inline
 * variables paints `rgb(2, 6, 23)`. See {@link systemModeCSSTemplate}.
 *
 * Client-side navigation (`<ClientRouter />`) is handled separately by
 * {@link createNavigationScript} — the injected bootstrap is byte-identical on
 * every page, so Astro de-duplicates it and it does not re-run, and the live
 * theme state would otherwise be replaced by the destination page's build-time
 * attributes.
 *
 * @see {@link ThemeKitIntegrationOptions}
 * @see `createBlockingScript`
 * @see `systemModeCSSTemplate`
 */
export function themeKit(options: ThemeKitIntegrationOptions = {}): AstroIntegration {
  // `config` is the provider's own configuration, so it wins outright rather
  // than merging: a value has exactly one source.
  /**
   * Projects the application configuration onto this integration's option shape.
   *
   * @param discovered - The configuration found at `astro:config:setup`, or
   *   `null` when the app has none.
   * @returns The options the bootstrap is built from.
   */
  function projectThemeOptions(
    discovered: ThemeKitConfig<ThemeDefinition> | null | undefined,
  ): { themes?: readonly ThemeDefinition[]; defaultTheme?: string; mode?: ThemeMode } {
    const source =
      discovered ??
      (options.config && typeof options.config === "object" ? options.config : null);
    if (!source) return options;
    return {
      themes: source.themes,

      ...(source.defaultTheme !== undefined ? { defaultTheme: source.defaultTheme } : {}),

      ...(source.initialMode !== undefined ? { mode: source.initialMode } : {}),
    };
  }

  const eagerEffective = projectThemeOptions(
    options.config && typeof options.config === "object" ? options.config : null,
  );
  const themes = eagerEffective.themes?.length
    ? eagerEffective.themes
    : (getBuiltInThemes() as unknown as readonly ThemeDefinition[]);

  const fingerprint = computeFingerprint(themes, eagerEffective.defaultTheme);
  const bootstrap = buildBootstrap(fingerprint, themes, eagerEffective.defaultTheme, eagerEffective.mode);

  const scrollbarScript = options.scrollbar
    ? createPrePaintScrollbarScript(
        options.scrollbar === true ? {} : options.scrollbar,
      )
    : null;

  const navigationScript =
    options.navigation === false ? null : createNavigationScript();

  return {
    name: "@theme-kit/astro",
    hooks: {
      "astro:config:setup": async ({ injectScript, config }) => {
        // Discover the application configuration the same way the Vite plugin
        // does, so `astro.config.mjs` only registers the integration.
        //
        // `config.root` is a URL in Astro and is always set there; it is read
        // defensively because the hook is also exercised directly, where the
        // setup object may carry nothing but `injectScript`.
        const root = config?.root;
        const projectRoot = root
          ? typeof root === "string"
            ? root
            : fileURLToPath(root)
          : process.cwd();

        const discovered =
          options.config && typeof options.config === "object"
            ? (options.config as ThemeKitConfig<ThemeDefinition>)
            : await loadThemeKitConfig<ThemeDefinition>(
                projectRoot,
                typeof options.config === "string" ? options.config : undefined,
              );

        if (discovered) {
          // Transport it to the runtime: the island's provider reads this global
          // instead of taking the same values again as props.
          injectScript(
            "head-inline",
            "window.__THEME_KIT_CONFIG__=" +
              JSON.stringify(toBootstrapConfig(discovered)).replace(/</g, "\\u003c") +
              ";",
          );
        }

        if (options.injectBootstrap !== false) {
          const projected = projectThemeOptions(discovered);
          const resolvedThemes = projected.themes?.length
            ? projected.themes
            : (getBuiltInThemes() as unknown as readonly ThemeDefinition[]);
          injectScript(
            "head-inline",
            buildBootstrap(
              computeFingerprint(resolvedThemes, projected.defaultTheme),
              resolvedThemes,
              projected.defaultTheme,
              projected.mode,
            ),
          );
        }
        if (scrollbarScript) {
          injectScript("head-inline", scrollbarScript);
        }
        if (navigationScript) {
          injectScript("head-inline", navigationScript);
        }
      },
    },
  };
}

export default themeKit;
