import type { AdapterStrategy } from "@theme-kit/core";

export const MUI_ADAPTER_ID = "mui";

export interface MuiAdapterOptions {
  /** How faithfully the adapter reproduces Material UI's native feel. */
  strategy?: AdapterStrategy;
}

export const DEFAULT_MUI_OPTIONS: Required<MuiAdapterOptions> = {
  strategy: "native",
};