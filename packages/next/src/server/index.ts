import { cookies } from "next/headers";

import {
  resolveInitialTheme,
  type InitialThemeResolution,
  type ResolveInitialThemeOptions,
  type ThemeDefinition,
  type ThemeMode,
} from "@theme-kit/core";

export async function getInitialThemeState<T extends ThemeDefinition>(
  options: ResolveInitialThemeOptions<T>,
): Promise<InitialThemeResolution<T>> {
  let mode: ThemeMode | undefined;
  let family: string | undefined;

  try {
    const cookieStore = await cookies();

    const cookieMode = cookieStore.get("theme-mode")?.value;
    family = cookieStore.get("theme-family")?.value;

    if (
      cookieMode === "light" ||
      cookieMode === "dark" ||
      cookieMode === "system"
    ) {
      mode = cookieMode;
    }
  } catch (error) {
    console.error("Failed to read theme cookies:", error);
  }

  return resolveInitialTheme({
    ...options,
    ...(mode && { mode }),
    ...(family && { family }),
  });
}
