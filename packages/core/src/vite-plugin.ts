/**
 * Theme Kit Vite plugin — injects the zero-flash bootstrap script and the
 * pre-paint scrollbar CSS into the served HTML.
 *
 * Imported from the `@theme-kit/core/vite` subpath. Use with the Vite
 * configuration of vanilla or framework apps that render HTML on the
 * server.
 *
 * @packageDocumentation
 */
import type { ThemeDefinition, ThemeMode } from "./model/theme";
import { createThemeBootstrapScript, createThemeReadoutScript } from "./bootstrap";
import { toBootstrapConfig, type ThemeKitConfig } from "./app-config";
import { loadThemeKitConfig } from "./config-loader";
import { createPrePaintScrollbarScript } from "./scrollbar/pre-paint";

/**
 * The deprecated inline form of the theme configuration: the registry, the
 * fallback theme, the initial mode/family, and the persistence key and prefix,
 * passed straight to {@link themeKitVitePlugin}.
 *
 * @typeParam T - The theme definition type used by the application.
 *
 * @deprecated Declare this once in `theme.config.ts` via
 * {@link defineThemeKitConfig} instead. The plugin discovers that file by
 * convention, so there is nothing to pass — and passing it here as well is
 * exactly the duplication that lets the pre-paint script and the runtime drift
 * apart. A drift is visible: the script paints `system` while the runtime
 * resolves `light`, the runtime corrects what the script painted, and the
 * visitor sees a flash. These options are still honoured when the app has no
 * discoverable config, so existing setups keep working.
 *
 * @see {@link themeKitVitePlugin}
 */
export interface ThemeKitThemeConfig<T extends ThemeDefinition> {
  /** The theme definitions registered with the runtime. */
  themes: readonly T[];
  /** Theme name to fall back to when no persisted selection exists. */
  defaultTheme?: T["name"];
  /**
   * Mode used when no persisted selection exists. Defaults to the fallback
   * theme's own mode — whatever `defaultTheme` resolves to, so a
   * `defaultTheme="light"` app paints light from frame one.
   */
  initialMode?: ThemeMode;
  /** Family used when no persisted selection exists. */
  initialFamily?: string;
  /** localStorage key holding the persisted theme selection. Defaults to `"theme-selection"`. */
  storageKey?: string;
  /** CSS custom property prefix. Defaults to `"theme-"`. */
  prefix?: string;
}

/**
 * Options for {@link themeKitVitePlugin}: where the application configuration
 * lives, plus the concerns that only exist at build time.
 *
 * @typeParam T - The theme definition type used by the application.
 *
 * @see {@link themeKitVitePlugin}
 */
