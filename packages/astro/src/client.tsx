import React, { useEffect, useMemo } from "react";
import {
  createThemeRuntime,
  type InitialThemeResolution,
  type ThemeDefinition,
} from "@theme-kit/core";
import { setGlobalRuntime } from "./shared-runtime";
import { createAstroThemePersistence } from "./persistence";

export interface ThemeProviderClientProps<T extends ThemeDefinition> {
  initial: InitialThemeResolution<T>;
  themes?: readonly T[];
  defaultTheme?: string;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )}; path=/; max-age=31536000; samesite=lax`;
}

export function ThemeProviderClient<T extends ThemeDefinition>({
  initial,
  themes,
}: ThemeProviderClientProps<T>) {
  const persistence = useMemo(
    () => createAstroThemePersistence(themes as readonly ThemeDefinition[] | undefined),
    [themes],
  );

  const runtime = useMemo(() => {
    const rt = createThemeRuntime({
      initial,
      themes: themes as readonly ThemeDefinition[] | undefined,
      dom: {},
      cssVariables: {},
      readPersistenceOnInit: false,
      persistence,
    });
    setGlobalRuntime(rt);
    return rt;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsubscribe = runtime.store.subscribe((theme) => {
      writeCookie("theme-name", String(theme.name));
      writeCookie("theme-family", runtime.selection.getFamily());
      writeCookie("theme-mode", runtime.selection.getMode());
    });

    return () => {
      unsubscribe();
      runtime.destroy();
    };
  }, [runtime]);

  return null;
}

export default ThemeProviderClient;

export {
  useThemeRuntime,
  useTheme,
  useThemeValue,
  useThemeMode,
  useThemeFamily,
  useSetThemeMode,
  useSetThemeFamily,
  useToggleTheme,
  useThemeTokens,
  useThemeHistory,
  useThemeSchedule,
} from "./hooks";

export {
  useShadcnTheme,
  useBootstrapTheme,
  useDaisyTheme,
  useOpenPropsTheme,
} from "./adapters";
export type { UseAstroAdapterOptions } from "./adapters";

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

export { ThemeScope } from "./theme-scope";
export type { ThemeScopeProps } from "./theme-scope";
