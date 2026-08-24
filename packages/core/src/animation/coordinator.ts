import { getRegisteredVariableList } from "../adapters/dom/transition";
import { scanForTransition } from "./scan";
import type { ThemeAnimationInput } from "./types";

/**
 * Animation Coordinator.
 *
 * Owns the visual-update sequence for a theme change so the whole page moves
 * through the same optimized pipeline — no partial paints, no layout
 * thrashing, no "some things animate, some things snap":
 *
 *   1. Attach the transition to `:root` (registered theme custom properties,
 *      so every `var(--theme-color-*)` descendant animates by inheritance)
 *      and to the scanned elements that use the non-color properties that
 *      changed.
 *   2. Flush so the browser commits the *old* values with the transitions in
 *      place (this is what makes it interpolate instead of snapping).
 *   3. Swap the CSS variables on the next animation frame — one batched write.
 *   4. Remove every temporary transition only after the longest active one
 *      finishes.
 *
 * A new theme change cancels the previous run (removing its transitions and
 * timers) before starting, so rapid toggling never stacks animation loops —
 * the root cause of "the more I toggle, the jankier it gets".
 */

interface ActiveRun {
  target: HTMLElement;
  elements: Set<HTMLElement>;
  previous: Map<HTMLElement, { property: string; duration: string; easing: string }>;
  raf: number;
  timer: ReturnType<typeof setTimeout> | null;
}

const activeRuns = new WeakMap<HTMLElement, ActiveRun>();

const ROOT_TRANSITION_NODES = new WeakMap<HTMLElement, HTMLStyleElement>();
const SUPPRESSION_NODES = new WeakMap<HTMLElement, HTMLStyleElement>();

function ensureRootTransitionStyle(target: HTMLElement, list: string): void {
  if (typeof document === "undefined" || !document.head) return;
  let node = ROOT_TRANSITION_NODES.get(target);
  if (!node || !node.isConnected) {
    node = document.createElement("style");
    node.setAttribute("data-theme-kit-transition", "");
    document.head.appendChild(node);
    ROOT_TRANSITION_NODES.set(target, node);
  }
  // Rewrite only when the rule changes; the registered variable set is stable
  // after initialization, so this is effectively a single write per document.
  const css = `:root { transition: ${list}; }`;
  if (node.textContent !== css) {
    node.textContent = css;
  }
}

/**
 * Persistently installed, content-stable stylesheet that mutes every descendant
 * transition while a theme animation is running. It's a single static rule and
 * is toggled purely through the presence of `data-theme-kit-animating` on the
 * root — never rewritten per toggle, so it avoids the per-toggle style-recalc
 * the coordinator is designed to prevent.
 *
 * Why: theme colors animate on `:root` via the registered `--theme-color-*`
 * custom properties and inherit into every descendant. Any element that ALSO
 * has its own background/border/color transition (e.g. Tailwind's
 * `transition-colors`/`transition-all`, button hover styles) re-eases those
 * same resolved colors each frame on top of the inherited interpolation — a
 * double-ease feedback loop that makes borders/cards chase the moving values
 * and wash through lighter (white-ish) intermediates. Killing descendant
 * transitions for the short window the swap is animating guarantees colors
 * update purely from the smooth inherited interpolation.
 */
function ensureSuppressionStyle(target: HTMLElement): void {
  if (typeof document === "undefined" || !document.head) return;
  let node = SUPPRESSION_NODES.get(target);
  if (!node || !node.isConnected) {
    node = document.createElement("style");
    node.setAttribute("data-theme-kit-animating-style", "");
    // Matches every descendant of the animated root, never the root itself, so
    // the `:root` custom-property transition keeps working while descendants are
    // quieted. Element transitions the coordinator intentionally adds are set
    // inline with `!important`, which outranks this stylesheet rule.
    node.textContent =
      "[data-theme-kit-animating] :not([data-theme-kit-animating]) { transition: none !important; }";
    document.head.appendChild(node);
    SUPPRESSION_NODES.set(target, node);
  }
}

