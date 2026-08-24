import type { ThemeDefinition, ThemeMode } from "./model/theme";
import type { ThemeTokens } from "./model/tokens";
import { getBuiltInThemes } from "./built-in-themes";
import { createThemeRuntime, type ThemeRuntime, type ScheduledThemeOptions } from "./runtime";
import { createDOMBinding } from "./adapters/dom";
import { createCSSVariablesBinding } from "./adapters/css-variables";
import { themeToCSSVariables } from "./css";
import type { ThemePack, ThemeRegistry } from "./registry";
import type { ThemeSchedule } from "./adapters/schedule";

export type { ThemeDefinition, ThemeMode } from "./model/theme";
export type { ThemeTokens } from "./model/tokens";
export { generateTheme } from "./generate-theme";
export type { GenerateThemeOptions, GeneratedThemePair } from "./generate-theme";
export type { ThemePack, ThemeRegistry } from "./registry";

/**
 * Options for creating a {@link ThemeKit} instance.
 */
export interface ThemeKitOptions {
  /** Custom set of themes. Defaults to all built-in themes. */
  themes?: readonly ThemeDefinition[];
  /** Default theme name when no persisted selection exists. */
  defaultTheme?: string;
  /** Initial mode: `"light"`, `"dark"`, or `"system"`. Ignored if a theme was previously persisted in localStorage. */
  initialMode?: ThemeMode;
  /** Initial family. Ignored if a theme was previously persisted in localStorage. */
  initialFamily?: string;
  /** Sunrise/sunset solar scheduling config. Automatically applies light/dark themes at sunrise/sunset. */
  scheduled?: false | ScheduledThemeOptions<ThemeDefinition>;
  /** Target element for CSS custom properties and `data-theme` attributes. Defaults to `document.documentElement`. */
  target?: HTMLElement | Document;
}

type EventMap = {
  themeChange: ThemeDefinition;
  modeChange: ThemeMode;
  familyChange: string;
};

type Listener<T = unknown> = (data: T) => void;

/**
 * Framework-free drop-in theming with `@theme-kit/core`.
 *
 * ```js
 * import { ThemeKit } from "@theme-kit/core/vanilla";
 *
 * const kit = new ThemeKit();
 * kit.setMode("dark");
 * kit.setFamily("plum");
 * kit.on("themeChange", (theme) => console.log(theme.name));
 * ```
 */
export class ThemeKit {
  private _runtime: ThemeRuntime<ThemeDefinition> | null = null;
  private events: Map<string, Set<Listener>> = new Map();
  private domBinding: ReturnType<typeof createDOMBinding> | null = null;
  private cssBinding: ReturnType<typeof createCSSVariablesBinding> | null = null;

  /**
   * @param options - Configuration options. Persisted state in localStorage
   *                  takes precedence over `initialMode`/`initialFamily`.
   */
  constructor(options: ThemeKitOptions = {}) {
    const themes: readonly ThemeDefinition[] = options.themes ?? (getBuiltInThemes() as unknown as ThemeDefinition[]);

    this._runtime = createThemeRuntime({
      themes,
      ...(options.defaultTheme !== undefined ? { defaultTheme: options.defaultTheme } : {}),
      ...(options.initialMode !== undefined ? { initialMode: options.initialMode } : {}),
      ...(options.initialFamily !== undefined ? { initialFamily: options.initialFamily } : {}),
      ...(options.scheduled !== undefined ? { scheduled: options.scheduled } : {}),
      dom: false,
      cssVariables: false,
    } as any);

    if (typeof document !== "undefined") {
      const target = options.target ?? document.documentElement;
      this.domBinding = createDOMBinding(this._runtime.store, { target } as any);
      this.cssBinding = createCSSVariablesBinding(this._runtime.store, { target } as any);
    }

    this._runtime.store.subscribe((theme) => {
      this.emit("themeChange", theme);
      this.emit("modeChange", this._runtime!.selection.getMode());
      this.emit("familyChange", this._runtime!.selection.getFamily());
    });

    this._runtime.selection.subscribe((selection) => {
      this.emit("modeChange", selection.mode);
      this.emit("familyChange", selection.family);
    });
  }

  /** Create a ThemeKit instance. Shorthand for `new ThemeKit(options)`. */
  static init(options: ThemeKitOptions = {}): ThemeKit {
    return new ThemeKit(options);
  }

  /** Access the underlying runtime for advanced use (history, direct store access). */
  get runtime(): ThemeRuntime<ThemeDefinition> {
    return this._runtime!;
  }

  /** Access the theme schedule controller if configured. */
  get schedule(): ThemeSchedule | null {
    return this._runtime!.schedule;
  }

  /** Access the theme registry for dynamic theme registration. */
  get registry(): ThemeRegistry<ThemeDefinition> {
    return this._runtime!.registry;
  }

  /** The currently active theme definition (includes resolved tokens). */
  get theme(): ThemeDefinition {
    return this._runtime!.store.get();
  }

  /** The current mode: `"light"`, `"dark"`, or `"system"`. */
  get mode(): ThemeMode {
    return this._runtime!.selection.getMode();
  }

  /** The current theme family name (e.g. `"default"`, `"plum"`, `"mint"`). */
  get family(): string {
    return this._runtime!.selection.getFamily();
  }

  /** All registered theme definitions. */
  get themes(): readonly ThemeDefinition[] {
    return this._runtime!.themes;
  }

  /** Switch to a specific mode. Persisted to localStorage automatically. */
  setMode(mode: ThemeMode): void {
    this._runtime!.selection.setMode(mode);
  }

  /** Switch to a theme family. Persisted to localStorage automatically. */
  setFamily(family: string): void {
    this._runtime!.selection.setFamily(family);
  }

  /** Toggle between light and dark mode (ignores `"system"`). */
  toggleTheme(): void {
    this._runtime!.selection.toggleTheme();
  }

  /** Merge partial tokens into the current theme at runtime. */
  update(tokens: Partial<ThemeTokens>): void {
    this._runtime!.update(tokens);
  }

  /** Install a theme pack (collection of themes). */
  use(pack: ThemePack<ThemeDefinition>): void {
    this._runtime!.use(pack);
  }

  /** Convert a theme (or the current theme) into a flat CSS variables map. */
  toCSSVariables(theme?: ThemeDefinition): Record<string, string> {
    return themeToCSSVariables(theme ?? this.theme);
  }

  /**
   * Subscribe to theme events.
   *
   * @param event - Event name: `"themeChange"`, `"modeChange"`, or `"familyChange"`.
   * @param listener - Callback receiving the event payload.
   * @returns An unsubscribe function.
   */
  on<K extends keyof EventMap>(
    event: K,
    listener: Listener<EventMap[K]>,
  ): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(listener as Listener);
    return () => this.off(event, listener as Listener);
  }

  /** Remove a previously registered event listener. */
  off<K extends keyof EventMap>(
    event: K,
    listener: Listener<EventMap[K]>,
  ): void {
    this.events.get(event)?.delete(listener as Listener);
  }

  private emit<K extends keyof EventMap>(
    event: K,
    data: EventMap[K],
  ): void {
    this.events.get(event)?.forEach((fn) => fn(data));
  }

  /** Clean up DOM bindings, event listeners, and persistence subscriptions. */
  destroy(): void {
    this.domBinding?.destroy();
    this.cssBinding?.destroy();
    this._runtime?.destroy();
    this._runtime = null;
    this.events.clear();
  }
}
