import type { AdapterStrategy } from "@theme-kit/core";

export const DAISY_STYLE_ID = "@theme-kit/daisyui";
export const DAISY_VARIABLES_STYLE_ID = "theme-kit-daisy-variables";

/**
 * Options for the daisyUI adapter.
 *
 * @see {@link createDaisyAdapter}
 */
export interface DaisyAdapterOptions {
  /** How faithfully the adapter reproduces daisyUI's native feel. */
  strategy?: AdapterStrategy;
  /** Whether to inject the daisyUI compatibility stylesheet. Defaults to `true`. */
  injectCSS?: boolean;
}

/**
 * Defaults for {@link DaisyAdapterOptions}.
 */
export const DEFAULT_DAISY_OPTIONS: Required<DaisyAdapterOptions> = {
  strategy: "native",
  injectCSS: true,
};