export interface ThemeKitVitePluginOptions<T extends ThemeDefinition> {
  /**
   * The application's theme configuration, when discovery is not enough.
   *
   * @remarks
   * Omit this. The plugin finds `theme.config.ts` at Vite's root by convention,
   * which is the whole point of the file — a path is only needed when the
   * configuration lives somewhere unusual. The object form exists for
   * programmatic setups that build a config at runtime.
   *
   * @example
   * ```ts
   * import { themeKitVitePlugin } from "@theme-kit/core/vite";
   *
   * export default defineConfig({
   *   plugins: [
   *     // Only when the file is not at the root.
   *     themeKitVitePlugin({ config: "./config/theme.config.ts" }),
   *   ],
   * });
   * ```
   *
   * @see {@link ThemeKitThemeConfig}
   */
  config?: ThemeKitThemeConfig<T> | string;
  /**
   * The theme definitions registered with the runtime.
   *
   * @deprecated Pass {@link ThemeKitVitePluginOptions.config} instead — the same
   * object the provider spreads. Declaring the registry here as well means the
   * pre-paint script and the runtime are configured independently, which is how
   * they drift.
   */
  themes?: readonly T[];
  /**
   * Theme name to fall back to when no persisted selection exists.
   * @deprecated Pass {@link ThemeKitVitePluginOptions.config} instead.
   */
  defaultTheme?: T["name"];
  /**
   * Mode the pre-paint script uses when no persisted selection exists.
   * @deprecated Pass {@link ThemeKitVitePluginOptions.config} instead.
   */
  initialMode?: ThemeMode;
  /**
   * Family the pre-paint script uses when no persisted selection exists.
   * @deprecated Pass {@link ThemeKitVitePluginOptions.config} instead.
   */
  initialFamily?: string;
  /**
   * localStorage key holding the persisted theme selection.
   * @deprecated Pass {@link ThemeKitVitePluginOptions.config} instead.
   */
  storageKey?: string;
  /**
   * CSS custom property prefix.
   * @deprecated Pass {@link ThemeKitVitePluginOptions.config} instead.
   */
  prefix?: string;
  /** Hide native scrollbars before first paint by injecting the scrollbar
   *  pre-paint bootstrap script. `true` hides them (desktop), an options
   *  object keeps native bars on coarse-pointer devices unless `touch` is
   *  forced. Default `false` — the script is only needed when the page uses
   *  the Theme Kit overlay scrollbar. */
  scrollbar?: boolean | import("./scrollbar/pre-paint").PrePaintScrollbarOptions;
  /**
   * Make React's first render commit synchronously, so the browser's first
   * painted frame is already the app. Defaults to `true`.
   *
   * @remarks
   * React's concurrent root *schedules* the initial commit, so the browser can
   * paint a frame with the root still empty before React commits — one frame,
   * ~33 ms, plainly visible as the UI blinking on reload. It cannot be fixed
   * from inside the app's component tree: that frame is painted before any of
   * the app's React code runs, so no provider, insertion effect or layout effect
   * is in time. It has to happen at the root, and this plugin is the one place
   * that can reach the root without the application writing root-level code.
   *
   * It works by resolving `react-dom/client` to a shim that wraps `createRoot`
   * and flushes its **first** `render` call with `flushSync`; every later render
   * keeps React's normal concurrent scheduling. Three things keep the reach
   * narrow: the alias applies only to imports from **application** code, so a
   * dependency's own root is left alone; it is skipped entirely in an **SSR
   * build**, where nothing is painted and the shim could only break the build;
   * and `hydrateRoot` is never wrapped, so hydration is unaffected. React is not
   * required to be present — if nothing imports `react-dom/client`, the shim is
   * never loaded.
   *
   * Note this only closes the window *after* the bundle starts running. The
   * window before it — during which the document paints with an empty root — can
   * only be closed by markup in the HTML, i.e. by prerendering.
   *
   * Set `false` to opt out. `createThemeRoot()` remains the explicit opt-in for
   * apps that want Theme Kit to own the root outright.
   */
  syncFirstRender?: boolean;
  /**
   * Module that exports `render(): string` — the app's markup, server-rendered.
   * Set it and the plugin prerenders `#root` in the **dev server** as well as
   * in a build.
   *
   * @remarks
   * A production build can prerender with a separate step, but `vite dev` serves
   * the entry as individual unbundled modules: the first paint can be *seconds*
   * away from the app appearing, and `#root` is empty for that whole window.
   * Measured in `examples/apps/react` on a dev server: a reload painted a blank
   * frame
   * and did not show the app for ~7.9 s.
   *
   * With this set, `transformIndexHtml` renders the app on each dev page load and
   * injects the markup into `#root`, so the document's first paint has content.
   * The cost is one server render per page load, in dev only.
   *
   * @defaultValue `"/src/entry-server.tsx"` — the conventional path. If the
   * module is not there the render is skipped and nothing changes, so apps that
   * follow the convention get this for free and apps that do not are unaffected.
   * Pass `null` to opt out.
   */
  ssrEntry?: string | null;
  /**
   * `id` of the element `ssrEntry`'s markup is injected into.
   * @defaultValue `"root"`
   */
  ssrContainer?: string;
}

/**
 * Structural twin of Vite's `HtmlTagDescriptor`. Kept local so the plugin does
 * not need a hard dependency on `vite` types; the shape is assignable to
 * Vite's `IndexHtmlTransformResult` in Vite 4 through 8.
 */
export interface ThemeKitViteInjectedTag {
  tag: string;
  attrs?: Record<string, string | boolean | undefined>;
  children?: string;
  injectTo?: "head" | "body" | "head-prepend" | "body-prepend";
}

