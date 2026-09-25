import type { AdapterStrategy } from "@theme-kit/core";

/**
 * The adapter id registered by the Chakra UI adapter.
 *
 * @see {@link createChakraAdapter}
 */
export const CHAKRA_ADAPTER_ID = "chakra";

/**
 * Options for the Chakra UI adapter.
 */
export interface ChakraAdapterOptions {
  /** How faithfully the adapter reproduces Chakra UI's native feel. */
  strategy?: AdapterStrategy;
}

/**
 * Defaults for {@link ChakraAdapterOptions}.
 */
export const DEFAULT_CHAKRA_OPTIONS: Required<ChakraAdapterOptions> = {
  strategy: "native",
};