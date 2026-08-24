import type { AdapterStrategy } from "@theme-kit/core";

export const ANTD_ADAPTER_ID = "antd";

export interface AntdAdapterOptions {
  /** How faithfully the adapter reproduces Ant Design's native feel. */
  strategy?: AdapterStrategy;
}

export const DEFAULT_ANTD_OPTIONS: Required<AntdAdapterOptions> = {
  strategy: "native",
};