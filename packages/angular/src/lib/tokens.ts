import { InjectionToken, type Signal } from "@angular/core";
import type { ThemeRuntime, ThemeDefinition } from "@theme-kit/core";

export const THEME_KIT_RUNTIME = new InjectionToken<ThemeRuntime<ThemeDefinition>>(
  "@theme-kit/runtime",
);

export const THEME_KIT_SCOPED_RUNTIME = new InjectionToken<ThemeRuntime<ThemeDefinition>>(
  "@theme-kit/scoped-runtime",
);
