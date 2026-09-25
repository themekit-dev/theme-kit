import type { ThemeSelectionState } from "../../model";
import type { ThemeTransitionOptions } from "../../transition";

/**
 * The selection source {@link DOMBindingOptions.selection} accepts.
 *
 * @remarks
 * A structural type rather than the selection controller itself, so the DOM
 * binding does not have to import the controller module (and so a caller can
 * supply any object with the same shape).
 */
export interface DOMSelectionSource {
  getSelection(): ThemeSelectionState;
  subscribe(listener: (selection: ThemeSelectionState) => void): () => void;
}

/**
 * Options for {@link createDOMBinding}.
 *
 * The binding syncs the store theme to the DOM — `data-theme`,
 * `data-theme-mode`, `data-theme-family`, the `dark` class and the
 * `color-scheme` style — with optional transition support. It requires a
 * target element; when none is available the binding is not created.
 */
export interface DOMBindingOptions {
  /** Element to apply the theme attributes/classes to.
   *  @defaultValue `document.documentElement` (when present) */
  target?: HTMLElement;
  /** Attribute name used to expose the theme name.
   *  @defaultValue `"data-theme"` */
  attributeName?: string;
  /** Transition applied when the theme changes. When omitted, changes are
   *  applied instantly. */
  transition?: ThemeTransitionOptions;
  /** Subscribe to the store on its own. Default `true`; disable when the
   *  owner (e.g. the CSS-variables binding) drives DOM updates through its
   *  transition pipeline instead.
   *  @defaultValue `true`
   *
   *  @remarks
   *  Disabling this is what keeps a theme change **atomic**. When the
   *  CSS-variables binding applies inline variables it owns a single
   *  `document.startViewTransition`, and that API runs its update callback in a
   *  *later task*. A binding that subscribed to the store itself would write
   *  `data-theme` / `data-theme-mode` / `data-theme-family` / the `dark` class
   *  / `color-scheme` in the current task, while the `--theme-*` variables
   *  landed in the callback's task.
   *
   *  A paint landing in that window shows the new identity over the old
   *  palette: the document declares one theme while the page still renders the
   *  other, so a `[data-tk-readout]` label and the colours behind it disagree.
   *  Whether a frame actually lands there depends on the compositor, which is
   *  why the symptom is intermittent rather than reproducible on every change.
   *
   *  Pass `false` **only** together with a co-binding that calls the binding's
   *  `apply` from `onBeforeSwap`, so both writes share one commit point.
   *  `data-theme-selection-*` keeps its own subscription either way.
   */
  subscribe?: boolean;
  /**
   * Mirrors the visitor's **selection** onto `data-theme-selection-mode` and
   * `data-theme-selection-family`. When omitted, neither attribute is written.
   *
   * @remarks
   * The resolved attributes above cannot express the selection: a `"system"`
   * selection is resolved to `"light"`/`"dark"` before `data-theme-mode` is
   * written, so the choice is unrecoverable from them. The pre-paint bootstrap
   * and the SSR layouts therefore publish the selection separately — and
   * *nothing maintained it afterwards*, so after the first client-side change
   * the document claimed a selection the visitor no longer had. Anything reading
   * `data-theme-selection-mode` — CSS, a framework-free control,
   * `readBootstrapState` — was reading the state of the page as it was loaded.
   *
   * Subscribing to the selection (rather than deriving it from the store) is
   * also required for correctness: `setMode("light")` while the OS preference
   * is already light resolves to the same theme and emits **no** store change,
   * so a store-only binding would never run.
   *
   * @see {@link DOMSelectionSource}
   */
  selection?: DOMSelectionSource | null;
}
