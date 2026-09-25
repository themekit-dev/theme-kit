import type { AdapterStrategy } from "@theme-kit/core";

/**
 * The adapter id registered by the Ant Design adapter.
 *
 * @see {@link createAntdAdapter}
 */
export const ANTD_ADAPTER_ID = "antd";

/**
 * Options for the Ant Design adapter.
 */
export interface AntdAdapterOptions {
  /** How faithfully the adapter reproduces Ant Design's native feel. */
  strategy?: AdapterStrategy;
}

/**
 * Defaults for {@link AntdAdapterOptions}.
 */
export const DEFAULT_ANTD_OPTIONS: Required<AntdAdapterOptions> = {
  strategy: "native",
};