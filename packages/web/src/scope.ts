import {
  themeToCSSVariables,
  createScopedThemeBinding,
  type ThemeDefinition,
  type ThemeTransitionOptions,
} from "@theme-kit/core";
import { findProviderRuntime } from "./utils";
import { CustomElementBase } from "./custom-element-base";

/**
 * Custom element `<theme-kit-scope>` that applies a scoped theme to its
 * subtree.
 *
 * Framework-free (vanilla JS). Applies the theme named by the `theme`
 * attribute as CSS variables on the element and creates a scoped theme
 * binding, overriding the provider's selection for the subtree. Observes the
 * `theme` and `theme-transition` attributes.
 *
 * @remarks
 * Requires an ancestor `<theme-kit-provider>`. When the `theme` attribute
 * changes, the previous binding is destroyed and recreated.
 *
 * @example
 * ```html
 * <theme-kit-scope theme="brand-dark">...</theme-kit-scope>
 * ```
 *
 * @see {@link defineCustomElements}
 * @see {@link ThemeKitProvider}
 */
export class ThemeKitScope extends CustomElementBase {
  static observedAttributes = ["theme", "theme-transition"];

  private binding: { destroy(): void } | null = null;
  private currentTheme: string | null = null;
  private currentTransition: ThemeTransitionOptions | undefined = undefined;

  /** Lifecycle hook: applies the scoped theme when connected. */
  connectedCallback() {
    this.currentTheme = this.getAttribute("theme");
    this.currentTransition = this.parseTransition(
      this.getAttribute("theme-transition"),
    );
    if (this.currentTheme) {
      this.applyScope();
    }
  }

  /** Lifecycle hook: destroys the scoped binding. */
  disconnectedCallback() {
    this.destroyBinding();
  }

  /** Lifecycle hook: re-applies the scope when an observed attribute changes. */
  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ) {
    if (name === "theme") {
      this.currentTheme = newValue;
      this.destroyBinding();
      if (this.currentTheme && this.isConnected) {
        this.applyScope();
      }
    } else if (name === "theme-transition") {
      this.currentTransition = this.parseTransition(newValue);
      if (this.currentTheme && this.isConnected) {
        this.applyScope();
      }
    }
  }

  private parseTransition(value: string | null): ThemeTransitionOptions | undefined {
    if (!value) return undefined;
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed.duration === "number" && typeof parsed.easing === "string") {
        return parsed as ThemeTransitionOptions;
      }
    } catch {
      // ignore invalid JSON
    }
    return undefined;
  }

  private applyScope() {
    if (!this.currentTheme) return;

    const runtime = findProviderRuntime(this);
    if (!runtime) return;

    const target = runtime.themes.find(
      (t: ThemeDefinition) => t.name === this.currentTheme,
    );

    if (target) {
      const vars = themeToCSSVariables(target, { prefix: "theme-" });
      for (const [key, value] of Object.entries(vars)) {
        this.style.setProperty(key, value);
      }
    }

    this.destroyBinding();
    this.binding = createScopedThemeBinding(
      runtime.themes as ThemeDefinition[],
      this,
      this.currentTheme,
      this.currentTransition ? { transition: this.currentTransition } : {},
    );
  }

  private destroyBinding() {
    this.binding?.destroy();
    this.binding = null;
  }

  static define(tag = "theme-kit-scope") {
    // SSR-safe: customElements only exists in the browser. Framework wrappers
    // (Vue, Solid, Angular, Astro, …) call define() from both server and client
    // environments, so this must be a no-op on the server.
    if (typeof customElements === "undefined") return;
    if (!customElements.get(tag)) {
      customElements.define(tag, ThemeKitScope);
    }
  }
}
