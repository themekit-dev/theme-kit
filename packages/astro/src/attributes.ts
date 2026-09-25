/**
 * The DOM contract shared between the Astro components, the pre-paint bootstrap
 * and the browser controller.
 *
 * @remarks
 * These live in their own module so the two browser entries (`./runtime`) and
 * the component implementations agree on one literal each, rather than on a
 * string typed out three times. A typo in any one of them is silent: the
 * attribute simply never matches, and the element keeps the server-rendered
 * value — which is the "label fluctuates on reload" symptom this contract exists
 * to remove.
 */

/**
 * Opts an element into the **bootstrap readout** contract: its text is owned by
 * Theme Kit.
 *
 * @remarks
 * `data-tk-readout="theme" | "mode" | "family"` — or
 * `data-tk-readout="var:--theme-color-primary"` to display a resolved CSS
 * variable. The pre-paint bootstrap patches the element from `<head>`, before
 * the body is parsed, so the text is never painted with the server's guess and
 * then corrected; `getThemeController()` keeps it in sync from then on.
 *
 * Put it on its own element — the whole `textContent` is replaced, exactly as
 * React's `<ThemeReadout />` renders a `<span>` whose only child is the value.
 *
 * @see {@link THEME_TOGGLE_ATTRIBUTE}
 */
export const THEME_READOUT_ATTRIBUTE = "data-tk-readout";

/**
 * Marks an element as a Theme Kit theme toggle.
 *
 * @remarks
 * `<ThemeToggle />` sets it, and the component's bundled script delegates clicks
 * from any element that carries it. Delegation rather than a per-element
 * listener is what makes the attribute the whole contract: an application can
 * render its own `<button data-tk-toggle>` and get the behaviour without
 * importing the component, and a toggle added later by client-side navigation
 * still works.
 *
 * @see {@link THEME_READOUT_ATTRIBUTE}
 */
export const THEME_TOGGLE_ATTRIBUTE = "data-tk-toggle";
