import type { AdapterStrategy } from "@theme-kit/core";

export const OPEN_PROPS_STYLE_ID = "@theme-kit/open-props";
export const OPEN_PROPS_VARIABLES_STYLE_ID = "theme-kit-open-props-variables";

export interface OpenPropsAdapterOptions {
  /** How faithfully the adapter reproduces Open Props' native feel. */
  strategy?: AdapterStrategy;
  /** Whether to inject the Open Props compatibility stylesheet. */
  injectCSS?: boolean;
}

export const DEFAULT_OPEN_PROPS_OPTIONS: Required<OpenPropsAdapterOptions> = {
  strategy: "native",
  injectCSS: true,
};