/**
 * What actually changed between two themes, grouped by token category.
 *
 * Produced by the Theme Diff Engine. Every downstream stage (planner,
 * scanner, coordinator) keys off these booleans so Theme Kit only animates
 * the token groups that really changed — never a blanket transition.
 *
 * @see {@link createThemeDiff}
 */
export interface ThemeDiff {
  /** Whether color tokens changed. */
  colors: boolean;
  /** Whether radius tokens changed. */
  radius: boolean;
  /** Whether spacing tokens changed. */
  spacing: boolean;
  /** Whether typography tokens changed. */
  typography: boolean;
  /** Whether shadow tokens changed. */
  shadows: boolean;
  /** Whether border tokens changed. */
  borders: boolean;
  /** Non-animatable groups (z-index, breakpoints) that require an instant
   *  swap + relayout rather than an animation. */
  layout: boolean;
  /** Whether transform tokens changed. */
  transforms: boolean;
}

/**
 * A `ThemeDiff` with every group set to `false`, representing "nothing
 * changed". Used as the identity/empty diff so downstream stages can short-
 * circuit when no token group differs between two themes.
 */
export const EMPTY_THEME_DIFF: ThemeDiff = {
  colors: false,
  radius: false,
  spacing: false,
  typography: false,
  shadows: false,
  borders: false,
  layout: false,
  transforms: false,
};

/**
 * The concrete, ready-to-apply transition decided by the Transition Planner.
 *
 * `rootProperties` — registered `--theme-color-*` custom properties animated
 *   directly on `:root`; descendants inherit the interpolated values.
 * `elementProperties` — real CSS properties (padding, border-radius, …)
 *   transitioned on the scanned elements that actually use them.
 *
 * @see {@link createTransitionPlan}
 */
export interface TransitionPlan {
  /** Whether the plan animates the theme's color custom properties. */
  animatesColors: boolean;
  /** Real CSS properties transitioned on the scanned elements that use them. */
  elementProperties: string[];
  /** Transition duration in milliseconds. */
  duration: number;
  /** CSS timing function for the transition. */
  easing: string;
}

/**
 * Input consumed by the Animation Coordinator for a single theme change.
 *
 * @see {@link runThemeAnimation}
 */
export interface ThemeAnimationInput {
  /** Element receiving the theme custom properties (usually <html>). */
  target: HTMLElement;

  /** The concrete transition decided by the planner. */
  plan: TransitionPlan;
  /** Writes the new CSS custom-property values to `target`. */
  swap: () => void;
  /** Extra headroom after the longest transition before cleanup. */
  buffer?: number;
}
