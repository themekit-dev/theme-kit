import type { AdapterStrategy } from "@theme-kit/core";

export const BOOTSTRAP_STYLE_ID = "@theme-kit/bootstrap";
export const BOOTSTRAP_VARIABLES_STYLE_ID = "theme-kit-bootstrap-variables";

/**
 * Options for the Bootstrap adapter.
 *
 * @see {@link createBootstrapAdapter}
 */
export interface BootstrapAdapterOptions {
  /** How faithfully the adapter reproduces Bootstrap's native feel. */
  strategy?: AdapterStrategy;
  /** Whether to inject the Bootstrap compatibility stylesheet. Defaults to `true`. */
  injectCSS?: boolean;
}

/**
 * Defaults for {@link BootstrapAdapterOptions}.
 */
export const DEFAULT_BOOTSTRAP_OPTIONS: Required<BootstrapAdapterOptions> = {
  strategy: "native",
  injectCSS: true,
};