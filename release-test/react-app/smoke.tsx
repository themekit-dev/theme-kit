// React consumer typecheck — verifies the published .d.ts resolves and
// the public API surface type-checks from a consumer's perspective.
// Compiled with `tsc --noEmit` (never executed directly).
import { createElement } from "react";
import {
  ThemeProvider,
  useTheme,
  useThemeRuntime,
  useThemeValue,
  useThemeTokens,
  useThemeMode,
  useThemeFamily,
  ThemeScope,
  ThemeScrollbar,
  type ThemeProviderProps,
  type ThemeScopeProps,
  type ThemeScrollbarProps,
} from "@theme-kit/react";
import {
  createThemeStore,
  createThemeRuntime,
  type ThemeDefinition,
  type ThemeTokens,
  type ThemeStore,
} from "@theme-kit/core";

const lightTheme: ThemeDefinition = { name: "light", tokens: { colors: { background: "#fff" } } };
const darkTheme: ThemeDefinition = { name: "dark", tokens: { colors: { background: "#000" } } };

// --- @theme-kit/react public surface ---
const providerProps: ThemeProviderProps<ThemeDefinition> = {
  themes: [lightTheme, darkTheme],
  defaultTheme: "light",
  initialMode: "system",
  children: createElement("div"),
};

const scopeProps: ThemeScopeProps = {
  theme: "dark",
  children: createElement("div"),
};

const scrollbarProps: ThemeScrollbarProps = {
  axes: ["vertical"],
};

// Component references are used (not just imported) to ensure the bindings resolve
const _components = {
  ThemeProvider,
  ThemeScope,
  ThemeScrollbar,
};

function Consumer(): null {
  const theme = useTheme<ThemeDefinition>();
  const _t: string = theme.theme.name;
  const _mode: string = useThemeMode();
  const _family: string = useThemeFamily();
  const _value: ThemeDefinition | null = useThemeValue();
  const _tokens: ThemeTokens | undefined = useThemeTokens();
  const runtime = useThemeRuntime<ThemeDefinition>();
  const _store: ThemeStore<ThemeDefinition> = runtime.store;
  void _t; void _mode; void _family; void _value; void _tokens; void _store;
  return null;
}

// --- @theme-kit/core public surface ---
const store: ThemeStore<ThemeDefinition> = createThemeStore({ initialTheme: lightTheme });
const runtime = createThemeRuntime<ThemeDefinition>({
  themes: [lightTheme, darkTheme],
  defaultTheme: "light",
  initialMode: "system",
});
void runtime;

// Guard against tree-shaking of the consts
void _components;
void Consumer;
void providerProps;
void scopeProps;
void scrollbarProps;
void store;

export {};
