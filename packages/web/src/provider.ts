import {
  createThemeRuntime,
  resolveRuntimeOptions,
  getBuiltInThemes,
  type CSSVariablesOptions,
  type DOMBindingOptions,
  type ThemeDefinition,
  type ThemeMode,
  type ThemeRuntime,
  type ThemeScheduleOptions,
  type ThemeTransitionOptions,
} from "@theme-kit/core";
import { setProviderRuntime } from "./utils";
import { CustomElementBase } from "./custom-element-base";

/**
 * Configuration for the `<theme-kit-provider>` custom element, parsed from its
 * attributes.
 */
export interface ThemeKitProviderProps {
  /**
   * Theme definitions. Parsed from the `themes` attribute (JSON). Defaults to
   * the built-in themes when absent or invalid.
   */
  themes?: readonly ThemeDefinition[];
  /**
   * The default theme name. Parsed from the `default-theme` attribute.
   */
  defaultTheme?: string;
  /**
   * Mode used when no selection is persisted. Parsed from the `initial-mode`
   * attribute (`"light" | "dark" | "system"`).
   *
   * Optional: both the runtime and the pre-paint script derive the same fallback
   * mode from `default-theme` by default. Set it only to pin a mode the script
   * would not derive — e.g. `"system"` to follow `prefers-color-scheme` — and
   * give `themeKitVitePlugin` the same `initialMode`.
   */
  initialMode?: ThemeMode;
  /**
   * Family used when no selection is persisted. Parsed from the
   * `initial-family` attribute. Pair it with `initialMode` for the same
   * reason.
   */
  initialFamily?: string;
  /**
   * Sunrise/sunset scheduling options. Parsed from the `scheduled` attribute
   * (JSON).
   */
  scheduled?: ThemeScheduleOptions<ThemeDefinition>;
  /**
   * Transition configuration. Parsed from the `transition` attribute (JSON).
   */
  transition?: boolean | ThemeTransitionOptions;
}

/**
 * Custom element `<theme-kit-provider>` that owns a Theme Kit runtime and
 * applies the active theme to the document.
 *
 * Framework-free (vanilla JS). Creates and destroys its runtime across its
 * lifecycle, applies DOM/CSS variable bindings, and dispatches a bubbling
 * `theme-ready` event once initialized. Observes the `themes`,
 * `default-theme`, `initial-mode`, `initial-family`, `scheduled`, and
 * `transition` attributes.
 *
 * @remarks
 * When an observed attribute changes after initialization, the runtime is
 * destroyed and recreated from the new attributes.
 *
 * @example
 * ```html
 * <theme-kit-provider themes='[{"name":"light"}]' default-theme="light">
 *   ...
 * </theme-kit-provider>
 * ```
 *
 * @see {@link ThemeKitProviderProps}
 * @see {@link defineCustomElements}
 * @see {@link ThemeKitScope}
 * @see {@link ThemeKitToggle}
 * @see {@link ThemeKitSelect}
 */
export class ThemeKitProvider extends CustomElementBase {
  static observedAttributes = [
    "themes",
    "default-theme",
    "initial-mode",
    "initial-family",
    "scheduled",
    "transition",
  ];

  private runtime: ThemeRuntime<ThemeDefinition> | null = null;
  private parsedThemes: readonly ThemeDefinition[] = getBuiltInThemes();
  private parsedDefaultTheme: string | undefined;
  private parsedInitialMode: ThemeMode | undefined;
  private parsedInitialFamily: string | undefined;
  private parsedScheduled: ThemeScheduleOptions<ThemeDefinition> | undefined;
  private parsedTransition: boolean | ThemeTransitionOptions | undefined;

  /** Lifecycle hook: parses attributes and initializes the runtime. */
  connectedCallback() {
    this.parseAttributes();
    this.initRuntime();
  }

  /** Lifecycle hook: destroys the runtime. */
  disconnectedCallback() {
    this.destroyRuntime();
  }

