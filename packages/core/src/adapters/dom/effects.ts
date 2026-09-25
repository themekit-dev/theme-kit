import type { ThemeDefinition } from "../../model";
import { getThemeMode } from "../../model";
import type { ThemeTransitionOptions } from "../../transition";
import { createDOMWriteBatch } from "./batch";
import type { DOMSelectionSource } from "./types";

export interface DOMEffectsOptions {
  target: HTMLElement;
  attributeName: string;
  theme: ThemeDefinition;
  transition?: ThemeTransitionOptions;
  suppressTransition?: boolean;
  /**
   * Selection source for `data-theme-selection-mode` /
   * `data-theme-selection-family`. Omitted → neither attribute is written.
   *
   * @see {@link DOMBindingOptions.selection}
   */
  selection?: DOMSelectionSource | null;
}

export function applyDOMEffects(options: DOMEffectsOptions) {
  // The Animation Coordinator (driven by the CSS-variables binding) owns theme
  // transitions. This binding only flips identity/attributes instantly. When
  // transitions are explicitly disabled or suppressed, inject a `transition:
  // none` override so no residual element transition animates the switch.
  const disableTransitions =
    options.transition?.enabled === false || options.suppressTransition === true;
  let cssNode: HTMLStyleElement | null = null;

  if (disableTransitions && typeof document !== "undefined" && document.head) {
    cssNode = document.createElement("style");
    cssNode.appendChild(
      document.createTextNode(
        `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
      )
    );
    document.head.appendChild(cssNode);
  }

  const batch = createDOMWriteBatch();
  const theme = options.theme;

  batch.setAttribute(options.attributeName, String(theme.name));

  if (theme.meta?.family) {
    batch.setAttribute("data-theme-family", theme.meta.family);
  } else {
    batch.setAttribute("data-theme-family", null);
  }

  if (theme.meta?.mode) {
    batch.setAttribute("data-theme-mode", theme.meta.mode);
  } else {
    batch.setAttribute("data-theme-mode", null);
  }

  // The visitor's selection, which the resolved attributes above cannot express
  // — a `"system"` selection is resolved before `data-theme-mode` is written.
  // Written in the same batch as the resolved attributes so the two can never be
  // observed disagreeing.
  if (options.selection) {
    const selection = options.selection.getSelection();
    batch.setAttribute("data-theme-selection-mode", selection.mode);
    // The bootstrap and the SSR layouts only publish this when a family is
    // known, so mirror that rather than emitting an empty attribute.
    batch.setAttribute(
      "data-theme-selection-family",
      selection.family ?? null,
    );
  }

  batch.toggleClass("dark", getThemeMode(theme) === "dark");

  const mode = getThemeMode(theme);
  if (mode === "light" || mode === "dark") {
    batch.setStyle("color-scheme", mode);
  } else {
    batch.setStyle("color-scheme", null);
  }

  batch.flush(options.target);

  if (cssNode && typeof document !== "undefined" && document.head) {
    if (document.body) {
      void document.body.offsetHeight;
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.head.removeChild(cssNode!);
      });
    });
  }
}