function setAnimatingAttribute(target: HTMLElement, on: boolean): void {
  if (on) {
    target.setAttribute("data-theme-kit-animating", "");
  } else {
    target.removeAttribute("data-theme-kit-animating");
  }
}

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function cleanup(run: ActiveRun): void {
  for (const [el, prev] of run.previous) {
    if (prev.property !== "") {
      el.style.setProperty("transition-property", prev.property);
    } else {
      el.style.removeProperty("transition-property");
    }
    if (prev.duration !== "") {
      el.style.setProperty("transition-duration", prev.duration);
    } else {
      el.style.removeProperty("transition-duration");
    }
    if (prev.easing !== "") {
      el.style.setProperty("transition-timing-function", prev.easing);
    } else {
      el.style.removeProperty("transition-timing-function");
    }
  }
  run.previous.clear();
  run.elements.clear();

  // The root's transition is a permanent stylesheet rule (see
  // ensureRootTransitionStyle); the inline form is only removed here so the
  // stylesheet rule alone stays authoritative between runs.
  run.target.style.removeProperty("transition");

  // Re-enable descendant transitions now that the swap has settled.
  setAnimatingAttribute(run.target, false);
}

function cancelActive(target: HTMLElement): void {
  const run = activeRuns.get(target);
  if (!run) return;
  if (run.raf !== 0) cancelAnimationFrame(run.raf);
  if (run.timer) clearTimeout(run.timer);
  cleanup(run);
  activeRuns.delete(target);
}

/**
 * Run the animation for one theme change. Called by the CSS-variables binding
 * only when the Transition Planner produced a non-null plan.
 */
export function runThemeAnimation(input: ThemeAnimationInput): void {
  const { target, plan } = input;
  cancelActive(target);

  // Double-check reduced motion: if the user prefers it, swap instantly.
  if (reducedMotion()) {
    input.swap();
    return;
  }

  const elements = new Set<HTMLElement>();
  const previous = new Map<
    HTMLElement,
    { property: string; duration: string; easing: string }
  >();

  // Mute every descendant transition for the animation window so only the
  // inherited `@property` interpolation (colors) and the explicitly planned
  // element properties animate — nothing re-eases the same values on top.
  ensureSuppressionStyle(target);
  setAnimatingAttribute(target, true);

  // 1. Colors → transition the registered theme custom properties on the target
  //    (<html> for the global binding, the scope element for a ThemeScope).
  //    The persistent `:root` stylesheet rule is only written for the document
  //    element — a scoped target owns its transition via the inline style so it
  //    never leaks a document-wide rule.
  if (plan.animatesColors) {
    const vars = getRegisteredVariableList(target);
    if (vars.length > 0) {
      const list = vars
        .map((v) => `${v} ${plan.duration}ms ${plan.easing}`)
        .join(", ");
      target.style.setProperty("transition", list);
      if (typeof document !== "undefined" && target === document.documentElement) {
        ensureRootTransitionStyle(target, list);
      }
      elements.add(target);
    }
  }

  // 2. Non-color groups → transition the concrete CSS properties on the
  //    scanned elements that actually use them, scoped to the animated subtree.
  if (plan.elementProperties.length > 0) {
    const props = plan.elementProperties.join(", ");
    for (const el of scanForTransition(target, plan.elementProperties)) {
      previous.set(el, {
        property: el.style.getPropertyValue("transition-property"),
        duration: el.style.getPropertyValue("transition-duration"),
        easing: el.style.getPropertyValue("transition-timing-function"),
      });
      // `!important` so these beat the active `transition: none !important`
      // suppression rule; only the planned properties are re-enabled.
      el.style.setProperty("transition-property", props, "important");
      el.style.setProperty("transition-duration", `${plan.duration}ms`, "important");
      el.style.setProperty("transition-timing-function", plan.easing, "important");
      elements.add(el);
    }
  }

  // 3. Flush old values so the transition starts from the committed state.
  void target.offsetHeight;

  const run: ActiveRun = {
    target,
    elements,
    previous,
    raf: 0,
    timer: null,
  };
  activeRuns.set(target, run);

  // 4. Swap variables in a single frame, then clean up after the longest
  //    transition finishes.
  run.raf = requestAnimationFrame(() => {
    run.raf = 0;
    input.swap();
    run.timer = setTimeout(() => {
      run.timer = null;
      cleanup(run);
      if (activeRuns.get(target) === run) activeRuns.delete(target);
    }, plan.duration + (input.buffer ?? 100));
  });
}

/** Abort any in-flight theme animation for `target` and remove its styles. */
export function cancelThemeAnimation(target: HTMLElement): void {
  cancelActive(target);
}