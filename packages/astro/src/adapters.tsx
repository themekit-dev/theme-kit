import { useEffect, useRef } from "react";
import type { AdapterStrategy, ThemeAdapter, ThemeDefinition } from "@theme-kit/core";
import { useThemeRuntime } from "./hooks";
import { createShadcnAdapter } from "@theme-kit/shadcn/factory";
import { createBootstrapAdapter } from "@theme-kit/bootstrap/factory";
import { createDaisyAdapter } from "@theme-kit/daisyui/factory";
import { createOpenPropsAdapter } from "@theme-kit/open-props/factory";

export interface UseAstroAdapterOptions {
  strategy?: AdapterStrategy;
}

function installAdapter<T extends ThemeDefinition>(
  create: () => ThemeAdapter<T>,
): void {
  const runtime = useThemeRuntime<T>();
  const adapterRef = useRef<ThemeAdapter<T> | null>(null);
  if (!adapterRef.current) {
    adapterRef.current = create();
  }

  useEffect(() => {
    const adapter = adapterRef.current!;
    const handle = runtime.adapters.use(adapter);
    return () => {
      handle.dispose();
    };
  }, [runtime]);
}

export function useShadcnTheme<T extends ThemeDefinition = ThemeDefinition>(
  options: UseAstroAdapterOptions = {},
): void {
  installAdapter<T>(() =>
    createShadcnAdapter(options.strategy ? { strategy: options.strategy } : {}),
  );
}

export function useBootstrapTheme<T extends ThemeDefinition = ThemeDefinition>(
  options: UseAstroAdapterOptions = {},
): void {
  installAdapter<T>(() =>
    createBootstrapAdapter(options.strategy ? { strategy: options.strategy } : {}),
  );
}

export function useDaisyTheme<T extends ThemeDefinition = ThemeDefinition>(
  options: UseAstroAdapterOptions = {},
): void {
  installAdapter<T>(() =>
    createDaisyAdapter(options.strategy ? { strategy: options.strategy } : {}),
  );
}

export function useOpenPropsTheme<T extends ThemeDefinition = ThemeDefinition>(
  options: UseAstroAdapterOptions = {},
): void {
  installAdapter<T>(() =>
    createOpenPropsAdapter(options.strategy ? { strategy: options.strategy } : {}),
  );
}