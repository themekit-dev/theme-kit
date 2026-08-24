import {
  themeToCSSVariables,
  createScopedThemeBinding,
  type ThemeDefinition,
  type ThemeTransitionOptions,
} from "@theme-kit/core";
import { findProviderRuntime } from "./utils";

export class ThemeKitScope extends HTMLElement {
  static observedAttributes = ["theme", "theme-transition"];

  private binding: { destroy(): void } | null = null;
  private currentTheme: string | null = null;
  private currentTransition: ThemeTransitionOptions | undefined = undefined;

  connectedCallback() {
    this.currentTheme = this.getAttribute("theme");
    this.currentTransition = this.parseTransition(
      this.getAttribute("theme-transition"),
    );
    if (this.currentTheme) {
      this.applyScope();
    }
  }

  disconnectedCallback() {
    this.destroyBinding();
  }

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
    if (!customElements.get(tag)) {
      customElements.define(tag, ThemeKitScope);
    }
  }
}
