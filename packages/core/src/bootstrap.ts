import type { ThemeDefinition, ThemeMode } from "./model/theme";
import {
  getThemeFamilies,
  getThemeFamily,
  resolveTheme,
  type ThemeSelectionState,
} from "./model";
import { resolveInitialTheme, resolveSelectionTheme } from "./resolver";
import { themeToCSSVariables, type ThemeToCSSVariablesOptions } from "./css";

/**
 * Options for {@link buildThemeCssMap}.
 */
export interface BuildThemeCssMapOptions {
  /**
   * CSS custom property prefix applied to every emitted variable.
   * @defaultValue `"theme-"`
   */
  prefix?: string;
}

function cssOptionsFrom(prefix?: string): ThemeToCSSVariablesOptions {
  return prefix !== undefined ? { prefix } : {};
}

/**
 * Build a lookup map of theme keys to flat CSS variables.
 *
 * Each theme is registered twice:
 * - under its own `name` (e.g. `"sunrise-light"`)
 * - under a `family:mode` key (e.g. `"sunrise:light"`) so that a persisted
 *   family + effective mode can be resolved without knowing theme names.
 * @see {@link createThemeBootstrapScript}
 */
export function buildThemeCssMap<T extends ThemeDefinition>(
  themes: readonly T[],
  options: BuildThemeCssMapOptions = {},
): Record<string, Record<string, string>> {
  const cssOptions = cssOptionsFrom(options.prefix);

  const map: Record<string, Record<string, string>> = {};

  for (const theme of themes) {
    const vars = themeToCSSVariables(theme, cssOptions);
    map[String(theme.name)] = vars;

    if (theme.meta?.family && theme.meta?.mode) {
      map[`${theme.meta.family}:${theme.meta.mode}`] = vars;
    }
  }

  return map;
}

/**
 * Options for {@link createThemeBootstrapScript}.
 */
export interface ThemeBootstrapScriptOptions<T extends ThemeDefinition> {
  /** The theme definitions to embed in the generated script. */
  themes: readonly T[];
  /** Theme name to fall back to when no persisted selection exists. */
  defaultTheme?: T["name"];
  /**
   * Initial mode used when no persisted selection exists.
   *
   * @defaultValue The fallback theme's own mode — i.e. the mode
   * `resolveInitialTheme` derives from `defaultTheme` (or from `themes[0]` when
   * `defaultTheme` is omitted). `"system"` is used only when you ask for it.
   *
   * @remarks
   * The default is deliberately *derived* rather than fixed, so the script and
   * the client runtime resolve the same mode by construction. Passing a value
   * here that disagrees with the runtime's `initialMode` reintroduces the
   * wrong-theme flash the script exists to prevent.
   */
  initialMode?: ThemeMode;
  /** Initial theme family used when no persisted selection exists. */
  initialFamily?: string;
  /** localStorage key holding the persisted theme selection. Defaults to `"theme-selection"`. */
  storageKey?: string;
  /** CSS custom property prefix. Defaults to `"theme-"`. */
  prefix?: string;
}

/**
 * Generate an inline, blocking script that applies the persisted theme before
 * first paint, preventing a flash of the wrong (or missing) theme on reload.
 *
 * The script reads the saved selection from localStorage, resolves the theme
 * for the effective mode (`"system"` is resolved against `prefers-color-scheme`),
 * and writes the CSS variables plus DOM effects onto `document.documentElement`.
 * @see {@link buildThemeCssMap}
 * @see {@link createPrePaintScrollbarScript}
 */
export function createThemeBootstrapScript<T extends ThemeDefinition>(
  options: ThemeBootstrapScriptOptions<T>,
): string {
  const {
    themes,
    defaultTheme,
    initialMode,
    initialFamily,
    storageKey = "theme-selection",
    prefix,
  } = options;

  const plan = buildBootstrapPlan(themes, {
    ...(prefix !== undefined ? { prefix } : {}),
    ...(defaultTheme !== undefined ? { defaultTheme } : {}),
    ...(initialMode !== undefined ? { initialMode } : {}),
    ...(initialFamily !== undefined ? { initialFamily } : {}),
  });

  return serializeThemeBootstrapScript(plan, { kind: "storage", key: storageKey });
}

