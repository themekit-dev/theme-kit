import { findProviderRuntime } from "./utils";

export class ThemeKitToggle extends HTMLElement {
  private unsubscribe: (() => void) | null = null;

  connectedCallback() {
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
  }

  private init() {
    const runtime = findProviderRuntime(this);
    if (!runtime) return;

    this.setAttribute("role", "button");
    this.setAttribute("tabindex", "0");

    this.updateText(runtime.selection.getMode());

    this.unsubscribe = runtime.store.subscribe(() => {
      this.updateText(runtime.selection.getMode());
    });

    this.addEventListener("click", this.handleClick);
    this.addEventListener("keydown", this.handleKeydown);
  }

  private handleClick = () => {
    const runtime = findProviderRuntime(this);
    if (!runtime) return;
    const next =
      runtime.selection.getMode() === "dark" ? "light" : "dark";
    runtime.selection.setMode(next);
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.handleClick();
    }
  };

  private updateText(mode: string) {
    if (!this.textContent?.trim()) {
      this.textContent = `Mode: ${mode}`;
    }
    this.setAttribute("data-mode", mode);
  }

  static define(tag = "theme-kit-toggle") {
    if (!customElements.get(tag)) {
      customElements.define(tag, ThemeKitToggle);
    }
  }
}
