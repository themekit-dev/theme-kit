/**
 * Token-category → CSS-property classification.
 *
 * This is the single source of truth for "which token group maps to which CSS
 * property," so the Transition Planner builds transitions from a diff without
 * hardcoding property lists in multiple places.
 *
 * `colors` intentionally maps to nothing here: theme colors flow through
 * `@property`-registered custom properties on `:root`, so the whole
 * `var(--theme-color-*)` graph animates by inheritance — no per-element work.
 * Every other group is animated on the scanned elements that use it.
 */
export const ANIMATED_GROUP_KEYS = [
  "colors",
  "radius",
  "spacing",
  "typography",
  "shadows",
  "borders",
  "transforms",
  "opacity",
] as const;

export type AnimatedGroupKey = (typeof ANIMATED_GROUP_KEYS)[number];

export const GROUP_PROPERTIES: Record<AnimatedGroupKey, string[]> = {
  colors: [],
  radius: ["border-radius"],
  spacing: [
    "padding",
    "margin",
    "gap",
    "row-gap",
    "column-gap",
    "scroll-padding",
    "scroll-margin",
  ],
  typography: [
    "font-size",
    "line-height",
    "letter-spacing",
    "word-spacing",
    "text-indent",
    "font-weight",
    "text-shadow",
  ],
  shadows: ["box-shadow", "filter", "backdrop-filter"],
  borders: [
    "border-width",
    "outline-width",
    "border-top-width",
    "border-right-width",
    "border-bottom-width",
    "border-left-width",
  ],
  transforms: ["transform"],
  opacity: ["opacity"],
};