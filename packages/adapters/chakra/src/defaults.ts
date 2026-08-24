import type { AdapterStrategy } from "@theme-kit/core";

export const CHAKRA_ADAPTER_ID = "chakra";

export interface ChakraAdapterOptions {
  /** How faithfully the adapter reproduces Chakra UI's native feel. */
  strategy?: AdapterStrategy;
}

export const DEFAULT_CHAKRA_OPTIONS: Required<ChakraAdapterOptions> = {
  strategy: "native",
};