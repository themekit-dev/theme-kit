import {
  EnvironmentProviders,
  Provider,
  makeEnvironmentProviders,
  inject,
  ENVIRONMENT_INITIALIZER,
  PLATFORM_ID,
  RendererFactory2,
  TransferState,
} from "@angular/core";
import { isPlatformBrowser, isPlatformServer, DOCUMENT } from "@angular/common";
import {
  createThemeRuntime,
  createCSSVariablesBinding,
  createDOMBinding,
  type ThemeRuntime,
  type ThemeRuntimeOptions,
  type ThemeDefinition,
} from "@theme-kit/core";
import { THEME_KIT_RUNTIME } from "./tokens";
import { createAngularPersistence, THEME_SELECTION_KEY } from "./persistence";
import { createBlockingScriptContent } from "./blocking-script";

export type ThemeKitProviderOptions = ThemeRuntimeOptions<ThemeDefinition> & {
  target?: HTMLElement;
};

export function provideThemeKit(
  options: ThemeKitProviderOptions = {},
): EnvironmentProviders {
  const { target, ...runtimeOptions } = options;

  const providers: Provider[] = [
    {
      provide: THEME_KIT_RUNTIME,
      useFactory: () => {
        const persistence = createAngularPersistence();
        return createThemeRuntime({
          ...runtimeOptions,
          dom: false,
          cssVariables: false,
          persistence,
        });
      },
    },

    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useFactory: () => {
        const platformId = inject(PLATFORM_ID);
        if (!isPlatformBrowser(platformId)) return () => {};

        const runtime = inject(THEME_KIT_RUNTIME);
        return () => {
          const el = target ?? document.documentElement;
          createDOMBinding(runtime.store, { target: el });
          createCSSVariablesBinding(runtime.store, { target: el });
        };
      },
    },

    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useFactory: () => {
        const platformId = inject(PLATFORM_ID);
        if (!isPlatformServer(platformId)) return () => {};

        const runtime = inject(THEME_KIT_RUNTIME);
        const transferState = inject(TransferState);
        const rendererFactory = inject(RendererFactory2);
        const document = inject(DOCUMENT);
        const renderer = rendererFactory.createRenderer(null, null);

        return () => {
          const themes = runtime.themes as ThemeDefinition[];
          const mode = runtime.selection.getMode();
          const family = runtime.selection.getFamily();

          transferState.set(THEME_SELECTION_KEY, { mode, family });

          const html = document.documentElement;
          if (html) {
            renderer.setAttribute(html, "data-theme", runtime.store.get().name);
            renderer.setAttribute(html, "data-theme-mode", mode);
            renderer.setAttribute(html, "data-theme-family", family);
            if (
              mode === "dark" ||
              (mode === "system" && runtime.store.get().meta?.mode === "dark")
            ) {
              renderer.addClass(html, "dark");
            }
          }

          const head = document.head;
          if (!head) return;

          const blockingHTML = createBlockingScriptContent(themes, { mode, family });
          const temp = document.createElement("div");
          temp.innerHTML = blockingHTML;

          for (const child of Array.from(temp.children)) {
            renderer.appendChild(head, child);
          }
        };
      },
    },
  ];

  return makeEnvironmentProviders(providers);
}

export function provideThemeKitRuntime(
  runtime: ThemeRuntime<ThemeDefinition>,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: THEME_KIT_RUNTIME, useValue: runtime },
  ]);
}