/**
 * Render a CSS variable record as `--name: value;` declaration lines.
 *
 * @param variables - The CSS variable record to render.
 * @returns The declaration block body (no braces).
 */
function cssRules(variables: Record<string, string>): string {
  return Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
}

/**
 * Generate a `@media (prefers-color-scheme: dark)` CSS block carrying the given
 * variables.
 *
 * @remarks
 * This is a **pre-script** fallback only, and it cannot beat an inline `style`
 * on the same element: inline declarations outrank every stylesheet rule
 * regardless of specificity. So it is only safe when nothing inlines the light
 * variables — do not pair it with a server render that writes them onto
 * `<html>`, or an OS-dark visitor keeps the light ones and this block is inert.
 * When the resolved mode is `"system"`, use {@link systemModeCSSTemplate}
 * instead: it emits both schemes and expects no inline variables.
 *
 * @param variables - The CSS variables to emit under the dark media query.
 * @returns A `@media (prefers-color-scheme: dark)` block targeting `:root`.
 *
 * @see {@link systemModeCSSTemplate}
 */
export function darkModeCSSTemplate(
  variables: Record<string, string>,
): string {
  return `@media (prefers-color-scheme: dark) {:root {\n${cssRules(variables)}\n}}`;
}

/**
 * Generate the stylesheet that resolves a `"system"` selection with CSS alone —
 * no script and no inline style.
 *
 * @remarks
 * Use this **instead of** inlining the resolved variables whenever the mode is
 * `"system"`. The two cannot be combined: an inline `style` on `<html>`
 * outranks any stylesheet rule, so a page that inlines the light variables and
 * also emits a dark media block paints light whatever the OS prefers. Measured
 * on a production build with page scripts blocked and the OS set to dark, that
 * combination painted `rgb(248, 250, 252)` (light); emitting both media blocks
 * and no inline variables painted `rgb(2, 6, 23)`.
 *
 * `prefers-color-scheme: light` also matches when the visitor has expressed no
 * preference — `light` is the specified default — so the light block doubles as
 * the no-preference branch.
 *
 * @param light - The light theme's CSS variables.
 * @param dark - The dark theme's CSS variables.
 * @returns Two media blocks, one per scheme, both targeting `:root`.
 *
 * @see {@link darkModeCSSTemplate}
 */
export function systemModeCSSTemplate(
  light: Record<string, string>,
  dark: Record<string, string>,
): string {
  return [
    `@media (prefers-color-scheme: dark) {:root {\n${cssRules(dark)}\n}}`,
    `@media (prefers-color-scheme: light) {:root {\n${cssRules(light)}\n}}`,
  ].join("");
}

/** @internal — shared zero-flash implementation detail; not part of the public
 *  API and not shown in the public documentation. */
export interface ThemeBootstrapPlan<T extends ThemeDefinition = ThemeDefinition> {
  /** Theme keys → flat CSS variables (names, `family:mode`, `__default-*`). */
  map: Record<string, Record<string, string>>;
  /** Theme keys → theme name (used to write `data-theme`). */
  names: Record<string, string>;
  /** Mode used when no persisted selection is present. */
  fallbackMode: ThemeMode;
  /**
   * Family used when no persisted family is present.
   *
   * `buildBootstrapPlan` always resolves this to a real family — it is never
   * null and never the unknown family that was requested. The `| null` is for
   * callers that assemble a plan by hand (the Astro integration does, because
   * its theme map arrives pre-built from the Vite plugin).
   */
  fallbackFamily: string | null;
  /**
   * Every family registered in the plan's theme set, in registration order.
   *
   * The inline script validates a persisted family against this list. Without
   * it a stale cookie or `localStorage` entry — one written before the registry
   * changed its family set — survives into `data-theme-selection-family` and
   * into every `data-tk-readout="family"`, naming a family that is not applied
   * while the resolved theme falls back to `__default-*`. The server, which
   * normalises through `resolveSelection`, then disagrees with the browser about
   * the same page, and the readout visibly corrects on load.
   *
   * Optional so a hand-assembled plan stays valid; when absent the script cannot
   * confirm a persisted family and uses `fallbackFamily` instead.
   */
  families?: string[];
  /** The fallback family's resolved light theme (when themes are available). */
  defaultLight?: T;
  /** The fallback family's resolved dark theme (when themes are available). */
  defaultDark?: T;
}

