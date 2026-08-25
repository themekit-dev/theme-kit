import {
  getThemeFamily,
  getThemeMode,
  resolveTheme,
  type ThemeDefinition,
} from "../model";
import type { ThemeMode } from "../model/theme";
import { themeToCSSVariables } from "../css";
import type { ThemeTransitionOptions } from "../transition";
import {
  cancelThemeAnimation,
  createThemeDiff,
  createTransitionPlan,
  runThemeAnimation,
} from "../animation";
import { registerThemeProperties } from "./dom/transition";

/**
 * A scoped theme selection. Either an exact theme name (or family name), or an
 * explicit family + mode pair. Provided as a `string` for convenience — every
 * framework wrapper accepts it.
 */
export type ScopedThemeSelection =
  | string
  | { name: string }
  | { family: string; mode?: ThemeMode };

export interface ScopedThemeBindingOptions {
  prefix?: string;
  /** Transition applied when the scoped theme changes. When omitted, the change
   *  is applied instantly (the previous behaviour). Pass the owning runtime's
   *  `transition` to inherit the same transition the provider uses. */
  transition?: ThemeTransitionOptions;
  /** Local theme definitions for genuinely isolated components. These are
   *  resolved FIRST, then the parent runtime's themes fall back — no second
   *  runtime is ever created. */
  localThemes?: readonly ThemeDefinition[];
  /** Whether the OS prefers dark (used to resolve `mode: "system"` and the
   *  default light fallback for family-only selections). */
  prefersDark?: boolean;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/**
 * Resolve a scoped selection against a theme list. `themes` should already be
 * the combined source: local themes FIRST, then the parent runtime's registry.
 *
 * Resolution order:
 *  1. exact theme-name match (local wins),
 *  2. a name that matches a family → that family's theme for the mode,
 *  3. explicit family + mode → exact match, else the family's light theme,
 *     else the family's first theme,
 *  4. the first theme in the list as a last-resort fallback.
 *
 * The resolved definition has its `extends` chain merged (like `resolveTheme`)
 * so scoped CSS variables include every inherited token.
 */
export function resolveScopedTheme<T extends ThemeDefinition>(
  themes: readonly T[],
  selection: ScopedThemeSelection,
  prefersDark = false,
): T {
  let name: string | undefined;
  let family: string | undefined;
  let mode: ThemeMode | undefined;

  if (typeof selection === "string") {
    name = selection;
  } else if ("name" in selection) {
    name = selection.name;
  } else {
    family = selection.family;
    mode = selection.mode;
  }

  if (name !== undefined) {
    const exact = themes.find((t) => t.name === name);
    if (exact) {
      return resolveTheme(themes as unknown as readonly ThemeDefinition[], String(exact.name)) as T;
    }
    // A bare name that isn't a theme can be a family ("plum" → plum-light).
    family = family ?? name;
  }

  const effectiveMode: ThemeMode =
    mode === "system" ? (prefersDark ? "dark" : "light") : mode ?? "light";

  const familyMatch =
    family !== undefined
      ? themes.filter((t) => getThemeFamily(t) === family)
      : [];

  if (familyMatch.length > 0) {
    const byMode = familyMatch.find((t) => getThemeMode(t) === effectiveMode);
    const selected =
      byMode ??
      familyMatch.find((t) => getThemeMode(t) === "light") ??
      familyMatch[0];
    if (selected) {
      return resolveTheme(themes as unknown as readonly ThemeDefinition[], String(selected.name)) as T;
    }
  }

  const first = themes[0];
  if (!first) {
    throw new Error("At least one theme must be provided to a ThemeScope.");
  }
  return resolveTheme(themes as unknown as readonly ThemeDefinition[], String(first.name)) as T;
}

/** Mirror the scoped binding's aliases (the `--color-*` / `--radius-*` tokens
 *  Tailwind-style utilities resolve against) so styling utilities on scoped
 *  elements use the scoped theme's values, not the page theme's. */
export function scopeToCSSVariables(
  themeVars: Record<string, string>,
  prefix = "theme-",
): Record<string, string> {
  const aliasVars: Record<string, string> = {};
  for (const [key, value] of Object.entries(themeVars)) {
    if (key.startsWith(`--${prefix}color-`)) {
      const colorKey = key.replace(`--${prefix}color-`, "");
      const kebabKey = colorKey
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase();
      aliasVars[`--color-${kebabKey}`] = value;
    } else if (key.startsWith(`--${prefix}radius-`)) {
      const radiusKey = key.replace(`--${prefix}radius-`, "");
      aliasVars[`--radius-${radiusKey}`] = value;
    }
  }
  return aliasVars;
}

export interface ScopedThemePrePaintOptions {
  prefix?: string;
  /** CSS selector targeting the scope element (e.g.
   *  `[data-theme-kit-scope="…"]`). Only used by the `@media` override. */
  selector?: string;
}

export interface ScopedThemePrePaint {
  /** True when the scope's resolved theme depends on the OS scheme (its
   *  selection is a family / boundary following a `system` mode, so resolving
   *  with and without `prefers-color-scheme: dark` picks a different theme).
   *  These scopes need the `@media` CSS block to render correctly at first
   *  paint — the server can't know the OS preference yet. */
  systemBased: boolean;
  /** The default (light) scoped variables, including the `--color-*` /
   *  `--radius-*` aliases. When `systemBased`, these are the SSR/fallback
   *  values and the element should NOT carry them inline (the media-query
   *  override would lose to inline styles); when not, they become the
   *  element's inline style. */
  lightVariables: Record<string, string>;
  /** `[selector] { light }` + `@media (prefers-color-scheme: dark) { [selector]
   *  { dark } }`, or `null` when the scope isn't OS-dependent. Emit this into
   *  the rendered markup so the first paint already shows the correct theme. */
  css: string | null;
  /** The default resolved theme name (for `data-theme`-style attributes). */
  name: string;
  /** Whether the default resolved theme is dark. */
  isDark: boolean;
}

function cssRules(variables: Record<string, string>): string {
  return Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
}

/**
 * Resolve everything a scope needs for its FIRST PAINT, generically from its
 * theme data (no hardcoded colors — any user's scoped themes produce the same
 * result). When the selection is OS-dependent (a `system` mode, or a family /
 * boundary scope currently following a system selection), it returns a
 * `@media (prefers-color-scheme: dark)` CSS block so the scoped region renders
 * light OR dark correctly before hydration, with the live binding taking over
 * through its own inline variables afterwards.
 */
export function resolveScopedThemePrePaint<T extends ThemeDefinition>(
  themes: readonly T[],
  selection: ScopedThemeSelection,
  options: ScopedThemePrePaintOptions = {},
): ScopedThemePrePaint {
  const prefix = options.prefix ?? "theme-";

  const lightTheme = resolveScopedTheme<T>(themes, selection, false);
  const darkTheme = resolveScopedTheme<T>(themes, selection, true);

  const systemBased = String(lightTheme.name) !== String(darkTheme.name);

  const lightVars = themeToCSSVariables(lightTheme, { prefix });
  const lightVariables = {
    ...lightVars,
    ...scopeToCSSVariables(lightVars, prefix),
  };

  const base = {
    lightVariables,
    name: String(lightTheme.name),
    isDark: getThemeMode(lightTheme) === "dark",
  };

  if (!systemBased) {
    return { ...base, systemBased: false, css: null };
  }

  const darkVars = themeToCSSVariables(darkTheme, { prefix });
  const darkVariables = {
    ...darkVars,
    ...scopeToCSSVariables(darkVars, prefix),
  };

  const selector = options.selector ?? "[data-theme-kit-scope]";
  const css =
    `${selector} {\n${cssRules(lightVariables)}\n}\n` +
    `@media (prefers-color-scheme: dark) {\n${selector} {\n${cssRules(darkVariables)}\n}\n}`;

  return { ...base, systemBased: true, css };
}

/**
 * Merge a scope's transition over its parent runtime's transition.
 *
 * The inheritance model is `ThemeProvider transition → ThemeScope → inherited
 * defaults → local overrides`:
 *  - `local === undefined` → inherit the parent's configuration unchanged,
 *  - `local === true` → inherit the parent's configuration unchanged,
 *  - `local === false` → transitions disabled for this scope only,
 *  - `local` object → merged over the parent's (local keys win).
 *
 * Frameworks use this so `<ThemeScope transition={{ duration: 200 }}>` flips
 * just the duration without the user having to repeat the provider's easing /
 * preset.
 */
export function resolveScopeTransition(
  parent: ThemeTransitionOptions | undefined,
  local: boolean | ThemeTransitionOptions | undefined,
): ThemeTransitionOptions | undefined {
  if (local === undefined || local === true) {
    return parent;
  }
  if (local === false) {
    return { enabled: false };
  }
  return { ...parent, ...local };
}

export function createScopedThemeBinding<T extends ThemeDefinition>(
  themes: readonly T[],
  target: HTMLElement,
  selection: ScopedThemeSelection,
  options: ScopedThemeBindingOptions = {},
) {
  const prefix = options.prefix ?? "theme-";
  let baseThemes: readonly ThemeDefinition[] = [
    ...(options.localThemes ?? []),
    ...themes,
  ];
  let transition = options.transition;
  let prefersDark = options.prefersDark ?? systemPrefersDark();
  let currentSelection: ScopedThemeSelection = selection;
  // Previous applied variables (value map) so we can diff and animate changes.
  let appliedVariables = new Map<string, string>();
  let currentTheme: T;

  function updateStateAttributes(theme: T) {
    const isDark = getThemeMode(theme) === "dark";
    target.classList.toggle("dark", isDark);
    target.setAttribute("data-theme", String(theme.name));
    target.setAttribute("data-mode", isDark ? "dark" : "light");
  }

  function writeVariables(variables: Record<string, string>) {
    const next = new Map<string, string>();
    for (const [variable, value] of Object.entries(variables)) {
      target.style.setProperty(variable, value);
      next.set(variable, value);

      if (variable.startsWith(`--${prefix}color-`)) {
        const colorKey = variable.replace(`--${prefix}color-`, "");
        const kebabKey = colorKey
          .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
          .toLowerCase();
        const twVar = `--color-${kebabKey}`;
        target.style.setProperty(twVar, value);
        next.set(twVar, value);
      } else if (variable.startsWith(`--${prefix}radius-`)) {
        const radiusKey = variable.replace(`--${prefix}radius-`, "");
        const twVar = `--radius-${radiusKey}`;
        target.style.setProperty(twVar, value);
        next.set(twVar, value);
      }
    }

    // Clear any previously-applied variable no longer present in the new theme.
    for (const variable of appliedVariables.keys()) {
      if (!next.has(variable)) {
        target.style.removeProperty(variable);
      }
    }

    appliedVariables = next;
  }

  function apply(selectionValue: ScopedThemeSelection, animate: boolean) {
    const theme = resolveScopedTheme<T>(
      baseThemes as readonly T[],
      selectionValue,
      prefersDark,
    );
    currentTheme = theme;
    currentSelection = selectionValue;
    const variables = themeToCSSVariables(theme, { prefix });

    if (
      animate &&
      transition &&
      appliedVariables.size > 0 &&
      typeof document !== "undefined" &&
      !prefersReducedMotion()
    ) {
      const plan = createTransitionPlan(
        createThemeDiff(appliedVariables, variables, prefix),
        transition,
        { reducedMotion: prefersReducedMotion() },
      );
      if (plan) {
        runThemeAnimation({
          target,
          plan,
          swap: () => {
            writeVariables(variables);
            updateStateAttributes(theme);
          },
        });
      } else {
        writeVariables(variables);
        updateStateAttributes(theme);
      }
    } else {
      // First apply registers the @property definitions that make the color
      // variables interpolate, so later swaps animate on the scope element.
      registerThemeProperties(target, variables, prefix);
      writeVariables(variables);
      updateStateAttributes(theme);
    }
  }

  apply(selection, false);

  return {
    /** Apply a new scoped selection (theme name / family / family+mode),
     *  animating the diff through the configured transition. */
    update(nextSelection: ScopedThemeSelection) {
      apply(nextSelection, true);
    },
    /** The currently applied, extends-resolved theme definition. */
    getTheme(): T {
      return currentTheme;
    },
    /** Update the transition config (e.g. in response to a prop change)
     *  without recreating the binding. */
    setTransition(nextTransition: ThemeTransitionOptions | undefined) {
      transition = nextTransition;
    },
    /** Update the local theme definitions (e.g. a late-loaded pack). */
    setLocalThemes(localThemes: readonly ThemeDefinition[] | undefined) {
      baseThemes = [...(localThemes ?? []), ...themes];
      apply(currentSelection, false);
    },
    destroy() {
      cancelThemeAnimation(target);
      for (const variable of appliedVariables.keys()) {
        target.style.removeProperty(variable);
      }
      appliedVariables.clear();
      target.removeAttribute("data-theme");
      target.removeAttribute("data-mode");
      target.classList.remove("dark");
    },
  };
}
