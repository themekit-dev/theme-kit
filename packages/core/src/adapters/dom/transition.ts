import {
  DEFAULT_THEME_TRANSITION,
  type ThemeTransitionOptions,
} from "../../transition";

const cleanupTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();
const transitionNodes = new WeakMap<HTMLElement, HTMLStyleElement>();
const propertyRegistrationNodes = new WeakMap<HTMLElement, HTMLStyleElement>();
const registeredVariables = new WeakMap<HTMLElement, Map<string, string>>();
const transitionInitialized = new WeakSet<HTMLElement>();

function isColorValue(value: string): boolean {
  return (
    value.startsWith("#") ||
    value.startsWith("rgb") ||
    value.startsWith("hsl") ||
    value.startsWith("rgba") ||
    value.startsWith("hsla") ||
    value.startsWith("oklch") ||
    value.startsWith("lab") ||
    /^(aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|purple|red|silver|teal|white|yellow|currentcolor|inherit|transparent)/i.test(
      value,
    ) ||
    value.includes("var(--")
  );
}

function rebuildPropertyStylesheet(target: HTMLElement): void {
  const node = propertyRegistrationNodes.get(target);
  if (!node) return;
  const map = registeredVariables.get(target);
  if (!map || map.size === 0) {
    node.textContent = "";
    return;
  }
  const rules = [...map.entries()]
    .map(([name, val]) => {
      const syntax = isColorValue(val) ? "<color>" : "<length>";
      return `@property ${name} { syntax: "${syntax}"; inherits: true; initial-value: ${val}; }`;
    })
    .join("\n");
  node.textContent = rules + "\n";
}

function registerCSSProperty(
  target: HTMLElement,
  variableName: string,
  value: string,
): void {
  const map = registeredVariables.get(target);
  const existing = map?.get(variableName);
  if (existing === value) {
    return;
  }

  if (!map) {
    registeredVariables.set(target, new Map());
  }
  registeredVariables.get(target)!.set(variableName, value);

  if (typeof document === "undefined" || !document.head) {
    return;
  }

  let node = propertyRegistrationNodes.get(target);
  if (!node) {
    node = document.createElement("style");
    node.setAttribute("data-theme-kit-property-registration", "");
    document.head.appendChild(node);
    propertyRegistrationNodes.set(target, node);
  }

  rebuildPropertyStylesheet(target);
}

/**
 * Register all color CSS custom properties with @property ONCE at initialization.
 * This makes them animatable so the browser can interpolate between values
 * when they change on :root. Since they inherit, all descendants using
 * var(--theme-color-*) automatically animate without needing transitions
 * on every element.
 */
export function registerThemeProperties(
  target: HTMLElement,
  variables: Record<string, string>,
  prefix: string,
): void {
  if (transitionInitialized.has(target)) return;
  
  const colorPrefix = `--${prefix}color-`;
  for (const [variable, value] of Object.entries(variables)) {
    if (variable.startsWith(colorPrefix) && value !== undefined) {
      registerCSSProperty(target, variable, value);
    }
  }
  
  transitionInitialized.add(target);
}

/**
 * Begin a theme transition on `target`.
 * 
 * Applies transition ONLY to :root. The @property-registered custom
 * properties inherit, so all descendant elements using var(--theme-color-*)
 * will smoothly animate when the root values change.
 */
export function applyThemeTransition(
  target: HTMLElement,
  options?: ThemeTransitionOptions,
  suppressTransition?: boolean,
): void {
  const transition = {
    ...DEFAULT_THEME_TRANSITION,
    ...options,
  };

  if (!transition.enabled || suppressTransition) {
    return;
  }

  // Respect reduced-motion preferences out of the box: theme colors switch
  // instantly instead of animating, so the smooth transition never triggers
  // vestibular discomfort.
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const supportsViewTransition =
    typeof document !== "undefined" && "startViewTransition" in document;
  if (transition.useViewTransition && supportsViewTransition) {
    return;
  }

  const duration = `${transition.duration}ms`;
  const easing = transition.easing;
  // The theme colors are delivered through `@property`-registered custom
  // properties (`--theme-color-*`). Those only interpolate when they appear in
  // the element's `transition-property` list, so the list is exactly the
  // registered variables — nothing more.
  //
  // Do NOT include the string preset list (color, background, border-color,
  // box-shadow, opacity, …) here. Descendants already use `var(--theme-*)` for
  // those properties, and giving <html> a direct transition on them at the same
  // time makes every element run its OWN transition on top of the inherited
  // animation each frame — a double-ease feedback loop that turns smooth theme
  // switches into laggy, increasingly jittery ones.
  const registered = registeredVariables.get(target);
  const vars = registered ? [...registered.keys()] : [];
  const props =
    vars.length > 0
      ? vars
      : (transition.properties ?? DEFAULT_THEME_TRANSITION.properties);
  const list = props.map((prop) => `${prop} ${duration} ${easing}`).join(", ");

  const pending = cleanupTimers.get(target);
  if (pending) clearTimeout(pending);

  // Apply transition directly to :root (the target element)
  // The @property-registered custom properties will animate their
  // computed values on all descendants that use them.
  target.style.setProperty("transition", list);

  // Write the `:root { transition }` rule ONLY when its content changes.
  // Rewriting a <style> element's textContent invalidates the whole
  // stylesheet and forces a full-document style recalc, so rewriting it on
  // every toggle piles a global recalc on top of the running animation — that
  // accumulation is what makes rapid toggling jankier and jankier.
  if (typeof document !== "undefined" && document.head) {
    let node = transitionNodes.get(target);
    if (!node) {
      node = document.createElement("style");
      node.setAttribute("data-theme-kit-transition", "");
      document.head.appendChild(node);
      transitionNodes.set(target, node);
    }
    const css = `:root { transition: ${list}; }`;
    if (node.textContent !== css) {
      node.textContent = css;
    }
  }

  cleanupTimers.set(
    target,
    setTimeout(
      () => removeThemeTransition(target),
      (transition.duration ?? DEFAULT_THEME_TRANSITION.duration) + 100,
    ),
  );
}

export function removeThemeTransition(target: HTMLElement) {
  const pending = cleanupTimers.get(target);
  if (pending) clearTimeout(pending);

  cleanupTimers.delete(target);

  // Keep the style element persistent - just clear its content
  // so we don't trigger reflows on next transition
  const node = transitionNodes.get(target);
  if (node) {
    node.textContent = "";
  }

  target.style.removeProperty("transition");
}

/** Registered `--theme-color-*` custom properties for `target` (set by
 *  `registerThemeProperties`). Used by the Animation Coordinator to build the
 *  `:root` transition so every descendant animates by inheritance. */
export function getRegisteredVariableList(target: HTMLElement): string[] {
  const map = registeredVariables.get(target);
  return map ? [...map.keys()] : [];
}

export { registerCSSProperty, isColorValue };