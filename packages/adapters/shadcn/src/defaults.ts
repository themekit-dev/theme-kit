import type { AdapterStrategy } from "@theme-kit/core";

export const SHADCN_STYLE_ID = "@theme-kit/shadcn";
export const SHADCN_VARIABLES_STYLE_ID = "theme-kit-shadcn-variables";

export interface ShadcnAdapterOptions {
  /** How faithfully the adapter reproduces shadcn/ui's native feel. */
  strategy?: AdapterStrategy;
  /** Whether to inject the shadcn/ui compatibility stylesheet. */
  injectCSS?: boolean;
}

export const DEFAULT_SHADCN_OPTIONS: Required<ShadcnAdapterOptions> = {
  strategy: "native",
  injectCSS: true,
};
