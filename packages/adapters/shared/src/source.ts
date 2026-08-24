import type {
  ThemeDefinition,
  ThemeRuntime,
  ThemeStore,
  ThemeTokens,
} from "@theme-kit/core";
import { resolveTokens } from "@theme-kit/core";

/**
 * A thing from which an adapter can read the currently-resolved theme.
 *
 * Adapters accept either the live runtime, the bare store, a single resolved
 * theme definition, or raw tokens. This keeps the public API ergonomic while
 * the core stays completely UI-library agnostic.
 */
export type AdapterSource<T extends ThemeDefinition = ThemeDefinition> =
  | ThemeRuntime<T>
  | ThemeStore<T>
  | T
  | ThemeTokens;

export interface AdapterResolvedTheme {
  name: string;
  mode: "light" | "dark" | "system" | undefined;
  tokens: ThemeTokens;
}

function isRuntime(input: unknown): input is ThemeRuntime<ThemeDefinition> {
  const value = input as ThemeRuntime<ThemeDefinition> | undefined;
  return (
    !!value &&
    typeof value === "object" &&
    !!value.store &&
    typeof value.store.get === "function"
  );
}

function isStore(input: unknown): input is ThemeStore<ThemeDefinition> {
  const value = input as ThemeStore<ThemeDefinition> | undefined;
  return !!value && typeof value === "object" && typeof value.get === "function";
}

function isTheme(input: unknown): input is ThemeDefinition {
  const value = input as ThemeDefinition | undefined;
  return !!value && typeof value === "object" && typeof value.name === "string";
}

/**
 * Normalizes any accepted source into an `AdapterResolvedTheme` whose tokens
 * have already been resolved (token references, auto()/contrast() and
 * expressions evaluated) by the core.
 */
export function resolveAdapterSource<T extends ThemeDefinition>(
  source: AdapterSource<T>,
): AdapterResolvedTheme {
  let candidate: unknown = source;

  if (isRuntime(source)) {
    candidate = source.store.get();
  } else if (isStore(source)) {
    candidate = source.get();
  }

  if (isTheme(candidate)) {
    const meta = (candidate.meta ?? {}) as { mode?: string };
    return {
      name: candidate.name,
      mode:
        meta.mode === "light"
          ? "light"
          : meta.mode === "dark"
            ? "dark"
            : undefined,
      tokens: resolveTokens(candidate.tokens ?? {}),
    };
  }

  return {
    name: "__theme_kit_adapter__",
    mode: undefined,
    tokens: resolveTokens((candidate ?? {}) as ThemeTokens),
  };
}