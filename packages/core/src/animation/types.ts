/**
 * What actually changed between two themes, grouped by token category.
 *
 * Produced by the Theme Diff Engine. Every downstream stage (planner,
 * scanner, coordinator) keys off these booleans so Theme Kit only animates
 * the token groups that really changed — never a blanket transition.
 */
export interface ThemeDiff {
  colors: boolean;
  radius: boolean;
  spacing: boolean;
  typography: boolean;
  shadows: boolean;
  borders: boolean;
  /** Non-animatable groups (z-index, breakpoints) that require an instant
   *  swap + relayout rather than an animation. */
  layout: boolean;
  transforms: boolean;
}

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
 */
export interface TransitionPlan {
  animatesColors: boolean;
  elementProperties: string[];
  duration: number;
  easing: string;
}

/**
 * Input consumed by the Animation Coordinator for a single theme change.
 */
export interface ThemeAnimationInput {
  /** Element receiving the theme custom properties (usually <html>). */
  target: HTMLElement;
  plan: TransitionPlan;
  /** Writes the new CSS custom-property values to `target`. */
  swap: () => void;
  /** Extra headroom after the longest transition before cleanup. */
  buffer?: number;
}