export interface ThemeKitVitePlugin {
  name: string;
  enforce: "pre";
  transformIndexHtml(
    html: string,
    ctx?: unknown,
  ):
    | string
    | ThemeKitViteInjectedTag[]
    | { html: string; tags: ThemeKitViteInjectedTag[] }
    | Promise<string | ThemeKitViteInjectedTag[] | { html: string; tags: ThemeKitViteInjectedTag[] }>;
  resolveId?(
    source: string,
    importer: string | undefined,
    // Deliberately `unknown`, not a hand-rolled shape. Vite's own `options`
    // parameter carries `attributes` / `ssr` / `isEntry` / `custom`, and a
    // narrower type here makes the whole plugin unassignable to `PluginOption`
    // (parameters are contravariant) — which is exactly how this broke a user's
    // `vite.config.ts`. The implementation narrows it.
    options?: unknown,
  ): string | null | undefined | Promise<string | null | undefined>;
  load?(id: string): string | null | undefined | Promise<string | null | undefined>;
  configResolved?(config: { build?: { ssr?: unknown } }): void;
  configureServer?(server: unknown): void;
}

/**
 * Virtual module the plugin resolves `react-dom/client` to when
 * `syncFirstRender` is on. The leading NUL keeps Vite from treating it as a
 * real file path.
 */
/**
 * Where an app's server entry conventionally lives. Used as the default for
 * `ssrEntry`, so the dev prerender works without configuration in the common
 * layout and silently does nothing elsewhere.
 */
const DEFAULT_SSR_ENTRY = "/src/entry-server.tsx";

const REACT_DOM_CLIENT_ID = "virtual:theme-kit/react-dom-client";
const RESOLVED_REACT_DOM_CLIENT_ID = "\0" + REACT_DOM_CLIENT_ID;
const REACT_DOM_CLIENT_WRAPPER_ID = "virtual:theme-kit/react-dom-client-wrapper";
const RESOLVED_REACT_DOM_CLIENT_WRAPPER_ID = "\0" + REACT_DOM_CLIENT_WRAPPER_ID;

/**
 * Builds the shim source — a pure re-export, with no local `createRoot` binding.
 *
 * That separation is load-bearing, and it took a broken SSR build to find.
 * Declaring the wrapper in the same module as `export * from "react-dom/client"`
 * makes the name `createRoot` resolve to the *local* binding, so a bundler
 * rewrites the real module's export to the local one and emits
 * `createSyncFirstRoot(createRoot, …)` — a temporal-dead-zone error at module
 * evaluation. Re-exporting from a separate module keeps the two bindings in
 * different scopes, so nothing can be confused.
 */
function buildShim(wrapperId: string): string {
  return [
    `export * from ${JSON.stringify(wrapperId)};`,
    `export { __tkCreateRoot as createRoot } from ${JSON.stringify(wrapperId)};`,
  ].join("\n");
}

/**
 * Builds the wrapper module: the only place that imports the real
 * `react-dom/client`, and the only place with a local `createRoot`.
 *
 * Ids are resolved absolute — importing the bare specifier would be re-aliased
 * by this same plugin and recurse.
 */
function buildWrapper(clientId: string, reactDomId: string, coreId: string): string {
  return [
    `import { createRoot as __tkRealCreateRoot } from ${JSON.stringify(clientId)};`,
    `import { flushSync as __tkFlushSync } from ${JSON.stringify(reactDomId)};`,
    `import { createSyncFirstRoot as __tkWrap } from ${JSON.stringify(coreId)};`,
    // `onlyFirstRoot` keeps the flush out of React's commit phase: libraries
    // legitimately call `createRoot` from an effect (Theme Kit's own
    // `ThemeScrollbar` does, once per arrow), and flushing there makes React log
    // "flushSync was called from inside a lifecycle method". The application's
    // own root is created at module scope, before anything renders, so it is
    // always the first one.
    `export const __tkCreateRoot = __tkWrap(__tkRealCreateRoot, __tkFlushSync, { onlyFirstRoot: true });`,
  ].join("\n");
}

