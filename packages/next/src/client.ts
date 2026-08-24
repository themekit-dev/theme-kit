"use client";

export { ClientThemeProvider } from "./provider";
export type { ClientThemeProviderProps } from "./provider";
export * from "./hooks";
export * from "./theme-bootstrap";
export {
  ThemeScope,
  useScopedTheme,
  ThemeInspector,
  ThemeModeButton,
} from "@theme-kit/react";
export { useShadcnTheme } from "@theme-kit/shadcn";
export { useBootstrapTheme } from "@theme-kit/bootstrap";
export { useDaisyTheme } from "@theme-kit/daisyui";
export { useOpenPropsTheme } from "@theme-kit/open-props";

export {
  MuiThemeProvider,
  useMuiTheme,
  type MuiThemeProviderProps,
} from "@theme-kit/mui";
export {
  ChakraThemeProvider,
  useChakraTheme,
  type ChakraThemeProviderProps,
} from "@theme-kit/chakra";
export {
  AntdThemeProvider,
  useAntdTheme,
  type AntdThemeProviderProps,
} from "@theme-kit/antd";
export {
  MantineThemeProvider,
  useMantineTheme,
  type MantineThemeProviderProps,
} from "@theme-kit/mantine";
