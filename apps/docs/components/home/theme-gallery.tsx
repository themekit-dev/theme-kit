"use client";

import { useMemo } from "react";
import {
  useTheme,
  useThemeRuntime,
  useSetThemeFamily,
} from "@theme-kit/next/client";
import type { ThemeDefinition } from "@theme-kit/core";

type FamilyGroup = {
  family: string;
  label: string;
  light: ThemeDefinition | undefined;
  dark: ThemeDefinition | undefined;
  isBrand: boolean;
};

function ThemeSwatch({ theme }: { theme: ThemeDefinition | undefined }) {
  const colors = theme?.tokens?.colors as
    | Record<string, string>
    | undefined;
  if (!colors) return null;

  const keys = ["background", "card", "primary", "secondary", "accent", "border"];
  return (
    <div className="flex gap-1">
      {keys.map((key) => {
        const value = colors[key];
        if (!value) return null;
        return (
          <div
            key={key}
            className="w-4 h-4 rounded-full border border-black/10"
            style={{ background: value }}
            title={`${key}: ${value}`}
          />
        );
      })}
    </div>
  );
}

export function ThemeGallery() {
  const runtime = useThemeRuntime();
  const { family } = useTheme();
  const setFamily = useSetThemeFamily();

  const groups = useMemo(() => {
    const map = new Map<string, FamilyGroup>();
    for (const themeItem of runtime.themes) {
      const f = themeItem.meta?.family ?? "default";
      const existing = map.get(f);
      const label = themeItem.meta?.label?.replace(/\s+(Light|Dark)$/i, "") ?? f;
      const isBrand = themeItem.meta?.tags?.includes("brand") ?? /^(apple|github|vercel|slack|discord)$/.test(f);

      const group: FamilyGroup = {
        family: f,
        label: existing?.label ?? label,
        light: existing?.light ?? undefined,
        dark: existing?.dark ?? undefined,
        isBrand: existing?.isBrand ?? isBrand,
      };

      if (themeItem.meta?.mode === "light") {
        group.light = themeItem;
      } else if (themeItem.meta?.mode === "dark") {
        group.dark = themeItem;
      }

      map.set(f, group);
    }
    return [...map.values()].filter(
      (g) =>
        g.light &&
        g.dark &&
        !["theme-kit", "lab", "scope"].includes(g.family),
    );
  }, [runtime.themes]);

  const active = family ?? "default";

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
          Ship every theme that ships with the library
        </h2>
        <p className="opacity-70 max-w-2xl">
          Built-in preset families and brand palettes, all themeable with one
          click. Click a card to apply it to this entire site — live, no
          reload.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => {
          const isActive = group.family === active;
          return (
            <button
              key={group.family}
              type="button"
              onClick={() => setFamily(group.family)}
              className={`card-lift rounded-xl border p-4 text-left cursor-pointer ${
                isActive
                  ? "border-(--theme-color-primary) bg-[color-mix(in_srgb,var(--theme-color-primary)_8%,transparent)]"
                  : "border-border bg-card hover:border-(--theme-color-ring)"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-sm capitalize">
                    {group.label}
                  </div>
                  <div className="mono text-[11px] opacity-40">{group.family}</div>
                </div>
                {group.isBrand && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                    style={{
                      background: "var(--theme-color-secondary)",
                      color: "var(--theme-color-secondary-foreground, var(--theme-color-secondaryForeground))",
                    }}
                  >
                    Brand
                  </span>
                )}
              </div>

              <div
                className="rounded-lg p-3 mb-2 border"
                style={{
                  background: "var(--theme-color-card)",
                  borderColor: "var(--theme-color-border)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">
                    Light
                  </span>
                  <ThemeSwatch theme={group.light} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">
                    Dark
                  </span>
                  <ThemeSwatch theme={group.dark} />
                </div>
              </div>

              <div className="text-[11px] opacity-60">
                {isActive ? "Active theme" : "Click to apply"}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
