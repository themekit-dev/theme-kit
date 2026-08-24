export interface ThemeTransitionOptions {
  enabled?: boolean;
  duration?: number;
  easing?: string;
  useViewTransition?: boolean;
  /** Which properties are allowed to animate. `"smooth"`/`"subtle"` map to a
   *  curated color-property set, `"instant"` disables interpolation, and a
   *  raw array filters the diff-derived properties. */
  preset?: TransitionPreset;
  properties?: string[];
}

export type TransitionPreset =
  | "smooth"
  | "subtle"
  | "instant"
  | "custom"
  | string[];

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

export const DEFAULT_TRANSITION_PRESET: TransitionPreset = "smooth";

export const DEFAULT_THEME_TRANSITION: Omit<
  Required<ThemeTransitionOptions>,
  "preset"
> &
  Partial<Pick<ThemeTransitionOptions, "preset">> = {
  enabled: true,
  duration: 300,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  useViewTransition: false,
  properties: TRANSITION_PRESETS.smooth as string[],
};
