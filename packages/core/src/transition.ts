/**
 * Configures theme transition behavior.
 *
 * Transition configuration is applied by the runtime when the active theme
 * changes. Individual updates may suppress the configured transition (see
 * `suppressTransition`).
 *
 * @see {@link createTransitionPlan}
 * @see {@link runThemeAnimation}
 */
export interface ThemeTransitionOptions {
  /**
   * Whether theme transitions are enabled.
   *
   * @defaultValue true
   */
  enabled?: boolean;

  /**
   * Transition duration in milliseconds.
   *
   * @defaultValue 300
   */
  duration?: number;

  /**
   * CSS timing function used for the transition.
   *
   * @defaultValue "cubic-bezier(0.4, 0, 0.2, 1)"
   */
  easing?: string;

  /**
   * Prefer the View Transition API when the browser supports it.
   *
   * When enabled and available, theme changes use a native view transition
   * (a crossfade snapshot) instead of CSS-custom-property interpolation,
   * avoiding intermediate gray washes during light↔dark switches. Falls
   * back to `@property`-based interpolation when the API is unavailable or
   * the user prefers reduced motion.
   *
   * @defaultValue true
   */
  useViewTransition?: boolean;

  /**
   * Which properties are allowed to animate. `"smooth"`/`"subtle"` map to a
   * curated color-property set, `"instant"` disables interpolation, and a
   * raw array filters the diff-derived properties.
   *
   * @defaultValue "smooth"
   */
  preset?: TransitionPreset;

  /**
   * Explicit property allowlist. Overrides `preset` when provided.
   */
  properties?: string[];
}

/**
 * Named or explicit transition property sets.
 *
 * - `"smooth"`: full curated color set (colors, borders, radii, shadows).
 * - `"subtle"`: reduced color set.
 * - `"instant"`: only `opacity`.
 * - `"custom"`: reserved for explicit `properties`.
 * - `string[]`: explicit property list.
 */
export type TransitionPreset =
  | "smooth"
  | "subtle"
  | "instant"
  | "custom"
  | string[];

/**
 * Built-in property lists for the named transition presets.
 */
export const TRANSITION_PRESETS: Record<string, string[]> = {
  smooth: [
    "color",
    "background",
    "background-color",
    "border-color",
    "outline-color",
    "fill",
    "stroke",
    "border-radius",
    "box-shadow",
    "text-shadow",
    "opacity",
  ],
  subtle: [
    "color",
    "background-color",
    "border-color",
    "outline-color",
    "fill",
    "stroke",
    "background",
    "box-shadow",
    "opacity",
  ],
  instant: ["opacity"],
};

/**
 * The transition preset used when `ThemeTransitionOptions.preset` is
 * omitted.
 */
export const DEFAULT_TRANSITION_PRESET: TransitionPreset = "smooth";

/**
 * The default transition configuration applied by the runtime when
 * transitions are enabled without explicit options.
 */
export const DEFAULT_THEME_TRANSITION: Omit<
  Required<ThemeTransitionOptions>,
  "preset"
> &
  Partial<Pick<ThemeTransitionOptions, "preset">> = {
  enabled: true,
  duration: 300,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Prefer the View Transition API when the browser supports it: it captures a
  // snapshot of the old page and crossfades it, so a light→dark switch never
  // passes through bright intermediate colors (the CSS-custom-property
  // interpolation on `:root` is sRGB, so the background washes through gray).
  // Callers can opt out with `useViewTransition: false`; when the API is
  // unavailable (or the user prefers reduced motion) the code falls back to
  // the `@property`-based interpolation automatically.
  useViewTransition: true,
  properties: TRANSITION_PRESETS.smooth as string[],
};
