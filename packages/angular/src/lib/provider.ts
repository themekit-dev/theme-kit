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
  resolveRuntimeOptions,
  createCSSVariablesBinding,
  createDOMBinding,
  type ThemeRuntime,
  type ThemeRuntimeOptions,
  type ThemeDefinition,
  type ThemeTransitionOptions,
} from "@theme-kit/core";
import { THEME_KIT_RUNTIME } from "./tokens";
import { createAngularPersistence, THEME_SELECTION_KEY } from "./persistence";
import { createBlockingScriptContent } from "./blocking-script";

/**
 * Options for {@link provideThemeKit}.
 *
 * Extends the core runtime options with an optional DOM target element. When
 * omitted, the runtime is bound to `document.documentElement`.
 *
 * @see {@link provideThemeKit}
 */
export type ThemeKitProviderOptions = ThemeRuntimeOptions<ThemeDefinition> & {
  /** The DOM element the runtime's DOM and CSS-variable bindings attach to.
   *  Defaults to `document.documentElement`. */
  target?: HTMLElement;
};

/**
 * Provides a Theme Kit runtime for the current Angular environment injector.
 *
 * Call this once at the application root (or a feature environment) to create
 * the runtime, wire up Angular persistence, and register environment
 * initializers that bind the runtime to the DOM and CSS variables in the
 * browser and emit the blocking bootstrap script during server-side rendering.
 *
 * May be called from an Angular injection context. Returns an
 * `EnvironmentProviders` value intended for the `providers` array of a
 * standalone component, route, or `bootstrapApplication`.
 *
 * @param options Runtime configuration and the optional DOM binding target.
 * @returns An `EnvironmentProviders` value that provides the runtime.
 *
 * @example
 * ```ts
 * import { provideThemeKit } from "@theme-kit/angular";
 * import { getBuiltInThemes } from "@theme-kit/core";
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideThemeKit({ themes: getBuiltInThemes(), defaultTheme: "light" }),
 *   ],
 * });
 * ```
 *
 * @see {@link provideThemeKitRuntime}
 * @see {@link injectThemeRuntime}
 * @see {@link ThemeKitProviderOptions}
 */
export function provideThemeKit(
  options: ThemeKitProviderOptions = {},
): EnvironmentProviders {
  const { target, ...runtimeOptions } = options;

  // Resolve the transition option the same way the React/Vue providers do so
  // that `transition: { enabled: false }` (or `false`) properly disables
  // transitions in the DOM + CSS variable bindings.
  const transitionOption = runtimeOptions.transition;
  const resolvedTransition: ThemeTransitionOptions | undefined =
    transitionOption === undefined
      ? undefined
      : typeof transitionOption === "object"
        ? transitionOption
        : transitionOption === true
          ? {}
          : { enabled: false };

  const providers: Provider[] = [
    {
      provide: THEME_KIT_RUNTIME,
      useFactory: () => {
        const persistence = createAngularPersistence();
        return createThemeRuntime({
          // Merges the configuration a build integration transported under
          // these options, so a provider called with no `themes` still has a
          // registry. The factory runs on first injection, which is after the
          // bootstrap script has published the global.
          ...resolveRuntimeOptions(runtimeOptions),
          ...(resolvedTransition !== undefined
            ? { transition: resolvedTransition }
            : {}),
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
          createDOMBinding(runtime.store, {
            target: el,
            ...(resolvedTransition !== undefined
              ? { transition: resolvedTransition }
              : {}),
          });
          createCSSVariablesBinding(runtime.store, {
            target: el,
            ...(resolvedTransition !== undefined
              ? { transition: resolvedTransition }
              : {}),
          });
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

/**
 * Provides an existing Theme Kit runtime for the current Angular environment
 * injector.
 *
 * Use this when you already have a runtime instance (for example, created
 * outside Angular or shared across environments) and want to expose it through
 * the {@link THEME_KIT_RUNTIME} token. Unlike {@link provideThemeKit}, it does
 * not create bindings or persistence.
 *
 * May be called from an Angular injection context. Returns an
 * `EnvironmentProviders` value intended for the `providers` array.
 *
 * @param runtime The runtime instance to provide.
 * @returns An `EnvironmentProviders` value that provides the runtime.
 *
 * @see {@link provideThemeKit}
 * @see {@link injectThemeRuntime}
 */
export function provideThemeKitRuntime(
  runtime: ThemeRuntime<ThemeDefinition>,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: THEME_KIT_RUNTIME, useValue: runtime },
  ]);
}