/** True when a resolved path belongs to a dependency rather than app code. */
function isDependencyPath(id: string | undefined): boolean {
  if (!id) return false;
  return id.replace(/\\/g, "/").includes("/node_modules/");
}

/**
 * Vite plugin that injects the theme bootstrap as a blocking inline script at
 * the top of `index.html`, so the persisted theme is applied before the first
 * paint. Prevents the flash-of-wrong-theme on reload for client-rendered apps.
 *
 * @typeParam T - The theme definition type used by the application.
 * @param options - Build-time options. Optional; the default discovery path
 *   needs none.
 * @returns A Vite plugin, to be added to `plugins`.
 *
 * @example
 * ```ts
 * // vite.config.ts — nothing to configure beyond registering the plugin.
 * import { themeKitVitePlugin } from "@theme-kit/core/vite";
 *
 * export default defineConfig({
 *   plugins: [react(), themeKitVitePlugin()],
 * });
 * ```
 *
 * @remarks
 * **Config discovery.** The plugin looks for the application's
 * `theme.config.ts` in Vite's root (`config.root`, or `process.cwd()` when
 * unset), trying `theme.config.ts`, `.tsx`, `.mts`, `.mjs`, `.js` and `.cjs` in
 * that order. The file must have a default export — the object
 * {@link defineThemeKitConfig} returns. Discovery goes through Vite's own
 * `loadConfigFromFile`, so a TypeScript config resolves its imports exactly as
 * `vite.config.ts` does.
 *
 * **What it injects.** Two things, both derived from that one configuration:
 * the blocking bootstrap script (`head-prepend`, `enforce: "pre"`) and, when
 * `scrollbar` is enabled, the pre-paint scrollbar CSS. The bootstrap payload is
 * the {@link ThemeBootstrapConfig} projection of the config — the registry, the
 * fallback theme, the initial mode/family, the storage key and the prefix. It is
 * also published to the browser as `window.__THEME_KIT_CONFIG__`, which is what
 * lets the provider take no theme props.
 *
 * **Development.** `transformIndexHtml` runs on every dev page load, so the
 * injected script is always current for the running process. The *discovered
 * config* is resolved once and memoized, so editing `theme.config.ts` needs a
 * dev-server restart; editing `vite.config.ts` restarts Vite anyway, so the
 * plugin's own options do not.
 *
 * **Production.** The script is injected into the generated HTML at build time
 * and runs before the application bundle. It is not emitted as a separate chunk.
 *
 * **Limitations.** The plugin does not inspect provider props — Vite runs in the
 * build pipeline and props are runtime state, so the two sides share the
 * project-level config instead. It does not serve SSR HTML: frameworks that
 * render on the server (Next.js, Nuxt, Remix, Astro) have their own packages,
 * which emit the same bootstrap from the server. If the config cannot be
 * discovered, the plugin warns and falls back to the built-in themes rather than
 * failing the build.
 *
 * @see {@link ThemeKitVitePluginOptions}
 */