/** @internal — reads the persisted selection from storage (no server
 *  boundary, so no fingerprint is applied). */
export interface ThemeBootstrapStorageSource {
  kind: "storage";
  /** localStorage key holding `{ mode, family }`. */
  key: string;
}

/**
 * Fingerprints a theme registry so a persisted selection from an older build —
 * different themes, or a different `defaultTheme` — is ignored rather than
 * applied against themes it was never valid for.
 *
 * @param themes - The theme registry to fingerprint.
 * @param defaultTheme - The fallback theme name. Included in the fingerprint,
 * so changing it invalidates previously persisted selections.
 * @returns A stable fingerprint string, or `""` when `themes` is empty.
 *
 * @remarks
 * The result is written to the `theme-fingerprint` cookie and compared on the
 * next request, so it is part of the **stable cookie contract** documented in
 * `VERSIONING.md` — changing the format invalidates every visitor's persisted
 * selection on their next visit.
 *
 * It lives here, in core, because four SSR integrations
 * (Next, Nuxt, Astro, Remix) previously each carried a byte-identical private
 * copy. Any edit to one of them would have silently broken cross-framework
 * persistence with nothing to catch it.
 *
 * @see {@link ThemeBootstrapCookieSource}
 * @see {@link buildBootstrapPlan}
 */
export function computeFingerprint(
  themes: readonly ThemeDefinition[],
  defaultTheme?: string,
): string {
  if (!themes.length) return "";
  const names = themes
    .map((theme) => theme.name)
    .sort()
    .join(",");
  return `${defaultTheme ?? ""}|${names}`;
}

/**
 * The state the pre-paint bootstrap published on `<html>`, validated against
 * the theme registry.
 *
 * @typeParam T - The theme definition type used by the application.
 *
 * @see {@link readBootstrapState}
 */
export interface ThemeBootstrapState<T extends ThemeDefinition> {
  /** The resolved theme — the one already painted on `<html>`. */
  theme: T;
  /**
   * The visitor's **selection**. For `"system"` this is still `"system"` — the
   * resolved mode is {@link resolvedMode}, and the two are deliberately
   * distinct so adopting this state cannot downgrade a `"system"` choice.
   */
  selection: ThemeSelectionState;
  /** The concrete mode the bootstrap applied (`"light"` or `"dark"`). */
  resolvedMode: "light" | "dark";
  /** Whether the bootstrap reported completing its DOM write. */
  ready: boolean;
}

/**
 * Reads the pre-paint bootstrap's state back off the DOM, validated against the
 * theme registry.
 *
 * @typeParam T - The theme definition type used by the application.
 * @param themes - The registry the `data-theme` name is validated against.
 * @param target - The element to read from. Defaults to `<html>`.
 * @returns The validated state, or `null` when there is no DOM, no
 *   `data-theme`, or the name is not in the registry.
 *
 * @remarks
 * This is the *read* half of the bootstrap handoff. The blocking script writes
 * `data-theme` (resolved theme), `data-theme-selection-mode` /
 * `data-theme-selection-family` (the selection, which is not recoverable from
 * the resolved theme), `data-theme-ready`, and a
 * `window.__THEME_KIT_BOOTSTRAP__` payload.
 *
 * It exists so a client runtime can **adopt** what was already painted instead
 * of re-deriving it: by the time a client renders, `<html>` is the authority on
 * what the visitor is looking at, and anything that re-resolves can disagree
 * with it. The result is validated against the registry rather than trusted as
 * an arbitrary string, so a stale or hand-written attribute cannot inject a
 * theme that does not exist.
 *
 * @see {@link createThemeBootstrapScript}
 */
