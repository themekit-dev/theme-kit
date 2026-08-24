"use client";

import { useThemeMode, useSetThemeMode } from "@theme-kit/next/client";

const icons = {
  light: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
    </svg>
  ),
  dark: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
  system: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
} as const;

const labels = {
  light: "Light",
  dark: "Dark",
  system: "System",
} as const;

export function ModeToggle() {
  const mode = useThemeMode();
  const setMode = useSetThemeMode();

  const cycle: Record<string, "light" | "dark" | "system"> = {
    light: "dark",
    dark: "system",
    system: "light",
  };
  const nextMode = cycle[mode] ?? "light";

  return (
    <button
      type="button"
      onClick={() => setMode(nextMode)}
      title={`Switch to ${labels[nextMode]}`}
      aria-label={`Switch to ${labels[nextMode]}`}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-card text-sm font-medium cursor-pointer hover:border-ring hover:shadow-sm active:translate-y-px"
    >
      <span className="flex items-center justify-center">{icons[mode]}</span>
      <span className="hidden sm:inline">{labels[mode]}</span>
    </button>
  );
}
