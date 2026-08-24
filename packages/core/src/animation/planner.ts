import {
  DEFAULT_THEME_TRANSITION,
  TRANSITION_PRESETS,
  type ThemeTransitionOptions,
} from "../transition";
import { GROUP_PROPERTIES } from "./classify";
import type { ThemeDiff, TransitionPlan } from "./types";

const COLORISH = new Set([
  "color",
  "background",
  "background-color",
  "border-color",
  "outline-color",
  "fill",
  "stroke",
  "text-decoration-color",
]);

function resolvePresetFilter(
  preset: ThemeTransitionOptions["preset"],
): string[] | null {
  if (preset == null) return null;
  if (Array.isArray(preset)) return preset;
  return TRANSITION_PRESETS[preset] ?? null;
}

function reduceMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Transition Planner.
 *
 * Turns a ThemeDiff into a concrete TransitionPlan:
 *  - colors animate through the registered theme custom properties on `:root`,
 *  - every other changed group contributes the concrete CSS properties it maps
 *    to (radius → border-radius, spacing → padding/margin/gap, …).
 *
 * Returns `null` when there is nothing animatable: transitions disabled,
 * reduced motion, an "instant" preset, or a diff where only non-animatable
 * groups (layout/z-index/breakpoints) changed.
 */
export function createTransitionPlan(
  diff: ThemeDiff,
  options?: ThemeTransitionOptions,
  env?: { reducedMotion?: boolean },
): TransitionPlan | null {
  const transition = {
    ...DEFAULT_THEME_TRANSITION,
    ...options,
  };

  if (!transition.enabled) return null;
  if (env?.reducedMotion ?? reduceMotion()) return null;

  const filter = resolvePresetFilter(transition.preset);
  if (filter && filter.length === 1 && filter[0] === "opacity") {
    // "instant" preset — nothing interpolates for a theme change.
    return null;
  }

  const elementProperties: string[] = [];
  const consider = (group: keyof ThemeDiff, props: string[]) => {
    if (!diff[group]) return;
    for (const prop of props) {
      if (filter == null || filter.includes(prop)) {
        elementProperties.push(prop);
      }
    }
  };

  consider("radius", GROUP_PROPERTIES.radius);
  consider("spacing", GROUP_PROPERTIES.spacing);
  consider("typography", GROUP_PROPERTIES.typography);
  consider("shadows", GROUP_PROPERTIES.shadows);
  consider("borders", GROUP_PROPERTIES.borders);
  consider("transforms", GROUP_PROPERTIES.transforms);

  // Colors animate via the inherited theme custom properties on :root. A preset
  // that doesn't mention color properties (e.g. custom property lists) opts out.
  const animatesColors =
    diff.colors &&
    (filter == null || filter.some((p) => COLORISH.has(p)));

  if (!animatesColors && elementProperties.length === 0) {
    return null;
  }

  return {
    animatesColors,
    elementProperties,
    duration: transition.duration,
    easing: transition.easing,
  };
}