export function readBootstrapState<T extends ThemeDefinition>(
  themes: readonly T[],
  target?: Element | null,
): ThemeBootstrapState<T> | null {
  const el =
    target ?? (typeof document !== "undefined" ? document.documentElement : null);
  if (!el || typeof el.getAttribute !== "function") return null;

  const themeName = el.getAttribute("data-theme");
  if (!themeName) return null;

  let theme: T;
  try {
    theme = resolveTheme(themes, themeName as T["name"]) as T;
  } catch {
    // An unknown name means the attribute was written by a different registry
    // (or hand-edited). Adopting it would put the runtime on a theme that is
    // not registered, so refuse and let the caller fall back to resolving.
    return null;
  }
  if (!theme) return null;

  const selectionMode = el.getAttribute("data-theme-selection-mode");
  const selectionFamily = el.getAttribute("data-theme-selection-family");
  const meta = (theme.meta ?? {}) as { family?: string; mode?: string };

  return {
    theme,
    selection: {
      mode:
        selectionMode === "light" ||
        selectionMode === "dark" ||
        selectionMode === "system"
          ? (selectionMode as ThemeMode)
          : ((meta.mode as ThemeMode) ?? "system"),
      family: selectionFamily ?? meta.family ?? getThemeFamily(theme),
    },
    resolvedMode: meta.mode === "dark" ? "dark" : "light",
    ready: el.getAttribute("data-theme-ready") === "true",
  };
}

/**
 * Builds the inline script that fills in **bootstrap readouts**: elements that
 * display a theme-derived value the server cannot know.
 *
 * @returns The script body to emit at the **end of `<body>`**, after the
 *   elements it patches exist.
 *
 * @remarks
 * A readout opts in with `data-tk-readout="theme" | "mode" | "family"`, or
 * `data-tk-readout="var:--theme-color-primary"` to display a resolved CSS
 * variable. The script reads the payload the blocking bootstrap published (see
 * {@link readBootstrapState}) — or, for `var:`, the variable the bootstrap
 * already applied to `<html>` — and writes the value into each element's
 * `textContent`.
 *
 * Why this exists: a server-rendered readout can only show the *server's*
 * resolution, and for `"system"` mode that is a fallback the browser overrides
 * before the first paint. The canvas is corrected by the bootstrap, but the text
 * is not — so it settles once after hydration, which is the last visible
 * difference on an otherwise static page.
 *
 * Patching the text before the first paint closes that, but only if the
 * framework then leaves the element alone. In React that means pairing it with
 * `suppressHydrationWarning` on the same element: React renders its own value
 * during hydration, sees the DOM already differs, and — with the attribute —
 * neither warns nor rewrites. The framework's own post-hydration render then
 * produces the live value, which is the same value the script wrote, so nothing
 * moves. Without the suppression React would rewrite the text back to the
 * server's fallback and re-introduce the settle.
 *
 * It is deliberately placed at the end of the body: the blocking script runs in
 * `<head>`, before these elements have been parsed, so it cannot patch them.
 *
 * @see {@link createThemeBootstrapScript}
 * @see {@link readBootstrapState}
 */
export function createThemeReadoutScript(): string {
  return (
    "(function(){try{" +
    "var b=window.__THEME_KIT_BOOTSTRAP__;if(!b)return;" +
    "var els=document.querySelectorAll('[data-tk-readout]');" +
    "for(var i=0;i<els.length;i++){" +
    "var f=els[i].getAttribute('data-tk-readout');" +
    "var v=f==='theme'?b.theme:" +
    "(f==='mode'?(b.selection&&b.selection.mode):" +
    "(f==='family'?(b.selection&&b.selection.family):null));" +
    // `var:<name>` reads a resolved variable. The bootstrap applied the resolved
    // theme's variables to <html> before this script runs, so they are readable
    // here without publishing the whole variable map to the payload.
    "if(v==null&&f&&f.slice(0,4)==='var:'){" +
    "try{v=getComputedStyle(document.documentElement).getPropertyValue(f.slice(4)).trim()||null;}catch(e2){v=null;}" +
    "}" +
    "if(v!=null){els[i].textContent=v;}" +
    "}" +
    "}catch(e){}})()"
  );
}

