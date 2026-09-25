import type { AdapterStrategy } from "@theme-kit/core";

/**
 * The adapter id registered by the Material UI adapter.
 *
 * @see {@link createMuiAdapter}
 */
export const MUI_ADAPTER_ID = "mui";

/**
 * Options for the Material UI adapter.
 */
export interface MuiAdapterOptions {
  /** How faithfully the adapter reproduces Material UI's native feel. */
  strategy?: AdapterStrategy;
}

/**
 * Defaults for {@link MuiAdapterOptions}.
 */
export const DEFAULT_MUI_OPTIONS: Required<MuiAdapterOptions> = {
  strategy: "native",
};