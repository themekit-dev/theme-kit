import {
  createThemeRuntime,
  getBuiltInThemes,
  type CSSVariablesOptions,
  type DOMBindingOptions,
  type ThemeDefinition,
  type ThemeRuntime,
  type ThemeScheduleOptions,
} from "@theme-kit/core";
import { setProviderRuntime } from "./utils";

export interface ThemeKitProviderProps {
  themes?: readonly ThemeDefinition[];
  defaultTheme?: string;
  scheduled?: ThemeScheduleOptions<ThemeDefinition>;
}

export class ThemeKitProvider extends HTMLElement {
  static observedAttributes = ["themes", "default-theme", "scheduled"];

  private runtime: ThemeRuntime<ThemeDefinition> | null = null;
  private parsedThemes: readonly ThemeDefinition[] = getBuiltInThemes();
  private parsedDefaultTheme: string | undefined;
  private parsedScheduled: ThemeScheduleOptions<ThemeDefinition> | undefined;

  connectedCallback() {
    this.parseAttributes();
    this.initRuntime();
  }

  disconnectedCallback() {
    this.destroyRuntime();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ) {
    if (this.runtime) {
      this.destroyRuntime();
      this.parseAttributes();
      this.initRuntime();
    }
  }

  private parseAttributes() {
    const themesAttr = this.getAttribute("themes");
    if (themesAttr) {
      try {
        this.parsedThemes = JSON.parse(themesAttr) as ThemeDefinition[];
      } catch {
        this.parsedThemes = getBuiltInThemes();
      }
    } else {
      this.parsedThemes = getBuiltInThemes();
    }

    this.parsedDefaultTheme = this.getAttribute("default-theme") ?? undefined;

    const scheduledAttr = this.getAttribute("scheduled");
    if (scheduledAttr) {
      try {
        this.parsedScheduled = JSON.parse(
          scheduledAttr,
        ) as ThemeScheduleOptions<ThemeDefinition>;
      } catch {
        this.parsedScheduled = undefined;
      }
    } else {
      this.parsedScheduled = undefined;
    }
  }

  private initRuntime() {
    this.runtime = createThemeRuntime({
      themes: this.parsedThemes,
      ...(this.parsedDefaultTheme
        ? { defaultTheme: this.parsedDefaultTheme as any }
        : {}),
      ...(this.parsedScheduled ? { scheduled: this.parsedScheduled } : {}),
      dom: {} as DOMBindingOptions,
      cssVariables: {} as CSSVariablesOptions,
    });

    setProviderRuntime(this, this.runtime);

    this.dispatchEvent(
      new CustomEvent("theme-ready", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private destroyRuntime() {
    this.runtime?.destroy();
    this.runtime = null;
  }

  static define(tag = "theme-kit-provider") {
    if (!customElements.get(tag)) {
      customElements.define(tag, ThemeKitProvider);
    }
  }
}
