import type { AdapterStrategy } from "@theme-kit/core";

export const SHADCN_STYLE_ID = "@theme-kit/shadcn";
export const SHADCN_VARIABLES_STYLE_ID = "theme-kit-shadcn-variables";

/**
 * Options for the shadcn/ui adapter.
 *
 * @see {@link createShadcnAdapter}
 */
export interface ShadcnAdapterOptions {
  /** How faithfully the adapter reproduces shadcn/ui's native feel. */
  strategy?: AdapterStrategy;
  /** Whether to inject the shadcn/ui compatibility stylesheet. Defaults to `true`. */
  injectCSS?: boolean;
}

/**
 * Defaults for {@link ShadcnAdapterOptions}.
 */
export const DEFAULT_SHADCN_OPTIONS: Required<ShadcnAdapterOptions> = {
  strategy: "native",
  injectCSS: true,
};
