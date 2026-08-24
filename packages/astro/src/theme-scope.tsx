import React, { useEffect, useRef, useState, type ReactNode } from "react";
import {
  resolveTheme,
  createScopedThemeBinding,
  type ThemeDefinition,
  type ThemeTransitionOptions,
} from "@theme-kit/core";
import { getGlobalRuntime } from "./shared-runtime";

export interface ThemeScopeProps {
  theme: string;
  children: ReactNode;
  className?: string;
  /** Transition applied when the scope's theme changes. Defaults to the owning
   *  runtime's transition (the provider's), or pass your own to override. */
  transition?: ThemeTransitionOptions;
}

export function ThemeScope({ theme, children, className, transition }: ThemeScopeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !ready) return;

    const runtime = getGlobalRuntime();
    if (!runtime) return;

    const scopeTransition = transition ?? runtime.transition;
    const binding = createScopedThemeBinding(
      runtime.themes,
      el,
      theme,
      scopeTransition ? { transition: scopeTransition } : {},
    );

    return () => {
      binding.destroy();
    };
  }, [ready, theme, transition]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
