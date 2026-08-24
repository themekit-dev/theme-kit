import type { ThemeStore } from "../types";
import {
  clamp,
  computeMaxScroll,
  computeThumbSize,
  overscrollFactor,
  toArray,
} from "./calculations";
import { easeAlpha, isSettled, lerp, prefersReducedMotion, FRAME_MS } from "./physics";
import { observeScrollbarSizing } from "./observers";
import type {
  ArrowIcon,
  AxisState,
  Host,
  OverlayScrollbarHandle,
  OverlayScrollbarOptions,
  ScrollbarArrowDir,
  ScrollbarAxis,
  ScrollbarOptionsResolved,
} from "./types";

function resolveOptions(options: OverlayScrollbarOptions): ScrollbarOptionsResolved {
  const thickness = options.thickness ?? 8;
  return {
     autoHide: options.autoHide ?? true,
    autoHideDelay: options.autoHideDelay ?? 900,
    hoverExpand: options.hoverExpand ?? false,
    draggable: options.draggable ?? true,
    clickToJump: options.clickToJump ?? true,
    // Exact tracking by default: the thumb always sits at the exact scroll
    // value (no easing lag). `smooth: true` opts into eased travel.
    smooth: options.smooth ?? false,
    overscroll: options.overscroll ?? true,
    arrows: options.arrows ?? true,
    arrowIcon: options.arrowIcon ?? "",
    arrowUpIcon: options.arrowUpIcon ?? "",
    arrowDownIcon: options.arrowDownIcon ?? "",
    arrowLeftIcon: options.arrowLeftIcon ?? "",
    arrowRightIcon: options.arrowRightIcon ?? "",
    arrowIconRenderer: options.arrowIconRenderer,
    thickness,
    hoverThickness: options.hoverThickness ?? thickness + 4,
    radius: options.radius ?? 999,
    minThumbSize: options.minThumbSize ?? 32,
    offset: options.offset ?? 2,
    trackOpacity: options.trackOpacity ?? 0.32,
    thumbOpacity: options.thumbOpacity ?? 0.92,
    thumbColor: options.thumbColor,
    trackColor: options.trackColor,
    activeThumbColor: options.activeThumbColor,
    thumbHoverColor: options.thumbHoverColor,
    zIndex: options.zIndex,
    duration: options.duration ?? 200,
    animationDuration: options.animationDuration ?? 140,
    axes: options.axes ?? ["vertical", "horizontal"],
    include: toArray(options.include),
    exclude: toArray(options.exclude),
    touch: options.touch ?? false,
    dir: resolveDir(options.dir),
  };
}

function resolveDir(dir: "ltr" | "rtl" | "auto" | undefined): "ltr" | "rtl" {
  if (dir === "ltr" || dir === "rtl") return dir;
  try {
    const d =
      (document.documentElement.getAttribute("dir") ||
        getComputedStyle(document.documentElement).direction ||
        "ltr") as "ltr" | "rtl";
    return d === "rtl" ? "rtl" : "ltr";
  } catch {
    return "ltr";
  }
}

function isCoarsePointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(pointer: coarse)").matches;
  } catch {
    return false;
  }
}

/**
 * True when the document itself can still scroll.
 *
 * Apps lock the page behind a modal / mobile menu the standard way — by
 * setting `body { overflow: hidden }` (or `html`). When locked, the document
 * still reports `scrollHeight > clientHeight`, so without this check the root
 * overlay strip would keep floating over the fixed overlay and produce TWO
 * stacked scrollbars at the same right edge (the docs mobile-nav bug).
 *
 * Overflow follows the size-propagation rule: `<html>` is the viewport
 * scroller unless its `overflow` is `visible` (the initial value), in which
 * case `body`'s overflow is propagated to the viewport instead. `auto` /
 * `scroll` always offer scrolling when content overflows.
 */
function documentCanScroll(): boolean {
  if (typeof document === "undefined") return true;
  try {
    const h = getComputedStyle(document.documentElement).overflowY;
    const b = getComputedStyle(document.body).overflowY;
    if (h === "hidden" || h === "clip") return false;
    if ((h === "visible" || h === "") && (b === "hidden" || b === "clip")) return false;
    return true;
  } catch {
    return true;
  }
}

/** Z-index used for inner scrollables that don't declare their own — below
 *  typical fixed headers (50) and overlay backdrops (60), above page content.
 *  This keeps an inner strip from floating over a sticky navbar. */
const DEFAULT_OVERLAY_Z = 30;

/** Z-index used for the document (page) scrollbar. It must stay above sticky
 *  headers/navbars so the page's own scroll indicator is always visible over
 *  them, yet below full-screen overlay backdrops (60) so it blurs/hides like
 *  the rest of the page when a modal/search opens. */
const DEFAULT_DOCUMENT_OVERLAY_Z = 55;

export type { ScrollbarOptionsResolved };

