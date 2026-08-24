/**
 * Observers — everything that watches the browser scroll *position* and DOM
 * *size*. Kept intentionally narrow: scroll, resize, MutationObserver. The
 * manager consumes these callbacks, so the browser stays the source of truth
 * for scrolling while this layer only signals the overlay to re-sync.
 */

export interface ObserverHooks {
  /** A hosted scrollable scrolled — prioritise its thumb. */
  onTargetActivity(target: HTMLElement): void;
  /** Any scroll/wheel activity — show all thumbs. */
  onGlobalActivity(): void;
  /** Geometry changed — re-layout + re-render. */
  onResize(): void;
  /** Sibling content changed — re-scan scrollable hosts. The records let the
   *  manager invalidate only the mutated elements' cached scrollability, so
   *  content that grew/shrunk across a navigation is re-measured immediately
   *  instead of waiting for the periodic full recompute. */
  onMutate(records: MutationRecord[]): void;
  /** An element started an `opacity` transition. The manager uses this to
   *  fade a host's strip in sync when its container starts closing — the
   *  `transitionrun` event fires synchronously when the transition starts,
   *  well before the opacity reaches 0 (which is when the visibility check
   *  would finally react). */
  onOpacityTransition(el: HTMLElement): void;
}

export interface WindowControls {
  dispose(): void;
}

function elementOf(target: EventTarget | null): HTMLElement | null {
  if (target && target instanceof HTMLElement && target.nodeType === 1) {
    return target;
  }
  return null;
}

/** @internal */
export function observeScrollbarSizing(
  isHost: (el: HTMLElement) => boolean,
  hooks: ObserverHooks,
): WindowControls {
  function onScrollCapture(e: Event) {
    const el = elementOf(e.target);
    if (el && isHost(el)) hooks.onTargetActivity(el);
    else hooks.onGlobalActivity();
    hooks.onResize();
  }

  function onWheelCapture(e: WheelEvent) {
    let node = elementOf(e.target);
    while (node) {
      if (isHost(node)) {
        hooks.onTargetActivity(node);
        hooks.onResize();
        return;
      }
      node = node.parentElement;
    }
    hooks.onGlobalActivity();
  }

  function onTransitionRun(e: TransitionEvent) {
    if (e.propertyName !== "opacity") return;
    const el = elementOf(e.target);
    if (el) hooks.onOpacityTransition(el);
  }

  // rAF-coalesced content-change signal. React/app code toggles classes/styles
  // at the *start* of an animation (a CSS transition then animates computed
  // sizes without any further DOM mutation). Firing on the next animation frame
  // — instead of a debounced timeout — lets the manager's render loop begin
  // measuring immediately, so the thumb reveals/conceals and tracks the
  // animation without the stale "appears late" lag.
  let scanRaf: number | null = null;
  let pendingRecords: MutationRecord[] = [];

  function requestScan(records?: MutationRecord[]) {
    if (records && records.length) pendingRecords.push(...records);
    if (scanRaf != null) return;
    scanRaf = requestAnimationFrame(() => {
      scanRaf = null;
      const recs = pendingRecords;
      pendingRecords = [];
      hooks.onMutate(recs);
    });
  }

  let mutationObserver: MutationObserver | null = null;
  if (typeof MutationObserver !== "undefined") {
    mutationObserver = new MutationObserver(requestScan);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "dir"],
    });
  }

  function onLoad() {
    requestScan();
  }

  window.addEventListener("scroll", onScrollCapture, { capture: true, passive: true });
  window.addEventListener("resize", hooks.onResize);
  window.addEventListener("wheel", onWheelCapture, { passive: true });
  // `transitionrun` fires synchronously when an opacity transition starts
  // (e.g. a modal/panel closing). Capture phase so we catch it even when the
  // app stops propagation; `transitionend` alone would be too late.
  window.addEventListener("transitionrun", onTransitionRun, { capture: true, passive: true });
  window.addEventListener("load", onLoad);

  return {
    dispose() {
      window.removeEventListener("scroll", onScrollCapture, { capture: true } as any);
      window.removeEventListener("resize", hooks.onResize);
      window.removeEventListener("wheel", onWheelCapture);
      window.removeEventListener("transitionrun", onTransitionRun, { capture: true } as any);
      window.removeEventListener("load", onLoad);
      if (scanRaf != null) cancelAnimationFrame(scanRaf);
      mutationObserver?.disconnect();
    },
  };
}