/** @internal — reads the persisted selection from the SSR cookie contract
 *  (`theme-mode` / `theme-family` / `theme-fingerprint`), rejecting stale
 *  fingerprints. Shared by the Next/Nuxt/Astro/Remix integrations. */
export interface ThemeBootstrapCookieSource {
  kind: "cookies";
  names: { mode: string; family: string; fingerprint: string };
}

/** @internal */
export type ThemeBootstrapSource =
  | ThemeBootstrapStorageSource
  | ThemeBootstrapCookieSource;

/**
 * Builds the shared {@link ThemeBootstrapPlan} for a theme registry: the CSS
 * map, the theme-name lookup and the resolved fallback light/dark themes.
 *
 * @internal — shared zero-flash implementation detail.
 */
export function buildBootstrapPlan<T extends ThemeDefinition>(
  themes: readonly T[],
  options: {
    prefix?: string;
    defaultTheme?: T["name"];
    initialMode?: ThemeMode;
    initialFamily?: string;
  } = {},
): ThemeBootstrapPlan<T> {
  const { prefix, defaultTheme, initialMode, initialFamily } = options;
  const cssOptions = cssOptionsFrom(prefix);

  const resolution = resolveInitialTheme({
    themes,
    ...(defaultTheme !== undefined ? { defaultTheme } : {}),
    ...(initialFamily !== undefined ? { family: initialFamily } : {}),
    ...(initialMode !== undefined ? { mode: initialMode } : {}),
  });
  const defaultFamily = resolution.selection.family;

  // The script's fallback mode is the mode `resolveInitialTheme` just resolved —
  // the very same value the client runtime adopts from its own call to
  // `resolveInitialTheme`. Deriving it rather than hardcoding `"system"` is what
  // keeps the two halves of the zero-flash contract from disagreeing.
  //
  // Hardcoded, the script followed `prefers-color-scheme` while the runtime
  // followed the fallback theme's own mode (`"light"` for a `*-light`
  // `defaultTheme`), so a first-time visitor on a dark OS saw the script's dark
  // paint corrected to light by the runtime — a visible flash. It also meant a
  // `defaultTheme="*-dark"` app flashed in the opposite direction on a light OS.
  //
  // `initialMode` still wins when given (it is what `resolveInitialTheme`
  // resolved), so asking for `"system"` still gets you `"system"`.
  const fallbackMode = resolution.selection.mode;

  const defaultLight = resolveSelectionTheme({
    themes,
    selection: { family: defaultFamily, mode: "light" },
  }).theme;

  // The requested family may be unknown, and a theme may declare no `meta` at
  // all. Resolve dark against the family the light theme *actually* resolved
  // to, read through `getThemeFamily` so that a meta-less theme yields its
  // canonical family instead of leaking the requested one. Without this the
  // dark default can resolve to `themes[0]` — which is a light theme — and the
  // pair stops being coherent.
  const resolvedFamily = getThemeFamily(defaultLight);

  const defaultDark = resolveSelectionTheme({
    themes,
    selection: { family: resolvedFamily, mode: "dark" },
  }).theme;

  const map = buildThemeCssMap(themes, prefix !== undefined ? { prefix } : {});
  map["__default-light"] = themeToCSSVariables(defaultLight, cssOptions);
  map["__default-dark"] = themeToCSSVariables(defaultDark, cssOptions);

  const lightName = String(defaultLight.name);
  const darkName = String(defaultDark.name);

  const names: Record<string, string> = {};
  for (const theme of themes) {
    const themeName = String(theme.name);
    names[themeName] = themeName;
    if (theme.meta?.family && theme.meta?.mode) {
      names[`${theme.meta.family}:${theme.meta.mode}`] = themeName;
    }
  }
  names["__default-light"] = lightName;
  names["__default-dark"] = darkName;

  return {
    map,
    names,
    fallbackMode,
    fallbackFamily: resolvedFamily,
    // The families the inline script may legitimately select, taken from the
    // same registry the CSS map was built from. A family is therefore either in
    // both or in neither, so the script's validation cannot accept a family the
    // map has no variables for.
    families: getThemeFamilies(themes),
    defaultLight,
    defaultDark,
  };
}