export function themeKitVitePlugin<T extends ThemeDefinition>(
  options: ThemeKitVitePluginOptions<T> = {},
): ThemeKitVitePlugin {
  const name = "theme-kit:vite";
  // The element `ssrEntry` fills. Vite's own template ships exactly
  // `<div id="root"></div>`, and the dev prerender only fires when that literal
  // is present — a different container simply keeps today's behaviour rather
  // than guessing where the markup belongs.
  const emptyContainer = `<div id="${options.ssrContainer ?? "root"}"></div>`;

  let script: string | null = null;
  let scrollbarScript: string | null = null;

  // One configuration, two consumers. When `config` is given it *is* the theme
  // configuration — the same object the provider spreads — and the deprecated
  // inline options are ignored rather than merged, so there is exactly one
  // place a value can come from.
  const themeOptions: ThemeKitThemeConfig<T> | ThemeKitVitePluginOptions<T> =
    options.config && typeof options.config === "object"
      ? options.config
      : (options as ThemeKitVitePluginOptions<T>);

  /**
   * Builds the bootstrap script.
   *
   * @param resolved - The application configuration discovered (or passed) at
   *   build time. When present it *is* the configuration — the deprecated inline
   *   options are only consulted when the app has none, so there is still one
   *   source per value.
   */
  function getScript(resolved: ThemeKitConfig<ThemeDefinition> | null): string {
    if (script === null) {
      const source = resolved
        ? toBootstrapConfig(resolved)
        : (themeOptions as ThemeKitThemeConfig<T>);
      const themes = source.themes;
      if (!themes?.length) {
        throw new Error(
          "[theme-kit] themeKitVitePlugin needs the theme registry: add a " +
            "`theme.config.ts` at the project root, or pass `config` — the object " +
            "`defineThemeKitConfig` returns (or a path to it). The deprecated " +
            "inline `themes` option still works.",
        );
      }
      // Spread with `themes` pinned: the guard above narrows it for the runtime
      // but not for the type, since the deprecated shape has it optional.
      script = createThemeBootstrapScript({ ...source, themes });
    }
    return script;
  }

  function getScrollbarScript(): string | null {
    if (options.scrollbar === undefined || options.scrollbar === false) {
      return null;
    }
    if (scrollbarScript === null) {
      scrollbarScript = createPrePaintScrollbarScript(
        options.scrollbar === true
          ? {}
          : options.scrollbar,
      );
    }
    return scrollbarScript;
  }

  // The shim exists to fix a *browser* first paint, so it must never apply to
  // an SSR build. There it can do no good — nothing is painted — and it breaks
  // one: `@theme-kit/react` imports `react-dom/client`, so an SSR bundle would
  // pull the shim in and evaluate it in Node.
  let isSsrBuild = false;
  let projectRoot = "";

  /** Conventional config filenames, in resolution order. */
  const CONFIG_FILES = [
    "theme.config.ts",
    "theme.config.tsx",
    "theme.config.mts",
    "theme.config.mjs",
    "theme.config.js",
    "theme.config.cjs",
  ];

  let appConfig: ThemeKitConfig<ThemeDefinition> | null | undefined;

  /**
  /**
   * Resolves the application configuration once.
   *
   * `config` may be the object itself or a path to it; when neither is given the
   * conventional `theme.config.*` at the project root is used.
   *
   * @returns The configuration, or `null` when the app has none.
   *
   * @remarks
   * Memoized for the lifetime of the Vite process. Editing `theme.config.ts`
   * during `vite dev` therefore does not re-derive the bootstrap — restart the
   * dev server. Vite restarts on a `vite.config.ts` change, which is why the
   * plugin's own options do take effect immediately.
   */
  async function resolveAppConfig(): Promise<ThemeKitConfig<ThemeDefinition> | null> {
    if (appConfig !== undefined) return appConfig;

    if (options.config && typeof options.config === "object") {
      appConfig = options.config as ThemeKitConfig<ThemeDefinition>;
      return appConfig;
    }

    appConfig = (await loadThemeKitConfig<ThemeDefinition>(
      projectRoot,
      typeof options.config === "string" ? options.config : undefined,
    )) as ThemeKitConfig<ThemeDefinition> | null;
    return appConfig;
  }

  // Kept only so the dev server can prerender (see `ssrEntry`). Absent in a
  // build, which is how `transformIndexHtml` tells the two apart.
  let devServer: {
    ssrLoadModule(id: string): Promise<Record<string, unknown>>;
    pluginContainer?: {
      resolveId(
        id: string,
        importer?: string,
        options?: { skipSelf?: boolean },
      ): Promise<{ id: string } | null>;
    };
  } | null = null;

  return {
    name,
    enforce: "pre",

    configResolved(config: {
      build?: { ssr?: unknown };
      root?: string;
      command?: string;
      mode?: string;
    }) {
      isSsrBuild = Boolean(config.build?.ssr);
      projectRoot = config.root ?? process.cwd();
    },

    configureServer(server: unknown) {
      devServer = server as typeof devServer;
    },

    // --- synchronous first render ------------------------------------------
    // `react-dom/client` is resolved to a shim so the app does not have to call
    // `flushSync` (or use `createThemeRoot`) to avoid the empty-root frame. The
    // alias is applied here rather than via `resolve.alias` because a plugin
    // cannot add config from inside itself, and `resolveId` with `enforce: "pre"`
    // runs first. `skipSelf` below is what stops the shim's own import of the
    // real module from being re-aliased.
    ...(options.syncFirstRender === false
      ? {}
      : {
          resolveId(source: string, importer: string | undefined, resolveOptions?: unknown) {
            if (isSsrBuild) return null;

            const internal =
              (resolveOptions as { custom?: { themeKitInternal?: boolean } } | undefined)
                ?.custom?.themeKitInternal === true;

            // Our own resolution of the real module (see `load`). `skipSelf`
            // does not skip this plugin when resolution is initiated from `load`
            // in dev, and the call has no importer to key off — so the caller
            // marks itself instead. Without this the wrapper imports the shim,
            // which imports the wrapper: an unresolvable cycle that Vite reports
            // as "Failed to resolve import virtual:theme-kit/react-dom-client"
            // and then as an internal server error.
            if (internal) return null;

            // The shim re-exports from the wrapper. This specifier is emitted by
            // this plugin and never by the app, so resolve it unconditionally —
            // before the self-guard below, which would otherwise reject it.
            if (source === REACT_DOM_CLIENT_WRAPPER_ID) {
              return RESOLVED_REACT_DOM_CLIENT_WRAPPER_ID;
            }

            if (source !== "react-dom/client") return null;

            // Never alias our own modules' import of the *real* module. The
            // wrapper imports it, and `skipSelf` does not skip this plugin when
            // resolution is initiated from `load` — so in dev the wrapper ended
            // up importing the shim, which imports the wrapper, and Vite
            // reported "Failed to resolve import virtual:theme-kit/...".
            // (Rollup's build-time `skipSelf` does behave, which is why only the
            // dev server broke.)
            if (
              importer === RESOLVED_REACT_DOM_CLIENT_ID ||
              importer === RESOLVED_REACT_DOM_CLIENT_WRAPPER_ID
            ) {
              return null;
            }

            // Application code only. A dependency's root is not the app's first
            // paint, and silently changing how another library mounts its tree
            // is not this plugin's business — so a `createRoot` imported from
            // inside node_modules resolves to the real module, untouched.
            if (isDependencyPath(importer)) return null;

            return RESOLVED_REACT_DOM_CLIENT_ID;
          },
          async load(this: {
            resolve(
              source: string,
              importer?: string,
              options?: { skipSelf?: boolean },
            ): Promise<{ id: string } | null>;
          }, id: string) {
            if (
              id !== RESOLVED_REACT_DOM_CLIENT_ID &&
              id !== RESOLVED_REACT_DOM_CLIENT_WRAPPER_ID
            ) {
              return null;
            }
            const internal = { custom: { themeKitInternal: true } };
            const [client, reactDom, core] = await Promise.all([
              this.resolve("react-dom/client", undefined, { skipSelf: true, ...internal }),
              this.resolve("react-dom", undefined, { skipSelf: true, ...internal }),
              this.resolve("@theme-kit/core", undefined, { skipSelf: true, ...internal }),
            ]);
            if (!client || !reactDom || !core) {
              // React (or Theme Kit itself) is not resolvable here. Fall back to
              // the real module rather than failing the build: the shim only
              // exists to fix a React artifact.
              return id === RESOLVED_REACT_DOM_CLIENT_ID
                ? `export * from "react-dom/client";`
                : `export { createRoot } from "react-dom/client";`;
            }
            return id === RESOLVED_REACT_DOM_CLIENT_ID
              ? buildShim(REACT_DOM_CLIENT_WRAPPER_ID)
              : buildWrapper(client.id, reactDom.id, core.id);
          },
        }),

    async transformIndexHtml(html: string) {
      // One configuration, transported to the runtime. The provider reads this
      // global instead of taking the same values again as props, so there is
      // nothing for an application to keep in sync.
      const resolved = await resolveAppConfig();
      // Return the plain `HtmlTagDescriptor[]` form of `transformIndexHtml`,
      // which is valid across Vite 4–8. (The old `{ tags, order }` object form
      // was dropped in Vite 6, where the object result requires `html`.)
      const tags: ThemeKitViteInjectedTag[] = [
        {
          tag: "script",
          attrs: { id: "theme-kit-bootstrap" },
          children: getScript(resolved),
          injectTo: "head-prepend",
        },
      ];
      const scrollbar = getScrollbarScript();
      if (scrollbar) {
        tags.push({
          tag: "script",
          attrs: { id: "tk-scrollbar-bootstrap" },
          children: scrollbar,
          injectTo: "head-prepend",
        });
      }

      if (resolved) {
        // Only the serializable projection travels: themes are data, but a config
        // may also carry plugins and adapters, which are functions and cannot be
        // expressed in a global. Those stay provider props.
        tags.push({
          tag: "script",
          attrs: { id: "theme-kit-config" },
          children:
            "window.__THEME_KIT_CONFIG__=" +
            JSON.stringify(toBootstrapConfig(resolved)).replace(/</g, "\\u003c") +
            ";",
          injectTo: "head-prepend",
        });
      }

      if (resolved) {
        // Only the serializable projection travels: themes are data, but a config
        // may also carry plugins and adapters, which are functions and cannot be
        // expressed in a global. Those stay provider props.
        tags.push({
          tag: "script",
          attrs: { id: "theme-kit-config" },
          children:
            "window.__THEME_KIT_CONFIG__=" +
            JSON.stringify(toBootstrapConfig(resolved)).replace(/</g, "\u003c") +
            ";",
          injectTo: "head-prepend",
        });
      }

      // Bootstrap readouts, at the END of the body: elements marked
      // `data-tk-readout` get the value the pre-paint script resolved. Without
      // it, a prerendered readout shows whatever theme the prerender used (the
      // default) and only corrects when the app's JavaScript lands — which reads
      // as the UI "fluctuating" on reload, for as long as the bundle takes.
      tags.push({
        tag: "script",
        attrs: { id: "theme-kit-readouts" },
        children: createThemeReadoutScript(),
        injectTo: "body",
      });

      // Dev only: make Theme Kit's stylesheet render-blocking.
      //
      // Vite injects CSS through JavaScript in dev, so any server-rendered or
      // prerendered markup paints *unstyled* until that JS runs — a one-frame
      // flash of unstyled content. A real `<link>` is render-blocking, so the
      // first paint is already styled. A build is unaffected: Vite emits the
      // stylesheet as a `<link>` itself.
      if (devServer?.pluginContainer) {
        try {
          const css = await devServer.pluginContainer.resolveId(
            "@theme-kit/core/scrollbar.css",
            undefined,
            { skipSelf: true },
          );
          if (css) {
            tags.push({
              tag: "link",
              attrs: {
                rel: "stylesheet",
                // `?direct` is required: Vite's dev server transforms a `.css`
                // request into a JS module (`__vite__updateStyle(...)`), which a
                // `<link rel="stylesheet">` is not allowed to use — the browser
                // refuses it. `?direct` returns the stylesheet itself.
                href: "/@fs/" + css.id.replace(/\\/g, "/") + "?direct",
                "data-theme-kit": "stylesheet",
              },
              injectTo: "head",
            });
          }
        } catch {
          // Not installed, or not resolvable from here — the app's own import
          // still works, it is just injected later as before.
        }
      }

      // Dev only: prerender `#root`. A build gets this from its own step, but
      // the dev server hands the browser unbundled modules, so the app can be
      // seconds behind the first paint — and `#root` is empty for all of it.
      const ssrEntry =
        options.ssrEntry === null ? null : (options.ssrEntry ?? DEFAULT_SSR_ENTRY);
      if (devServer && ssrEntry && html.includes(emptyContainer)) {
        try {
          const mod = await devServer.ssrLoadModule(ssrEntry);
          const render = mod.render;
          if (typeof render === "function") {
            const markup = (render as () => string)();
            return {
              html: html.replace(
                emptyContainer,
                `<div id="${options.ssrContainer ?? "root"}">${markup}</div>`,
              ),
              tags,
            };
          }
        } catch {
          // A failing prerender must not take the dev server down: fall back to
          // the empty root and let the client render it, exactly as before.
        }
      }

      return tags;
    },
  };
}
