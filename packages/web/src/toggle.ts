import { findProviderRuntime } from "./utils";
import { CustomElementBase } from "./custom-element-base";

/**
 * Custom element `<theme-kit-toggle>` that toggles the theme mode.
 *
 * Framework-free (vanilla JS). Renders as a button (role/tabindex set on
 * connect) that toggles the provider's mode between `light` and `dark` on
 * click or Enter/Space. Reflects the current mode in a `data-mode` attribute
 * and updates its text when the mode changes.
 *
 * @remarks
 * Requires an ancestor `<theme-kit-provider>`. If the provider is not yet
 * initialized, it waits for the `theme-ready` event.
 *
 * @example
 * ```html
 * <theme-kit-toggle></theme-kit-toggle>
 * ```
 *
 * @see {@link defineCustomElements}
 * @see {@link ThemeKitProvider}
 */
export class ThemeKitToggle extends CustomElementBase {
  private unsubscribe: (() => void) | null = null;

  /** Lifecycle hook: initializes the toggle when connected. */
  connectedCallback() {
    const runtime = findProviderRuntime(this);
    if (!runtime) {
      // Listen on the document, not on `this`: <theme-kit-provider> dispatches
      // theme-ready on itself with bubbles:true, which travels *up* and can never
      // reach a descendant. A self-listener therefore only fired when the
      // provider happened to initialise first.
      document.addEventListener(
        "theme-ready",
        () => {
          if (this.isConnected) this.init();
        },
        { once: true },
      );
      return;
    }

    this.init();
  }

  /** Lifecycle hook: unsubscribes from the runtime. */
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
    // SSR-safe: customElements only exists in the browser. Framework wrappers
    // (Vue, Solid, Angular, Astro, …) call define() from both server and client
    // environments, so this must be a no-op on the server.
    if (typeof customElements === "undefined") return;
    if (!customElements.get(tag)) {
      customElements.define(tag, ThemeKitToggle);
    }
  }
}