/** Parse `#rgb` / `#rrggbb` into an `[r,g,b]` tuple, or null. */
function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().replace(/^#/, "");
  if (/^[0-9a-f]{6}$/i.test(m)) {
    const n = parseInt(m, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  if (/^[0-9a-f]{3}$/i.test(m)) {
    const n = parseInt(
      m
        .split("")
        .map((c) => c + c)
        .join(""),
      16,
    );
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  return null;
}

/**
 * Framework-agnostic, theme-aware scrollbar overlay engine.
 *
 * The browser performs all scrolling — this only renders + animates a visual
 * overlay that tracks it, so inertia, touch, wheel, keyboard and accessibility
 * remain native. Colors come from Theme Kit tokens, so the overlay re-themes
 * with the rest of the app (no flashes). It tracks the *document* plus every
 * scrollable element on the page by default (anywhere a native scrollbar would
 * appear); the native track is hidden automatically — no manual CSS required.
 */
export function createOverlayScrollbar(
  store: ThemeStore,
  options: OverlayScrollbarOptions = {},
): OverlayScrollbarHandle | null {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }
  // Touch devices already have excellent native scrollbars. Desktop first.
  if (isCoarsePointer() && !options.touch) {
    // Restore the platform's native scrollbars: undo the bootstrap's
    // `tk-scrollbar` hiding (SSR'd or injected) so coarse-pointer devices keep
    // their native bars when the overlay is intentionally skipped.
    try {
      document.documentElement.classList.remove("tk-scrollbar");
      document.getElementById("tk-scrollbar-style")?.remove();
    } catch { /* ignore */ }
    return null;
  }

  const opts = resolveOptions(options);
  const docEl = document.documentElement;
  const scrollingEl: HTMLElement = (document.scrollingElement as HTMLElement | null) || docEl;

  const reduced = () => prefersReducedMotion();

  /** The overlay should live inside its container's stacking order: use the
   *  container's own `z-index` when it declares one (so a horizontal strip over
   *  a sticky header, or a bar poking above a search overlay's blurred backdrop,
   *  both respect the page's layering), otherwise a modest default. The document
   *  scrollbar is special-cased above headers so the page's own scroll indicator
   *  stays visible. */
  function resolveOverlayZIndex(host: Host): number {
    if (opts.zIndex !== undefined) return opts.zIndex;
    if (host.isRoot) return DEFAULT_DOCUMENT_OVERLAY_Z;
    // The strip is appended to <body> as `position: fixed`, so it lives in the
    // body's stacking context. A scrollable buried inside a high z-index overlay
    // (modal, mobile menu, command palette) often declares no z-index of its
    // own — e.g. an `overflow-y-auto` child of a fixed `z-100` dialog. Reading
    // only the element's own z-index then yields the low DEFAULT_OVERLAY_Z and
    // the strip hides *behind* the overlay that contains it. Walk the positioned
    // ancestors and adopt the highest z-index so the strip stays visible over
    // whatever fixed layer it belongs to.
    let node: HTMLElement | null = host.target;
    let highest = Number.NEGATIVE_INFINITY;
    while (node && node.nodeType === 1) {
      try {
        const cs = getComputedStyle(node);
        if (cs.position !== "static") {
          const z = parseFloat(cs.zIndex);
          if (Number.isFinite(z) && z > highest) highest = z;
        }
      } catch {
        /* ignore */
      }
      if (node === docEl || node === document.body) break;
      node = node.parentElement;
    }
    if (Number.isFinite(highest)) return highest;
    return DEFAULT_OVERLAY_Z;
  }

  const hosts = new Map<HTMLElement, Host>();
  let scrollableCache = new WeakMap<HTMLElement, { v: boolean; h: boolean }>();
  let needsRescan = true;
  let destroyed = false;

  const isRootCandidate = (el: HTMLElement) =>
    el === docEl || el === document.body || el === scrollingEl;

  // ---- theme colors -----------------------------------------------------
  // The overlay uses the ACTIVE theme's colors out of the box: the thumb and
  // arrows take the theme accent (primary → accent → foreground), the track a
  // faint foreground wash — so no manual token configuration is ever needed
  // and the scrollbar stays clearly visible in both light and dark themes.
  //
  // The theme's CSS variables are already applied on <html> by SSR or the
  // client provider *before* the overlay mounts, so we read from them first
  // for an instant pre-applied color — no flash of default gray.
  let base: [number, number, number] = resolveBaseColor(store);

  function readCSSVariableColor(): [number, number, number] | null {
    try {
      const cs = getComputedStyle(docEl);
      const vars = [
        "--theme-color-primary",
        "--theme-color-accent",
        "--theme-color-foreground",
        "--theme-color-text",
      ];
      for (const v of vars) {
        const val = cs.getPropertyValue(v).trim();
        if (val) {
          const rgb = hexToRgb(val);
          if (rgb) return rgb;
        }
      }
    } catch { /* ignore */ }
    return null;
  }

  function resolveBaseColor(s: ThemeStore): [number, number, number] {
    try {
      const theme = s.get() as any;
      const colors =
        theme?.tokens?.colors ??
        theme?.colors ??
        {};
      const candidate =
        colors?.primary ??
        colors?.accent ??
        colors?.foreground ??
        colors?.text;
      const rgb = typeof candidate === "string" ? hexToRgb(candidate) : null;
      if (rgb) return rgb;
    } catch { /* ignore */ }
    // Fall back to CSS variables already applied on <html> — the theme is
    // present as CSS vars from SSR / provider before the overlay mounts.
    const cssVar = readCSSVariableColor();
    if (cssVar) return cssVar;
    return [115, 115, 115];
  }
  const rgba = (a: number) => `rgba(${base[0]}, ${base[1]}, ${base[2]}, ${a})`;
  const thumbColor = (a: number) => `var(--tk-scrollbar-thumb, ${rgba(a)})`;
  const trackColor = () => `var(--tk-scrollbar-track, ${rgba(0.22)})`;

  const storeUnsubscribe = store.subscribe(() => {
    base = resolveBaseColor(store);
    for (const host of hosts.values()) {
      if (host.vertical) paintAxis(host.vertical);
      if (host.horizontal) paintAxis(host.horizontal);
    }
    requestRender();
  });

  function paintAxis(state: AxisState) {
    state.thumb.style.background = thumbColor(0.9);
    state.track.style.background = trackColor();
    // Arrows carry no background — just a themed glyph, sized to the strip.
    state.btnTop.style.background = "transparent";
    state.btnBottom.style.background = "transparent";
    state.btnTop.style.color = thumbColor(0.9);
    state.btnBottom.style.color = thumbColor(0.9);
  }

  // ---- geometry helpers -------------------------------------------------
  const scrollTopOf = (host: Host) =>
    host.isRoot ? scrollingEl.scrollTop : host.target.scrollTop;
  const scrollLeftOf = (host: Host) =>
    host.isRoot ? scrollingEl.scrollLeft : host.target.scrollLeft;
  const contentLenOf = (host: Host) =>
    host.isRoot ? scrollingEl.scrollHeight : host.target.scrollHeight;
  const contentWidthOf = (host: Host) =>
    host.isRoot ? scrollingEl.scrollWidth : host.target.scrollWidth;
  const clientLenOf = (host: Host, vertical: boolean) =>
    vertical
      ? host.isRoot ? window.innerHeight : host.target.clientHeight
      : host.isRoot ? window.innerWidth : host.target.clientWidth;
  const maxScroll = (host: Host, vertical: boolean) =>
    computeMaxScroll(vertical ? contentLenOf(host) : contentWidthOf(host), clientLenOf(host, vertical));
  const scrollOf = (host: Host, vertical: boolean) =>
    vertical ? scrollTopOf(host) : scrollLeftOf(host);

  /** When the perpendicular axis is also active, the strip's END (bottom for
   *  vertical, right for horizontal) is shaved by the other strip's thickness
   *  so the two meet at a clean native corner instead of overlapping — the
   *  horizontal bar never runs underneath the vertical one (nor pokes past
   *  the container's right edge), and the vertical bar stops above the
   *  horizontal one. This keeps both bars fitting *inside* their container. */
  function axisEndInset(host: Host, state: AxisState): number {
    const vertical = state.axis === "vertical";
    const otherActive = vertical
      ? host.horizontal !== null && contentWidthOf(host) > clientLenOf(host, false) + 1
      : host.vertical !== null && contentLenOf(host) > clientLenOf(host, true) + 1;
    return otherActive ? opts.thickness : 0;
  }

  function hostRect(host: Host) {
    if (host.isRoot) {
      return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    }
    const raw = host.target.getBoundingClientRect();
    return { left: raw.left, top: raw.top, width: raw.width, height: raw.height };
  }

  /** True when the element's native scrollbar is hidden. The overlay's own
   *  pre-paint CSS sets `scrollbar-width: none` on every element under
   *  `html.tk-scrollbar`; consumers can also hide it themselves. */
  function nativeScrollbarHidden(el: HTMLElement): boolean {
    try {
      return getComputedStyle(el).scrollbarWidth === "none";
    } catch {
      return false;
    }
  }

  // Force an *exact* scroll write. Browsers apply an element's CSS
  // `scroll-behavior: smooth` even to direct scrollTop/scrollLeft assignments,
  // which would make drag/arrow scrolling lag behind the pointer. We pin
  // `scroll-behavior: auto` inline just for the write so drags stay 1:1, then
  // restore the previous value so smooth programmatic scrolling still works.
  function writeScroll(el: HTMLElement, vertical: boolean, value: number) {
    const prev = el.style.scrollBehavior;
    el.style.scrollBehavior = "auto";
    try {
      if (vertical) el.scrollTop = value;
      else el.scrollLeft = value;
    } finally {
      el.style.scrollBehavior = prev;
    }
  }

  function scrollTo(host: Host, value: number, vertical: boolean, smooth = false) {
    const max = maxScroll(host, vertical);
    const next = clamp(value, 0, max);
    if (host.isRoot) {
      if (smooth) {
        if (vertical) window.scrollTo({ top: next, behavior: "smooth" });
        else window.scrollTo({ left: next, behavior: "smooth" });
      } else {
        writeScroll(scrollingEl, vertical, next);
      }
      return;
    }
    if (smooth) {
      host.target.scrollTo({ top: vertical ? next : 0, left: vertical ? 0 : next, behavior: "smooth" });
    } else {
      writeScroll(host.target, vertical, next);
    }
  }

  // ---- axis creation ----------------------------------------------------
  function setArrowContent(el: HTMLDivElement, icon: ArrowIcon) {
    const items = Array.isArray(icon) ? icon : [icon];
    for (const item of items) {
      if (item == null) continue;
      if (typeof item === "string") {
        el.insertAdjacentHTML("beforeend", item);
      } else {
        el.appendChild(item as Node);
      }
    }
  }

  /** Wrap an arrow glyph and rotate it so a vertical icon can serve a
   *  horizontal arrow (and vice-versa) — keeps the whole scrollbar consistent
   *  when the user customizes only the up/down icons, like a native bar whose
   *  four buttons share one glyph family. */
  function rotatedIcon(icon: ArrowIcon, deg: number): ArrowIcon | undefined {
    const items = Array.isArray(icon) ? icon : [icon];
    if (items.length === 0) return undefined;
    if (items.every((i) => i == null)) return undefined;
    const wrap = document.createElement("span");
    wrap.className = "tk-arrow-glyph-rot";
    wrap.style.cssText =
      "display:flex;align-items:center;justify-content:center;" +
      "width:100%;height:100%;transform:rotate(" + deg + "deg)";
    for (const item of items) {
      if (item == null) continue;
      if (typeof item === "string") wrap.insertAdjacentHTML("beforeend", item);
      else wrap.appendChild(item.cloneNode(true) as Node);
    }
    return wrap;
  }

  function makeArrow(
    className: string,
    dir: ScrollbarArrowDir,
    label: string,
    icon: ArrowIcon,
  ): HTMLDivElement {
    const el = document.createElement("div");
    el.className = `tk-arrow ${className}`;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", label);
    // A custom renderer is the source of truth (framework-owned icons like
    // React/JSX that can't be plain HTML); it stamps `tk-arrow-custom` itself
    // only for directions that actually have an icon. Otherwise render the
    // string/Node icon, or fall back to the built-in CSS triangle.
    if (opts.arrowIconRenderer) {
      opts.arrowIconRenderer(el, dir);
    } else if (icon) {
      el.classList.add("tk-arrow-custom");
      setArrowContent(el, icon);
    }
    return el;
  }

  function createAxis(host: Host, axis: ScrollbarAxis): AxisState {
    const vertical = axis === "vertical";

    const root = document.createElement("div");
    root.className = `tk-scrollbar ${vertical ? "tk-v" : "tk-h"}`;
    root.setAttribute("aria-hidden", "true");
    root.setAttribute("data-theme-kit-host", "");
    // Fresh strips are off-screen until the layout pass fades them in.
    root.style.display = "none";

    const ensureChild = (
      selector: string,
      create: () => HTMLDivElement,
    ): HTMLDivElement => {
      const existing = root.querySelector<HTMLDivElement>(selector);
      if (existing) return existing;
      const el = create();
      root.appendChild(el);
      return el;
    };

    const track = ensureChild(".tk-track", () => {
      const el = document.createElement("div");
      el.className = "tk-track";
      return el;
    });
    const thumb = ensureChild(".tk-thumb", () => {
      const el = document.createElement("div");
      el.className = "tk-thumb";
      return el;
    });
    const allRotated = (main: ArrowIcon, ...alts: Array<[ArrowIcon, number]>) =>
      main || alts.reduce<ArrowIcon | undefined>((acc, [icon, deg]) => acc || rotatedIcon(icon, deg), undefined) || "";
    const topIcon = vertical
      ? allRotated(opts.arrowUpIcon || opts.arrowIcon, [opts.arrowRightIcon, -90], [opts.arrowLeftIcon, 90])
      : allRotated(opts.arrowLeftIcon || opts.arrowIcon, [opts.arrowUpIcon, -90], [opts.arrowRightIcon, 180]);
    const bottomIcon = vertical
      ? allRotated(opts.arrowDownIcon || opts.arrowIcon, [opts.arrowRightIcon, 90], [opts.arrowLeftIcon, -90])
      : allRotated(opts.arrowRightIcon || opts.arrowIcon, [opts.arrowUpIcon, 90], [opts.arrowLeftIcon, 180]);
    const btnTop = ensureChild(
      `.tk-arrow.${vertical ? "tk-arrow-up" : "tk-arrow-left"}`,
      () =>
        makeArrow(vertical ? "tk-arrow-up" : "tk-arrow-left", vertical ? "up" : "left", vertical ? "Scroll up" : "Scroll left", topIcon),
    );
    const btnBottom = ensureChild(
      `.tk-arrow.${vertical ? "tk-arrow-down" : "tk-arrow-right"}`,
      () =>
        makeArrow(vertical ? "tk-arrow-down" : "tk-arrow-right", vertical ? "down" : "right", vertical ? "Scroll down" : "Scroll right", bottomIcon),
    );
    if (host.isRoot) {
      document.body.appendChild(root);
      root.style.position = "fixed";
    } else {
      document.body.appendChild(root);
      root.setAttribute("data-overlay", "true");
      root.style.position = "fixed";
    }
    // Adopt the container's stacking order so the scrollbar never floats above
    // fixed headers/modals/backdrops of the page: a horizontal strip over a
    // sticky navbar or an un-blurred bar over a search overlay are both avoided.
    root.style.zIndex = String(resolveOverlayZIndex(host));

    root.style.setProperty("--tk-arrow", `${Math.max(3, Math.floor((opts.thickness - 2) / 2))}px`);
    if (opts.thumbColor != null) root.style.setProperty("--tk-scrollbar-thumb", opts.thumbColor);
    if (opts.trackColor != null) root.style.setProperty("--tk-scrollbar-track", opts.trackColor);
    if (opts.thumbHoverColor != null) root.style.setProperty("--tk-scrollbar-thumb-hover", opts.thumbHoverColor);
    if (opts.activeThumbColor != null) root.style.setProperty("--tk-scrollbar-thumb-active", opts.activeThumbColor);
    if (!opts.arrows) {
      btnTop.remove();
      btnBottom.remove();
    }

    const state: AxisState = {
      axis,
      root,
      track,
      thumb,
      btnTop,
      btnBottom,
      dragging: false,
      hovered: false,
      shown: false,
      pointerId: -1,
      dragStartClient: 0,
      dragStartScroll: 0,
      render: { size: 0, drawSize: 0, targetTranslate: 0, currentTranslate: 0 },
      lastGeometry: null,
      __displayed: false,
      __hideTimer: undefined,
      __cleanup: undefined,
    };

    paintAxis(state);
    thumb.style.borderRadius = `${opts.radius}px`;
    track.style.borderRadius = `${opts.radius}px`;
    thumb.style.opacity = "0";
    track.style.opacity = "0";
    btnTop.style.opacity = "0";
    btnBottom.style.opacity = "0";
    root.style.transition = `width ${opts.duration}ms ease, height ${opts.duration}ms ease, opacity ${opts.duration}ms ease`;
    track.style.transition = `background-color ${opts.duration}ms ease, opacity ${opts.duration}ms ease`;
    thumb.style.transition = `background-color ${opts.duration}ms ease, opacity ${opts.duration}ms ease, width ${opts.duration}ms ease, height ${opts.duration}ms ease`;
    btnTop.style.transition = `background-color ${opts.duration}ms ease, opacity ${opts.duration}ms ease`;
    btnBottom.style.transition = `background-color ${opts.duration}ms ease, opacity ${opts.duration}ms ease`;

    if (vertical) {
      root.style.width = `${opts.thickness}px`;
      thumb.style.left = "0";
      thumb.style.right = "0";
      thumb.style.top = "0";
      thumb.style.height = "0px";
      btnTop.style.top = "0";
      btnBottom.style.bottom = "0";
      btnTop.style.left = "0";
      btnBottom.style.left = "0";
    } else {
      root.style.height = `${opts.thickness}px`;
      thumb.style.top = "0";
      thumb.style.bottom = "0";
      thumb.style.left = "0";
      thumb.style.width = "0px";
      btnTop.style.left = "0";
      btnBottom.style.right = "0";
      btnTop.style.top = "0";
      btnBottom.style.top = "0";
    }

    wireAxis(host, state);
    return state;
  }

  // ---- button geometry --------------------------------------------------
  function buttonSize(state: AxisState): number {
    if (!opts.arrows) return 0;
    // Compact, native-feeling arrow buttons: roughly the strip thickness plus
    // a small buffer, never dominating a thin mobile scrollbar.
    return Math.max(10, Math.round(opts.thickness * 1.4));
  }

  function wireAxis(host: Host, state: AxisState) {
    const vertical = state.axis === "vertical";
    const { root, track, thumb, btnTop, btnBottom } = state;

    const onEnter = () => {
      state.hovered = true;
      applyGrow(state);
      showAxis(state);
      thumb.style.background = "var(--tk-scrollbar-thumb-hover, var(--tk-scrollbar-thumb, currentColor))";
    };
    const onLeave = () => {
      state.hovered = false;
      applyGrow(state);
      scheduleAutoHide(host);
      if (!state.dragging) {
        thumb.style.background = "var(--tk-scrollbar-thumb, currentColor)";
      }
    };
    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);

    // ---- drag (thumb follows the pointer exactly, like native) ----------
    const onPointerDown = (e: PointerEvent) => {
      if (!opts.draggable) return;
      state.pointerId = e.pointerId;
      state.dragging = true;
      state.dragStartClient = vertical ? e.clientY : e.clientX;
      state.dragStartScroll = scrollOf(host, vertical);
      thumb.setPointerCapture(e.pointerId);
      thumb.style.background = "var(--tk-scrollbar-thumb-active, var(--tk-scrollbar-thumb-hover, var(--tk-scrollbar-thumb, currentColor)))";
      showAxis(state);
      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!state.dragging || e.pointerId !== state.pointerId) return;
      const client = clientLenOf(host, vertical);
      const btn = buttonSize(state);
      const corner = axisEndInset(host, state);
      const effClient = Math.max(client - btn * 2 - opts.offset * 2 - corner, 1);
      const thumbTravel = vertical ? thumb.offsetHeight : thumb.offsetWidth;
      const usable = Math.max(effClient - thumbTravel, 1);
      const max = maxScroll(host, vertical);
      const now = vertical ? e.clientY : e.clientX;
      const delta = now - state.dragStartClient;
      const next = state.dragStartScroll + (delta / usable) * max;
      scrollTo(host, next, vertical);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== state.pointerId) return;
      state.dragging = false;
      state.pointerId = -1;
      thumb.style.background = state.hovered
        ? "var(--tk-scrollbar-thumb-hover, var(--tk-scrollbar-thumb, currentColor))"
        : "var(--tk-scrollbar-thumb, currentColor)";
      try { thumb.releasePointerCapture(e.pointerId); } catch { /* noop */ }
      scheduleAutoHide(host);
    };

    // ---- track click → jump ---------------------------------------------
    const onTrackPointerDown = (e: PointerEvent) => {
      if (state.dragging || !opts.clickToJump || e.target === thumb) return;
      const client = clientLenOf(host, vertical);
      const btn = buttonSize(state);
      const corner = axisEndInset(host, state);
      const effClient = Math.max(client - btn * 2 - opts.offset * 2 - corner, 1);
      const thumbTravel = vertical ? thumb.offsetHeight : thumb.offsetWidth;
      const usable = Math.max(effClient - thumbTravel, 1);
      const max = maxScroll(host, vertical);
      const rect = hostRect(host);
      const pos = (vertical ? e.clientY - rect.top : e.clientX - rect.left) - btn - opts.offset;
      if (pos < thumbTravel / 2) {
        scrollTo(host, 0, vertical, true);
      } else {
        const ratio = clamp((pos - thumbTravel) / usable, 0, 1);
        scrollTo(host, ratio * max, vertical, true);
      }
      showAxis(state);
    };

    // ---- arrow buttons (hold to repeat, like native) --------------------
    let repeatTimer: ReturnType<typeof setTimeout> | null = null;
    let repeatDelay: ReturnType<typeof setTimeout> | null = null;
    function stepScroll(dir: 1 | -1) {
      const client = clientLenOf(host, vertical);
      const step = Math.max(16, client * 0.05);
      scrollTo(host, scrollOf(host, vertical) + dir * step, vertical, true);
      showAxis(state);
    }
    function beginRepeat(dir: 1 | -1) {
      stopRepeat();
      stepScroll(dir);
      repeatDelay = setTimeout(() => {
        repeatTimer = setInterval(() => stepScroll(dir), 60);
      }, 350);
    }
    function stopRepeat() {
      if (repeatDelay) clearTimeout(repeatDelay);
      if (repeatTimer) clearInterval(repeatTimer);
      repeatDelay = null;
      repeatTimer = null;
    }
    btnTop.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      beginRepeat(vertical ? -1 : -1);
    });
    btnBottom.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      beginRepeat(vertical ? 1 : 1);
    });
    for (const btn of [btnTop, btnBottom]) {
      btn.addEventListener("pointerup", stopRepeat);
      btn.addEventListener("pointercancel", stopRepeat);
      btn.addEventListener("pointerleave", stopRepeat);
      btn.addEventListener("lostpointercapture", stopRepeat);
    }

    thumb.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    track.addEventListener("pointerdown", onTrackPointerDown);

    state.__cleanup = () => {
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
      thumb.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      track.removeEventListener("pointerdown", onTrackPointerDown);
      stopRepeat();
      if (state.__hideTimer) clearTimeout(state.__hideTimer);
    };
  }

  // ---- visibility / auto-hide ------------------------------------------
  function applyGrow(state: AxisState) {
    const vertical = state.axis === "vertical";
    const size = state.hovered && opts.hoverExpand ? opts.hoverThickness : opts.thickness;
    if (vertical) state.root.style.width = `${size}px`;
    else state.root.style.height = `${size}px`;
  }

  function showAxis(state: AxisState) {
    state.shown = true;
    writeShownOpacity(state);
  }
  function showHost(host: Host) {
    if (host.vertical) showAxis(host.vertical);
    if (host.horizontal) showAxis(host.horizontal);
  }
  /** Reveal only the document scrollbar. Skipped while the page is
   *  scroll-locked (modal/menu open) so an idle root strip never appears over
   *  the fixed overlay — even on the boot reveal. */
  function revealDoc() {
    if (documentCanScroll()) {
      showHost(rootHost);
      scheduleAutoHide(rootHost);
    }
  }
  function writeShownOpacity(state: AxisState) {
    state.thumb.style.opacity = String(opts.thumbOpacity);
    state.track.style.opacity = String(opts.trackOpacity);
    state.btnTop.style.opacity = String(Math.min(1, opts.thumbOpacity));
    state.btnBottom.style.opacity = String(Math.min(1, opts.thumbOpacity));
  }
  /** Apply whichever opacity the strip currently *should* have. Used to pick
   *  up a freshly-displayed strip on the frame after it was primed at 0. */
  function applyCurrentOpacity(state: AxisState) {
    if (state.shown) writeShownOpacity(state);
    else setIdle(state);
  }
  /** Idle (autoHide): the scrollbar fades out completely — invisible while not
   *  scrolling, reappears the moment scrolling starts. */
  function setIdle(state: AxisState | null) {
    if (!state) return;
    state.thumb.style.opacity = "0";
    state.track.style.opacity = "0";
    state.btnTop.style.opacity = "0";
    state.btnBottom.style.opacity = "0";
  }
  function setIdleAll(host: Host) {
    setIdle(host.vertical);
    setIdle(host.horizontal);
  }

  /** Bring a strip back from `display:none`. A display toggle can't transition
   *  on its own, so prime the strip at opacity 0 and ease to its current
   *  shown/idle target on the next frame — no more flash-in. Callers that want
   *  it visible class it shown through `showAxis`, which is then applied by the
   *  deferred `applyCurrentOpacity`. */
  function revealStrip(state: AxisState) {
    if (state.__displayed) return;
    state.__displayed = true;
    if (state.__hideTimer) {
      clearTimeout(state.__hideTimer);
      state.__hideTimer = undefined;
    }
    state.root.style.display = "";
    setIdle(state);
    requestAnimationFrame(() => {
      if (destroyed || !state.__displayed) return;
      applyCurrentOpacity(state);
    });
  }

  /** Fade a strip out, then take it out of the layout only after the fade
   *  completes — mirroring how native overlay scrollbars dissolve instead of
   *  vanishing. Idempotent: only the first call arms the `display:none` timer. */
  function concealStrip(state: AxisState) {
    if (!state.__displayed) return;
    state.__displayed = false;
    setIdle(state);
    if (state.__hideTimer) clearTimeout(state.__hideTimer);
    state.__hideTimer = setTimeout(() => {
      if (!destroyed && !state.__displayed) state.root.style.display = "none";
    }, opts.duration + 120);
  }