/**
 * The script's `family` expression: `fam0` when it names a registered family,
 * the plan's fallback otherwise.
 *
 * @internal — shared zero-flash implementation detail.
 *
 * @remarks
 * `fam0` is whatever the visitor persisted — a cookie or `localStorage` entry,
 * possibly written before the registry changed its family set. Trusting it
 * verbatim would leave `data-theme-selection-family` (and therefore every
 * `data-tk-readout="family"`) naming a family the CSS map has no variables for,
 * while the theme itself resolves to `__default-*`. That is a readout which
 * contradicts the page, and it makes the browser disagree with the server, which
 * normalises through `resolveSelection` — so the text visibly corrects on load.
 *
 * When the plan carries no `families` list (a hand-assembled plan) there is
 * nothing to validate against, so the persisted value is used as before.
 */
function familySelectionExpression(plan: ThemeBootstrapPlan): string {
  const families = JSON.stringify(plan.families ?? null);
  const fallback = JSON.stringify(plan.fallbackFamily ?? null);
  return (
    "var fams=" + families + ";" +
    "var family=fams?(fams.indexOf(fam0)!==-1?fam0:" + fallback + "):(fam0||" + fallback + ");"
  );
}

/** @internal */
function readStorageSelection(
  plan: ThemeBootstrapPlan,
  source: ThemeBootstrapStorageSource,
): string {
  return (
    "var raw=localStorage.getItem(" + JSON.stringify(source.key) + ");" +
    "var sel=null;try{sel=raw?JSON.parse(raw):null;}catch(e){}" +
    "var mode0=sel&&(sel.mode==='light'||sel.mode==='dark'||sel.mode==='system')?sel.mode:null;" +
    "var fam0=sel&&typeof sel.family==='string'?sel.family:null;" +
    "var mode=mode0||" + JSON.stringify(plan.fallbackMode) + ";" +
    familySelectionExpression(plan)
  );
}

/** @internal */
function readCookieSelection(
  plan: ThemeBootstrapPlan,
  source: ThemeBootstrapCookieSource,
  fingerprint: string,
): string {
  const guard = fingerprint
    ? "if(fp&&fp!==" + JSON.stringify(fingerprint) + "){mode0=null;fam0=null;}"
    : "";

  return (
    "function getCookie(n){var m=document.cookie.match(new RegExp('(^|; )'+n+'=([^;]+)'));return m?decodeURIComponent(m[2]):null}" +
    "var mode0=getCookie(" + JSON.stringify(source.names.mode) + ");" +
    "var fam0=getCookie(" + JSON.stringify(source.names.family) + ");" +
    "var fp=getCookie(" + JSON.stringify(source.names.fingerprint) + ");" +
    guard +
    "var hasMode=mode0==='light'||mode0==='dark'||mode0==='system';" +
    "var mode=hasMode?mode0:" + JSON.stringify(plan.fallbackMode) + ";" +
    familySelectionExpression(plan)
  );
}

/**
 * Serializes the single pre-paint applier that reads the persisted selection
 * (storage or cookies) and writes the theme state before first paint: the
 * `.dark` class, `color-scheme`, the `data-theme*` attributes and the CSS
 * variables — the exact contract the client runtime applies.
 *
 * @internal — shared zero-flash implementation detail.
 */
