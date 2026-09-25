import { type ThemeDefinition } from "@theme-kit/core";
import { findProviderRuntime } from "./utils";
import { CustomElementBase } from "./custom-element-base";

/**
 * Custom element `<theme-kit-select>` that renders a `<select>` for choosing
 * the theme mode or family.
 *
 * Framework-free (vanilla JS). When the `type` attribute is `mode` (default),
 * it lists `system`, `light`, and `dark`; when `family`, it lists the theme
 * families from the provider's registry. Changing the selection updates the
 * provider's selection. Observes the `type` attribute.
 *
 * @remarks
 * Requires an ancestor `<theme-kit-provider>`. If the provider is not yet
 * initialized, it waits for the `theme-ready` event.
 *
 * @example
 * ```html
 * <theme-kit-select type="mode"></theme-kit-select>
 * ```
 *
 * @see {@link defineCustomElements}
 * @see {@link ThemeKitProvider}
 */
export class ThemeKitSelect extends CustomElementBase {
  static observedAttributes = ["type"];

  private unsubscribe: (() => void) | null = null;
  private selectEl: HTMLSelectElement | null = null;
  private selectType: "mode" | "family" = "mode";

  /** Lifecycle hook: initializes the select when connected. */
  connectedCallback() {
    this.selectType =
      (this.getAttribute("type") as "mode" | "family") ?? "mode";

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

  /** Lifecycle hook: unsubscribes and removes the change listener. */
  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.selectEl?.removeEventListener("change", this.handleChange);
  }

  /** Lifecycle hook: re-initializes the select when the `type` attribute changes. */
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
    // SSR-safe: customElements only exists in the browser. Framework wrappers
    // (Vue, Solid, Angular, Astro, …) call define() from both server and client
    // environments, so this must be a no-op on the server.
    if (typeof customElements === "undefined") return;
    if (!customElements.get(tag)) {
      customElements.define(tag, ThemeKitSelect);
    }
  }
}
