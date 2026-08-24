import { type ThemeDefinition } from "@theme-kit/core";
import { findProviderRuntime } from "./utils";

export class ThemeKitSelect extends HTMLElement {
  static observedAttributes = ["type"];

  private unsubscribe: (() => void) | null = null;
  private selectEl: HTMLSelectElement | null = null;
  private selectType: "mode" | "family" = "mode";

  connectedCallback() {
    this.selectType =
      (this.getAttribute("type") as "mode" | "family") ?? "mode";

    const runtime = findProviderRuntime(this);
    if (!runtime) {
      this.addEventListener("theme-ready", () => this.init(), { once: true });
      return;
    }

    this.init();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.selectEl?.removeEventListener("change", this.handleChange);
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ) {
    if (name === "type" && newValue) {
      this.selectType = newValue as "mode" | "family";
      if (this.isConnected) {
        this.init();
      }
    }
  }

  private init() {
    const runtime = findProviderRuntime(this);
    if (!runtime) return;

    if (this.selectEl) {
      this.selectEl.removeEventListener("change", this.handleChange);
      this.selectEl.remove();
    }

    this.selectEl = document.createElement("select");
    this.selectEl.addEventListener("change", this.handleChange);

    if (this.selectType === "mode") {
      this.populateModes(runtime);
    } else {
      this.populateFamilies(runtime);
    }

    this.appendChild(this.selectEl);
  }

  private populateModes(
    runtime: NonNullable<ReturnType<typeof findProviderRuntime>>,
  ) {
    if (!this.selectEl) return;

    const currentMode = runtime.selection.getMode();
    const modes = ["system", "light", "dark"];

    this.selectEl.innerHTML = "";
    for (const mode of modes) {
      const option = document.createElement("option");
      option.value = mode;
      option.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
      if (mode === currentMode) option.selected = true;
      this.selectEl.appendChild(option);
    }
  }

  private populateFamilies(
    runtime: NonNullable<ReturnType<typeof findProviderRuntime>>,
  ) {
    if (!this.selectEl) return;

    const seen = new Set<string>();
    const families: string[] = [];

    for (const t of runtime.themes) {
      const f = (t.meta?.family as string | undefined);
      if (f && !seen.has(f)) {
        seen.add(f);
        families.push(f);
      }
    }

    const currentFamily = runtime.selection.getFamily();

    this.selectEl.innerHTML = "";
    for (const family of families) {
      const option = document.createElement("option");
      option.value = family;
      option.textContent = family;
      if (family === currentFamily) option.selected = true;
      this.selectEl.appendChild(option);
    }
  }

  private handleChange = () => {
    if (!this.selectEl) return;
    const runtime = findProviderRuntime(this);
    if (!runtime) return;

    const value = this.selectEl.value;

    if (this.selectType === "mode") {
      runtime.selection.setMode(value as "light" | "dark" | "system");
    } else {
      runtime.selection.setFamily(value);
    }
  };

  static define(tag = "theme-kit-select") {
    if (!customElements.get(tag)) {
      customElements.define(tag, ThemeKitSelect);
    }
  }
}
