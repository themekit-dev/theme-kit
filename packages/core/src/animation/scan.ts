/**
 * DOM Scanner.
 *
 * Walks the DOM with a TreeWalker (never `*`) to find the elements that
 * actually need a transition for the planned CSS properties, so we attach
 * inline transitions to a targeted subset instead of the whole page.
 *
 * Skipped:
 *  - invisible / hidden elements (display:none, visibility:hidden, opacity:0,
 *    content-visibility skipping),
 *  - the document/body (handled at the root),
 *  - overlay scrollbar internals,
 *  - elements whose style already carries the transition (between runs).
 *
 * "Needs animation?" is answered from computed style: an element only needs a
 * transition on a property it actually sets to a non-initial value.
 */

interface PropertyCheck {
  has: (cs: CSSStyleDeclaration) => boolean;
}

// Longhands (getComputedStyle cannot read shorthands) mapped to their CSS
// initial value. An element "needs animation" on a property when its computed
// longhand differs from the initial value (i.e. it genuinely uses the property).
const SHORTHAND_CHECKS: Record<string, () => PropertyCheck> = {
  padding: () =>
    everyOneOf(
      ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
      "0px",
    ),
  margin: () =>
    everyOneOf(["marginTop", "marginRight", "marginBottom", "marginLeft"], "0px"),
  "border-radius": () => oneOf(["borderRadius"], "0px"),
  gap: () => oneOf(["gap"], "normal"),
  "row-gap": () => oneOf(["rowGap"], "normal"),
  "column-gap": () => oneOf(["columnGap"], "normal"),
  "scroll-padding": () =>
    everyOneOf(
      [
        "scrollPaddingTop",
        "scrollPaddingRight",
        "scrollPaddingBottom",
        "scrollPaddingLeft",
      ],
      "auto",
    ),
  "scroll-margin": () =>
    everyOneOf(
      [
        "scrollMarginTop",
        "scrollMarginRight",
        "scrollMarginBottom",
        "scrollMarginLeft",
      ],
      "0px",
    ),
  "font-size": () => oneOf(["fontSize"], "16px"),
  "line-height": () => oneOf(["lineHeight"], "normal"),
  "letter-spacing": () => oneOf(["letterSpacing"], "normal"),
  "word-spacing": () => oneOf(["wordSpacing"], "normal"),
  "text-indent": () => oneOf(["textIndent"], "0px"),
  "font-weight": () => oneOf(["fontWeight"], "400"),
  "text-shadow": () => oneOf(["textShadow"], "none"),
  "box-shadow": () => oneOf(["boxShadow"], "none"),
  filter: () => oneOf(["filter"], "none"),
  "backdrop-filter": () => oneOf(["backdropFilter"], "none"),
  "border-width": () =>
    everyOneOf(
      [
        "borderTopWidth",
        "borderRightWidth",
        "borderBottomWidth",
        "borderLeftWidth",
      ],
      "0px",
    ),
  "outline-width": () => oneOf(["outlineWidth"], "0px"),
};

function oneOf(keys: string[], initial: string): PropertyCheck {
  const key = keys[0]!;
  return {
    has(cs) {
      const value = (cs as unknown as Record<string, string>)[key];
      return value !== initial && value !== "";
    },
  };
}

function everyOneOf(keys: string[], initial: string): PropertyCheck {
  return {
    has(cs) {
      const record = cs as unknown as Record<string, string>;
      return keys.some((k) => record[k] !== initial && record[k] !== "");
    },
  };
}

function needsAnimation(
  cs: CSSStyleDeclaration,
  properties: string[],
): boolean {
  for (const prop of properties) {
    const maker = SHORTHAND_CHECKS[prop];
    if (!maker) return true; // unknown property → be safe and attach
    if (maker().has(cs)) return true;
  }
  return false;
}

function isVisible(cs: CSSStyleDeclaration): boolean {
  if (cs.display === "none") return false;
  if (cs.visibility === "hidden" || cs.visibility === "collapse") return false;
  const opacity = parseFloat(cs.opacity);
  if (!Number.isNaN(opacity) && opacity === 0) return false;
  if (cs.contentVisibility === "hidden") return false;
  return true;
}

/**
 * Collect elements that both (a) are visible and (b) actually use one of the
 * provided CSS properties. Runs only when non-color groups are animating.
 */
export function scanForTransition(
  root: Node,
  properties: string[],
): HTMLElement[] {
  const result: HTMLElement[] = [];
  if (properties.length === 0) return result;
  if (typeof document === "undefined" || typeof NodeFilter === "undefined") {
    return result;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let node = walker.nextNode();
  while (node) {
    const el = node as HTMLElement;
    if (
      el.nodeType === 1 &&
      el !== root &&
      !el.hasAttribute("data-theme-kit-host")
    ) {
      const cs = getComputedStyle(el);
      if (isVisible(cs) && needsAnimation(cs, properties)) {
        result.push(el);
      }
    }
    node = walker.nextNode();
  }
  return result;
}