function concealStripImmediate(state: AxisState) {
     if (!state.__displayed) return;
     state.__displayed = false;
     setIdle(state);
     if (state.__hideTimer) clearTimeout(state.__hideTimer);
     // Hide immediately without fade-out delay
     if (!destroyed && !state.__displayed) state.root.style.display = "none";
   }
  function scheduleAutoHide(host: Host) {
    if (!opts.autoHide) return;
    if (host.hideTimer) clearTimeout(host.hideTimer);
     host.hideTimer = setTimeout(() => {
      if (!host.vertical?.dragging && !host.vertical?.hovered) setIdle(host.vertical);
      if (!host.horizontal?.dragging && !host.horizontal?.hovered) setIdle(host.horizontal);
    }, opts.autoHideDelay);
  }

  // ---- scrollable discovery --------------------------------------------
  /** Resolved overflow style verdict (does this element *permit* scrolling?).
   *  This is the expensive `getComputedStyle` call and the only thing that
   *  needs caching. The content-size comparison is re-read live by
   *  `scrollableVia` so overlay discovery never goes stale after navigation. */
  function overflowStyleOf(el: HTMLElement): { v: boolean; h: boolean } {
    let style = scrollableCache.get(el);
    if (!style) {
      let ov = "visible";
      let ox = "visible";
      try {
        const cs = getComputedStyle(el);
        ov = cs.overflowY;
        ox = cs.overflowX;
      } catch { /* ignore */ }
      style = {
        v: ov === "auto" || ov === "scroll" || ov === "overlay",
        h: ox === "auto" || ox === "scroll" || ox === "overlay",
      };
      scrollableCache.set(el, style);
    }
    return style;
  }

  function scrollableVia(el: HTMLElement): { v: boolean; h: boolean } {
    const style = overflowStyleOf(el);
    return {
      v: style.v && el.scrollHeight > el.clientHeight + 1,
      h: style.h && el.scrollWidth > el.clientWidth + 1,
    };
  }

  function isExcluded(el: HTMLElement): boolean {
    if (opts.exclude.length === 0) return false;
    return opts.exclude.some((sel) => {
      try { return el.matches(sel); } catch { return false; }
    });
  }

  // Collect every scrollable element the overlay should cover.
  //  - If `include` selectors are given, only those elements are tracked.
  //  - Otherwise *every* scrollable on the page is tracked (so the overlay
  //    appears wherever a native scrollbar would), minus `exclude` targets.
  // The full walk is gated behind `needsRescan` (mutation/load/update) so the
  // per-frame `syncHosts` call stays cheap even on large documents.
  function collectScrollables(): HTMLElement[] {
    const result: HTMLElement[] = [];
    const push = (el: HTMLElement) => {
      if (isRootCandidate(el)) return;
      if (isExcluded(el)) return;
      if (el.closest("[data-theme-kit-host]")) return;
      if (scrollableVia(el).v || scrollableVia(el).h) result.push(el);
    };
    if (opts.include.length > 0) {
      for (const sel of opts.include) {
        try {
          for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) push(el);
        } catch { /* invalid selector */ }
      }
      return result;
    }
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("*"))) push(el);
    return result;
  }

  function makeHost(el: HTMLElement, isRoot: boolean): Host {
    const host: Host = { target: el, isRoot, vertical: null, horizontal: null, ro: null, hideTimer: null };
    if (opts.axes.includes("vertical")) host.vertical = createAxis(host, "vertical");
    if (opts.axes.includes("horizontal")) host.horizontal = createAxis(host, "horizontal");
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => requestRender());
      ro.observe(el);
      host.ro = ro;
    }
    if (!isRoot) el.setAttribute("data-theme-kit-scrollbar", "overlay");
    // Hovering the container itself reveals its scrollbar (e.g. a code block) —
    // you don't have to find the strip first. Only for inner containers: the
    // document scrollbar is revealed on scroll activity / on boot.
    if (!isRoot) {
      const onHoverEnter = () => { showHost(host); scheduleAutoHide(host); };
      const onHoverLeave = () => { if (opts.autoHide) setIdleAll(host); };
      el.addEventListener("mouseenter", onHoverEnter);
      el.addEventListener("mouseleave", onHoverLeave);
      host.targetCleanup = () => {
        el.removeEventListener("mouseenter", onHoverEnter);
        el.removeEventListener("mouseleave", onHoverLeave);
      };
    }
    return host;
  }

  function destroyHost(host: Host, el: HTMLElement) {
    host.vertical?.__cleanup?.();
    host.horizontal?.__cleanup?.();
    if (host.vertical?.__hideTimer) clearTimeout(host.vertical.__hideTimer);
    if (host.horizontal?.__hideTimer) clearTimeout(host.horizontal.__hideTimer);
    host.vertical?.root.remove();
    host.horizontal?.root.remove();
    host.ro?.disconnect();
    if (host.hideTimer) clearTimeout(host.hideTimer);
    host.targetCleanup?.();
    if (!host.isRoot) el.removeAttribute("data-theme-kit-scrollbar");
    hosts.delete(el);
  }

  function syncHosts() {
    // Only re-walk the DOM when a mutation/load/update invalidated the scan.
    if (needsRescan) {
      const desired = new Set<HTMLElement>(collectScrollables());
      for (const [el, host] of [...hosts.entries()]) {
        if (isRootCandidate(el)) continue;
        // Destroy hosts only when the element is actually gone from the DOM or
        // has stopped being scrollable BY STYLE (overflow flipped to
        // visible/hidden). Content-size alone is deliberately NOT grounds for
        // destruction: during a navigation a container's content can be
        // momentarily short (fonts/images loading), and destroying its host
        // then would leave the overlay missing until the next rescan even
        // after the content grows back. `layoutAxis` already conceals the
        // strip whenever content fits, and re-reveals it live.
        if (!document.body.contains(el) || !(overflowStyleOf(el).v || overflowStyleOf(el).h)) {
          destroyHost(host, el);
        }
      }
      for (const el of desired) {
        if (isRootCandidate(el) || hosts.has(el) || !document.body.contains(el)) continue;
        hosts.set(el, makeHost(el, false));
      }
      needsRescan = false;
    }
  }

  // ---- layout + physics ------------------------------------------------
  /** Visibility verdict + effective opacity (product of the ancestor chain) for
   *  a host. Opacity is reported so the engine can detect a host *fading out*
   *  (a panel closing) and dissolve its strip in sync — native scrollbars fade
   *  with their container instead of lingering at full opacity. */
  function visibilityOf(el: HTMLElement): { visible: boolean; opacity: number } {
    let node: HTMLElement | null = el;
    let opacity = 1;
    while (node && node.nodeType === 1) {
      try {
        const cs = getComputedStyle(node);
        if (cs.visibility === "hidden" || cs.visibility === "collapse") {
          return { visible: false, opacity };
        }
        if (cs.display === "none") {
          return { visible: false, opacity };
        }
        const op = parseFloat(cs.opacity);
        if (!isNaN(op)) {
          opacity *= op;
          if (opacity === 0) return { visible: false, opacity };
        }
      } catch {
        return { visible: false, opacity };
      }
      if (node === docEl) break;
      node = node.parentElement;
    }
    return { visible: true, opacity };
  }

  /** Snapshot the strip's fixed-placement geometry and report whether it moved
   *  vs. the previous frame. A non-finite / NaN reading is treated as "moved"
   *  so the loop keeps retrying rather than going stale. */
  function commitGeometry(
    state: AxisState,
    next: { display: string; left: number; top: number; width: number; height: number },
  ): boolean {
    const prev = state.lastGeometry;
    const changed =
      !prev ||
      prev.display !== next.display ||
      Math.abs(prev.left - next.left) > 0.5 ||
      Math.abs(prev.top - next.top) > 0.5 ||
      Math.abs(prev.width - next.width) > 0.5 ||
      Math.abs(prev.height - next.height) > 0.5;
    state.lastGeometry = next;
    return changed;
  }

  /** Position + size the strip and return `true` when its footprint changed —
   *  lets the render loop stay alive mid-transform/animation and keeps the bar
   *  visually attached to the host (like a native scrollbar), even when no
   *  scroll/resize/mutation event fires. */
  function layoutAxis(host: Host, state: AxisState): boolean {
    const vertical = state.axis === "vertical";
    const rect = hostRect(host);
    const client = clientLenOf(host, vertical);
    const content = vertical ? contentLenOf(host) : contentWidthOf(host);

    const nextGeometry: { display: string; left: number; top: number; width: number; height: number } = {
      display: "",
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    };

    // The document scrollbar is the *only* strip tied to the page scroller.
    // When the page is scroll-locked behind a modal / mobile menu, the strip
    // must disappear (it would otherwise float over the fixed overlay and
    // render a second, translucent scrollbar stacked on the menu's own strip).
    if (host.isRoot && !documentCanScroll()) {
      concealStripImmediate(state);
      nextGeometry.display = "none";
      return commitGeometry(state, nextGeometry);
    }

    // Track hidden → visible transitions (a mobile menu / dialog opening) so
    // the strip shows the moment scrollable content is on screen — never
    // "late". The very first layout only *records* visibility — booting with
    // a page full of visible scrollables must not flash a stack of strips.
    let justRevealed = false;
    if (!host.isRoot) {
      const vis = visibilityOf(host.target);
      if (host.prevVisible === undefined) {
        host.prevVisible = vis.visible;
      } else if (!host.prevVisible && vis.visible) {
        host.prevVisible = true;
        justRevealed = true;
      } else {
        host.prevVisible = vis.visible;
      }
      // A host that just became invisible (or flipped its overflow to hidden)
      // must drop its strip *now* — no lingering fade. The fade-out path below
      // only handles the in-progress opacity transition.
      if (
        !vis.visible ||
        getComputedStyle(host.target).overflowY === "hidden" ||
        getComputedStyle(host.target).overflowX === "hidden"
      ) {
        concealStripImmediate(state);
        nextGeometry.display = "none";
        return commitGeometry(state, nextGeometry);
      }
      // Host is fading OUT (e.g. a modal/panel closing): its `visibility` and
      // `display` stay intact until the opacity transition completes, but a
      // fully-opaque strip lingering next to a dissolving container reads as a
      // UI mis-lead. Dissolve the strip in sync (same `opts.duration` fade).
      if (
        host.prevOpacity !== undefined &&
        vis.opacity < host.prevOpacity - 0.005
      ) {
        concealStrip(state);
        nextGeometry.display = "none";
        return commitGeometry(state, nextGeometry);
      }
      host.prevOpacity = vis.opacity;
    }

    if (content <= client + 1) {
      concealStripImmediate(state);
      nextGeometry.display = "none";
      return commitGeometry(state, nextGeometry);
    }

    // Display the strip (fade in from transparent on the next frame) before
    // any target opacity is applied, so shows are smooth like native bars.
    revealStrip(state);
    if (justRevealed) {
      // Class the axes as shown; `revealStrip`'s deferred *applyCurrentOpacity*
      // picks this up and eases the strip in — instead of flashing it on.
      if (host.vertical) host.vertical.shown = true;
      if (host.horizontal) host.horizontal.shown = true;
      scheduleAutoHide(host);
    }

    const thickness = opts.hoverExpand && state.hovered ? opts.hoverThickness : opts.thickness;
    const btn = buttonSize(state);

    if (vertical) {
      const corner = axisEndInset(host, state);
      const stripLeft = rect.left + rect.width - opts.offset - thickness;
      const stripTop = rect.top + opts.offset;
      const stripHeight = Math.max(rect.height - opts.offset * 2 - corner, 0);
      state.root.style.top = `${stripTop}px`;
      state.root.style.left = `${stripLeft}px`;
      state.root.style.height = `${stripHeight}px`;
      state.btnTop.style.width = `${thickness}px`;
      state.btnTop.style.height = `${btn}px`;
      state.btnBottom.style.width = `${thickness}px`;
      state.btnBottom.style.height = `${btn}px`;
      nextGeometry.left = stripLeft;
      nextGeometry.top = stripTop;
      nextGeometry.width = thickness;
      nextGeometry.height = stripHeight;
    } else {
      const corner = axisEndInset(host, state);
      const rootWidth =
        host.isRoot && typeof document !== "undefined"
          ? document.documentElement.clientWidth
          : rect.width;
      // Only shave the native gutter when it's actually visible. When the
      // native scrollbar is hidden (this overlay's own pre-paint CSS sets
      // `scrollbar-width: none`), the gutter collapses and
      // `offsetWidth - clientWidth` is 0 — but some browsers reserve it anyway
      // via `scrollbar-gutter: stable`, leaving a phantom gutter here. That
      // used to push the strip (and its right arrow) short of the container's
      // right edge, which reads as the scrollbar "leaking" out of its box.
      const scrollbarV = host.isRoot
        ? 0
        : nativeScrollbarHidden(host.target)
          ? 0
          : host.target.offsetWidth - host.target.clientWidth;
      // The strip spans the full container width (minus offsets) like the
      // vertical strip spans the full height; the arrow buttons are inset at
      // the edges (left/right) and the thumb travels between them. When the
      // vertical strip is active it owns the right edge, so the strip stops
      // `corner` short of it — the horizontal bar + its right arrow fit
      // inside the container exactly like a native scrollbar.
      const stripLeft = rect.left + opts.offset;
      const stripTop = rect.top + rect.height - opts.offset - thickness;
      const stripWidth = Math.max(rootWidth - scrollbarV - opts.offset * 2 - corner, 0);
      state.root.style.left = `${stripLeft}px`;
      state.root.style.top = `${stripTop}px`;
      state.root.style.width = `${stripWidth}px`;
      state.btnTop.style.height = `${thickness}px`;
      state.btnTop.style.width = `${btn}px`;
      state.btnBottom.style.height = `${thickness}px`;
      state.btnBottom.style.width = `${btn}px`;
      nextGeometry.left = stripLeft;
      nextGeometry.top = stripTop;
      nextGeometry.width = stripWidth;
      nextGeometry.height = thickness;
    }

    const max = maxScroll(host, vertical);
    const scrollPos = scrollOf(host, vertical);

    // Effective travel area sits between the two arrow buttons (and stops
    // short of the perpendicular strip's corner so the thumb never bleeds
    // past the visual strip).
    const corner = axisEndInset(host, state);
    const effClient = Math.max(client - btn * 2 - opts.offset * 2 - corner, 1);
    // The thumb must never exceed the travel area between the arrows. When
    // content overflows by only a few pixels, `client²/content` already
    // approaches the full client width — wider than `effClient` — and the
    // un-clamped thumb poked out past the right arrow (and the container's
    // right edge), looking like the scrollbar leaks out of its box.
    const baseSize = Math.min(
      computeThumbSize(client, content, opts.minThumbSize, opts.offset),
      effClient,
    );
    const factor = overscrollFactor(scrollPos, max, client, opts.overscroll);
    const drawSize = Math.max(Math.round(baseSize * factor), Math.min(opts.minThumbSize, effClient));
    const maxTranslate = Math.max(effClient - baseSize, 0);
    // Clamp so rubber-band overscroll (scrollPos beyond 0..max) never pushes
    // the thumb past the track ends — the overscroll factor already hints at
    // the boundary by compressing the thumb size.
    const targetTranslate =
      client > 0 && max > 0
        ? clamp((scrollPos / max) * maxTranslate, 0, maxTranslate)
        : 0;

    const render = state.render;
    // Snapshot the previous rendered thumb state so we can detect changes that
    // the strip *rectangle* alone won't reveal. When animated content grows or
    // shrinks (token-tree expand/collapse, CSS height/width transitions) the
    // strip's fixed position stays the same, but the thumb size/position change
    // on every frame. Reporting that here keeps the render loop alive so the
    // thumb tracks the animation frame-by-frame — exactly like a native
    // scrollbar instead of snapping after the animation settles.
    const prevSize = render.size;
    const prevDraw = render.drawSize;
    const prevTarget = render.targetTranslate;
    render.size = baseSize;
    render.drawSize = drawSize;
    render.targetTranslate = targetTranslate;

    if (vertical) {
      state.thumb.style.top = `${btn}px`;
      state.thumb.style.height = `${Math.round(drawSize)}px`;
    } else {
      state.thumb.style.left = `${btn}px`;
      state.thumb.style.width = `${Math.round(drawSize)}px`;
    }

    const geomChanged = commitGeometry(state, nextGeometry);
    const thumbChanged =
      Math.abs(prevSize - baseSize) > 0.5 ||
      Math.abs(prevDraw - drawSize) > 0.5 ||
      Math.abs(prevTarget - targetTranslate) > 0.5;

    return geomChanged || thumbChanged;
  }

  function applyTransform(state: AxisState, value: number) {
    const vertical = state.axis === "vertical";
    const sign = !vertical && opts.dir === "rtl" ? -1 : 1;
    const v = (value * sign).toFixed(2);
    state.thumb.style.transform = vertical
      ? `translate3d(0, ${v}px, 0)`
      : `translate3d(${v}px, 0, 0)`;
  }

  let rafId: number | null = null;
  let lastTs = 0;

  function renderFrame() {
    if (destroyed) return;
    const now = performance.now();
    const dt = lastTs ? Math.min(now - lastTs, 50) : FRAME_MS;
    lastTs = now;

    syncHosts();
    let moving = false;
    for (const host of hosts.values()) {
      if (host.vertical) moving = layoutAxis(host, host.vertical) || moving;
      if (host.horizontal) moving = layoutAxis(host, host.horizontal) || moving;
    }

    // Default (smooth:false) tracks the scroll position EXACTLY with zero
    // delay. With smooth:true, refresh-rate-independent easing applies (alpha
    // derives from the *real* frame delta); dragging always snaps 1:1.
    const ease = reduced() || !opts.smooth ? 1 : easeAlpha(opts.animationDuration, dt);
    let active = false;
    for (const host of hosts.values()) {
      for (const state of [host.vertical, host.horizontal]) {
        if (!state) continue;
        const render = state.render;
        const target = render.targetTranslate;
        if (state.dragging || ease === 1) {
          render.currentTranslate = target;
        } else if (!isSettled(render.currentTranslate, target, 0.25)) {
          render.currentTranslate = lerp(render.currentTranslate, target, ease);
          active = true;
        } else {
          render.currentTranslate = target;
        }
        applyTransform(state, render.currentTranslate);
      }
    }
    if (active || moving) requestTick();
  }

  function requestTick() {
    if (rafId != null || destroyed) return;
    rafId = requestAnimationFrame(() => {
      if (destroyed) { rafId = null; return; }
      rafId = null;
      renderFrame();
    });
  }
  function requestRender() {
    if (destroyed) return;
    requestTick();
  }

   // ---- boot ------------------------------------------------------------
   const rootHost: Host = makeHost(scrollingEl, true);
   hosts.set(scrollingEl, rootHost);

   const controls = observeScrollbarSizing(
     (el) => hosts.has(el),
     {
       onTargetActivity(target) {
         const host = hosts.get(target);
         // Reveal only the scrollbar the user is actually interacting with —
         // scrolling/hovering one scrollable must not surface every other
         // overlay on the page. Each host has its own auto-hide timer, so the
         // revealed scrollbar fades out independently after `autoHideDelay`.
if (host) {
            showHost(host);
            scheduleAutoHide(host);
          } else {
            revealDoc();
          }
        },
       onGlobalActivity() {
         // Global activity = document-level scroll (wheel on non-hosted content).
         // Reveal only the document scrollbar, not every inner overlay.
         revealDoc();
       },
       onResize() {
         requestRender();
       },
        onMutate(records) {
          // Invalidate the cached overflow *style* for every element whose
          // class/style/dir changed (attribute mutations) so an `overflow`
          // toggle (e.g. a menu class flipping `overflow-y-auto`) takes effect
          // immediately. Content-size changes need no invalidation — the
          // `scrollHeight`/`clientHeight` comparison is re-read on every scan.
          for (const record of records) {
            if (record.type === "attributes" && record.target instanceof HTMLElement) {
              scrollableCache.delete(record.target);
            }
          }
          needsRescan = true;
          requestRender();
        },
        onOpacityTransition(el) {
          // The element started an `opacity` transition — it is a host, or an
          // ancestor of a host (a panel/modal closing). Fade the affected
          // strip(s) in sync, right when the transition starts, instead of
          // letting a fully-opaque scrollbar linger next to a dissolving
          // container until the opacity reaches 0. `concealStrip` is
          // idempotent and a no-op while the strip is already hidden, so a
          // fade-IN transition never suppresses a strip.
          for (const [target, host] of hosts.entries()) {
            if (host.isRoot) continue;
            if (el === target || el.contains(target)) {
              if (host.vertical) concealStrip(host.vertical);
              if (host.horizontal) concealStrip(host.horizontal);
            }
          }
        },
      },
   );

   // Periodic full re-scan: catches containers that became (or stopped being)
   // scrollable purely from content growth, which mutations alone can't see.
   const rescanTimer = setInterval(() => {
     if (destroyed) return;
     scrollableCache = new WeakMap();
     needsRescan = true;
     requestRender();
   }, 4000);

   // Also rescan on viewport resize — responsive layout changes (e.g.
   // mobile menu appearing) can create new scrollables that the MutationObserver
   // won't catch because CSS media queries don't mutate DOM attributes.
   const onResizeRescan = () => {
     scrollableCache = new WeakMap();
     needsRescan = true;
     requestRender();
   };
   window.addEventListener("resize", onResizeRescan, { passive: true });

   requestRender();
   setTimeout(() => {
     if (destroyed) return;
     // Phase 3 — ready: the overlay has been painted once. This always happens
     // (it enables the CSS fade-in that turns .tk-scrollbar from opacity:0 to 1),
     // regardless of `autoHide` — otherwise an `autoHide: false` config leaves
     // the strips stuck at opacity:0 and nothing ever paints.
     docEl.classList.add("tk-scrollbar-ready");
     if (opts.autoHide) {
       // Reveal only the document scrollbar on first paint — inner scrollables
       // fade in independently the moment the user scrolls/hovers them, so a
       // page full of code blocks doesn't flash a stack of overlays on load.
       revealDoc();
     } else {
       // autoHide off → permanently visible: reveal every tracked scrollbar
       // (document + inner) and never schedule an idle fade.
       for (const h of hosts.values()) showHost(h);
     }
   }, 80);

  return {
    update() {
      scrollableCache = new WeakMap();
      needsRescan = true;
      requestRender();
    },
    destroy() {
      destroyed = true;
      if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
      clearInterval(rescanTimer);
      window.removeEventListener("resize", onResizeRescan);
      controls.dispose();
      storeUnsubscribe();
      for (const [el, host] of [...hosts.entries()]) destroyHost(host, el);
      hosts.clear();
    },
  };
}

/** Alias landing in the public API. */
export function createThemeScrollbar(
  store: ThemeStore,
  options: OverlayScrollbarOptions = {},
): OverlayScrollbarHandle | null {
  return createOverlayScrollbar(store, options);
}