export function serializeThemeBootstrapScript<T extends ThemeDefinition>(
  plan: ThemeBootstrapPlan<T>,
  source: ThemeBootstrapSource,
  options: { fingerprint?: string } = {},
): string {
  const fingerprint = options.fingerprint ?? "";

  const read =
    source.kind === "storage"
      ? readStorageSelection(plan, source)
      : readCookieSelection(plan, source, fingerprint);

  const app =
    "var sysDark=!!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);" +
    "var eff=mode==='dark'||(mode==='system'&&sysDark)?'dark':'light';" +
    "var map=" + JSON.stringify(plan.map) + ";" +
    "var names=" + JSON.stringify(plan.names) + ";" +
    "var key=(family&&map[family+':'+eff])?family+':'+eff:'__default-'+eff;" +
    "if(!map[key]){for(var k in map){if(k.slice(-(eff.length+1))===':'+eff){key=k;break;}}}" +
    "var i=key.indexOf(':');" +
    "var fam=i>=0?key.slice(0,i):" + JSON.stringify(plan.fallbackFamily ?? null) + ";" +
    "var vars=map[key]||map['__default-light'];" +
    "var name=names[key]||names['__default-'+eff]||null;" +
    "var el=document.documentElement;" +
    "if(eff==='dark'){el.classList.add('dark');}else{el.classList.remove('dark');}" +
    "el.style.colorScheme=eff;" +
    "el.setAttribute('data-theme-mode',eff);" +
    "if(fam){el.setAttribute('data-theme-family',fam);}" +
    "if(name){el.setAttribute('data-theme',name);}" +
    // The *selection* — as opposed to the resolved mode above — plus a
    // completion marker and the published handoff payload. `data-theme-mode`
    // and the `dark` class describe the theme that was applied; they cannot
    // recover what the visitor chose, because a `"system"` selection is
    // resolved to `"light"`/`"dark"` before it is written. Without the
    // selection in the DOM, a client that adopted the bootstrap state would
    // silently downgrade `"system"` to a concrete mode.
    "el.setAttribute('data-theme-selection-mode',mode);" +
    "if(family||fam){el.setAttribute('data-theme-selection-family',family||fam);}" +
    "el.setAttribute('data-theme-ready','true');" +
    "try{window.__THEME_KIT_BOOTSTRAP__={theme:name,mode:eff,family:fam,selection:{mode:mode,family:family||fam}};}catch(e2){}" +
    // Readouts are patched from HERE, not only from the end-of-body script.
    // A body-end script is too late: the browser is free to paint while the
    // parser is still working through a large body, so a prerendered readout can
    // be painted with the value the prerender used — visible as the label
    // "fluctuating" on reload. This script runs in <head>, before the body is
    // parsed, so instead of querying once it watches for readouts appearing and
    // patches each one in the same task it is inserted in.
    "var __tkPatch=function(){" +
    "try{var els=document.querySelectorAll('[data-tk-readout]');" +
    "for(var q=0;q<els.length;q++){" +
    "if(els[q].getAttribute('data-tk-patched')==='1'){continue;}" +
    "var f2=els[q].getAttribute('data-tk-readout');" +
    "var v2=f2==='theme'?name:(f2==='mode'?mode:(f2==='family'?(family||fam):null));" +
    "if(v2==null&&f2&&f2.slice(0,4)==='var:'){" +
    "try{v2=getComputedStyle(el).getPropertyValue(f2.slice(4)).trim()||null;}catch(e3){v2=null;}" +
    "}" +
    "if(v2!=null){els[q].textContent=v2;els[q].setAttribute('data-tk-patched','1');}" +
    "}}catch(e4){}};" +
    "try{__tkPatch();" +
    "if(window.MutationObserver&&el){" +
    "new MutationObserver(function(){__tkPatch();}).observe(el,{childList:true,subtree:true});" +
    "}}catch(e5){}" +
    "if(vars){for(var p in vars){el.style.setProperty(p,vars[p]);}}";

  return "(function(){try{" + read + app + "}catch(e){}})()";
}
