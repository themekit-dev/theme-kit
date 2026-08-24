import type { ThemeTransitionOptions } from "../../transition";

export interface DOMBindingOptions {
  target?: HTMLElement;
  attributeName?: string;
  transition?: ThemeTransitionOptions;
  /** Subscribe to the store on its own. Default `true`; disable when the
   *  owner (e.g. the CSS-variables binding) drives DOM updates through its
   *  transition pipeline instead. */
  subscribe?: boolean;
}