  /** Lifecycle hook: re-initializes the runtime when an observed attribute changes. */
  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ) {
    if (this.runtime) {
      this.destroyRuntime();
      this.parseAttributes();
      this.initRuntime();
    }
  }

  private parseAttributes() {
    const themesAttr = this.getAttribute("themes");
    if (themesAttr) {
      try {
        this.parsedThemes = JSON.parse(themesAttr) as ThemeDefinition[];
      } catch {
        this.parsedThemes = getBuiltInThemes();
      }
    } else {
      this.parsedThemes = getBuiltInThemes();
    }

    this.parsedDefaultTheme = this.getAttribute("default-theme") ?? undefined;

    const initialModeAttr = this.getAttribute("initial-mode");
    this.parsedInitialMode =
      initialModeAttr === "light" ||
      initialModeAttr === "dark" ||
      initialModeAttr === "system"
        ? initialModeAttr
        : undefined;

    this.parsedInitialFamily =
      this.getAttribute("initial-family") ?? undefined;

    const scheduledAttr = this.getAttribute("scheduled");
    if (scheduledAttr) {
      try {
        this.parsedScheduled = JSON.parse(
          scheduledAttr,
        ) as ThemeScheduleOptions<ThemeDefinition>;
      } catch {
        this.parsedScheduled = undefined;
      }
    } else {
      this.parsedScheduled = undefined;
    }

    const transitionAttr = this.getAttribute("transition");
    if (transitionAttr) {
      try {
        this.parsedTransition = JSON.parse(
          transitionAttr,
        ) as boolean | ThemeTransitionOptions;
      } catch {
        this.parsedTransition = undefined;
      }
    } else {
      this.parsedTransition = undefined;
    }
  }

  private resolveTransition(): ThemeTransitionOptions | undefined {
    if (this.parsedTransition === undefined) return undefined;
    if (typeof this.parsedTransition === "object") return this.parsedTransition;
    if (this.parsedTransition === true) return {};
    return { enabled: false };
  }

  private initRuntime() {
    const resolvedTransition = this.resolveTransition();
    // `parsedThemes` defaults to the built-in set, so it cannot distinguish
    // "the element asked for these" from "nothing was set" — the attribute can.
    // Without that distinction the default would always shadow the
    // configuration a build integration transported.
    const hasExplicitThemes = Boolean(this.getAttribute("themes"));
    const explicit: Record<string, unknown> = {
      ...(hasExplicitThemes ? { themes: this.parsedThemes } : {}),
      ...(this.parsedDefaultTheme
        ? { defaultTheme: this.parsedDefaultTheme }
        : {}),
      // Mirror the pre-paint bootstrap's mode/family. Without these the runtime
      // resolves the mode from `defaultTheme` alone and overwrites the theme
      // the script already painted from `prefers-color-scheme`.
      ...(this.parsedInitialMode !== undefined
        ? { initialMode: this.parsedInitialMode }
        : {}),
      ...(this.parsedInitialFamily !== undefined
        ? { initialFamily: this.parsedInitialFamily }
        : {}),
      ...(this.parsedScheduled ? { scheduled: this.parsedScheduled } : {}),
    };

    this.runtime = createThemeRuntime({
      ...resolveRuntimeOptions(explicit),
      ...(resolvedTransition !== undefined
        ? { transition: resolvedTransition }
        : {}),
      dom: resolvedTransition !== undefined
        ? { transition: resolvedTransition }
        : ({} as DOMBindingOptions),
      cssVariables: resolvedTransition !== undefined
        ? { transition: resolvedTransition }
        : ({} as CSSVariablesOptions),
    });

    setProviderRuntime(this, this.runtime);

    this.dispatchEvent(
      new CustomEvent("theme-ready", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private destroyRuntime() {
    this.runtime?.destroy();
    this.runtime = null;
  }

  static define(tag = "theme-kit-provider") {
    // SSR-safe: customElements only exists in the browser. Framework wrappers
    // (Vue, Solid, Angular, Astro, …) call define() from both server and client
    // environments, so this must be a no-op on the server.
    if (typeof customElements === "undefined") return;
    if (!customElements.get(tag)) {
      customElements.define(tag, ThemeKitProvider);
    }
  }
}
