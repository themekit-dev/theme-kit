/**
 * Metadata describing a theme's family, mode, and presentation.
 *
 * `family` and `mode` drive selection; the remaining fields are descriptive
 * and may be surfaced by tooling, the inspector, or docs generators.
 *
 * @see {@link ThemeDefinition}
 */
export interface ThemeMeta {
  /** Human-readable theme name shown in pickers and the inspector. */
  label?: string;
  /** Short human-readable description of the theme. */
  description?: string;
  /** Deprecated alias for {@link family}. Prefer `family`. */
  group?: string;
  /** Theme schema version this definition targets. */
  version?: string;
  /** ISO date the theme was created. */
  created?: string;
  /** ISO date the theme was last updated. */
  updated?: string;

  /**
   * Theme family used for selection and toggling. Themes without a family
   * belong to the `"default"` family.
   */
  family?: string;
  /**
   * Color mode of the theme. When omitted, the mode is inferred from the
   * theme name (e.g. `"mint-dark"` → `"dark"`).
   */
  mode?: "light" | "dark" | "system";
  /** Relative sort order among themes of the same family. */
  order?: number;
  /** Free-form tags for filtering and classification. */
  tags?: string[];
}
