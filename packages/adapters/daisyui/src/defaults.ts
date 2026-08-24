import type { AdapterStrategy } from "@theme-kit/core";

export const DAISY_STYLE_ID = "@theme-kit/daisyui";
export const DAISY_VARIABLES_STYLE_ID = "theme-kit-daisy-variables";

export interface DaisyAdapterOptions {
  /** How faithfully the adapter reproduces daisyUI's native feel. */
  strategy?: AdapterStrategy;
  /** Whether to inject the daisyUI compatibility stylesheet. */
  injectCSS?: boolean;
}

export const DEFAULT_DAISY_OPTIONS: Required<DaisyAdapterOptions> = {
  strategy: "native",
  injectCSS: true,
};