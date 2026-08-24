"use client";

import { useSetThemeMode, useThemeMode } from "./hooks";

export function ThemeModeButton() {
  const mode = useThemeMode();
  const setMode = useSetThemeMode();
  const nextMode =
    mode === "light" ? "dark" : mode === "dark" ? "system" : "light";

  return (
    <button type="button" onClick={() => setMode(nextMode)}>
      Mode: {mode}
    </button>
  );
}
