import { PRE_PAINT_SCROLLBAR_CSS, createOverlayScrollbar, type OverlayScrollbarOptions } from "@theme-kit/core";
import { findProviderRuntime } from "./utils";
import { CustomElementBase } from "./custom-element-base";

/**
 * Injects the pre-paint scrollbar-hiding CSS and class into the document.
 *
 * Framework-free (vanilla JS). Adds a `<style id="tk-scrollbar-style">` with
 * the pre-paint scrollbar CSS and the `tk-scrollbar` class to the document
 * root so the native scrollbar is hidden before first paint. Idempotent and a
 * no-op on the server.
 *
 * @see {@link ThemeKitScrollbar}
 * @see `createPrePaintScrollbarScript`
 */
export function injectPrePaintScrollbarCSS(): void {
  if (typeof document === "undefined") return;
  if (document.documentElement.classList.contains("tk-scrollbar")) return;
  const docEl = document.documentElement;
  const existingStyle = document.getElementById("tk-scrollbar-style");
  if (!existingStyle) {
    const style = document.createElement("style");
    style.id = "tk-scrollbar-style";
    style.textContent = PRE_PAINT_SCROLLBAR_CSS;
    document.head.appendChild(style);
  }
  docEl.classList.add("tk-scrollbar");
}

function parseBool(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  return value !== "false" && value !== "0";
}

function parseNum(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function optionsFrom(el: HTMLElement): OverlayScrollbarOptions {
  const opts: OverlayScrollbarOptions = {};
  const autoHide = parseBool(el.getAttribute("auto-hide"));
  const hoverExpand = parseBool(el.getAttribute("hover-expand"));
  const draggable = parseBool(el.getAttribute("draggable"));
  const clickToJump = parseBool(el.getAttribute("click-to-jump"));
  const smooth = parseBool(el.getAttribute("smooth"));
  const overscroll = parseBool(el.getAttribute("overscroll"));
  const arrows = parseBool(el.getAttribute("arrows"));
  const arrowIcon = el.getAttribute("arrow-icon") ?? undefined;
  const arrowUpIcon = el.getAttribute("arrow-up-icon") ?? undefined;
  const arrowDownIcon = el.getAttribute("arrow-down-icon") ?? undefined;
  const arrowLeftIcon = el.getAttribute("arrow-left-icon") ?? undefined;
  const arrowRightIcon = el.getAttribute("arrow-right-icon") ?? undefined;
  const touch = parseBool(el.getAttribute("touch"));
  const thickness = parseNum(el.getAttribute("thickness"));
  const hoverThickness = parseNum(el.getAttribute("hover-thickness"));
  const radius = parseNum(el.getAttribute("radius"));
  const minThumbSize = parseNum(el.getAttribute("min-thumb-size"));
  const offset = parseNum(el.getAttribute("offset"));
  const trackOpacity = parseNum(el.getAttribute("track-opacity"));
  const thumbOpacity = parseNum(el.getAttribute("thumb-opacity"));
  const duration = parseNum(el.getAttribute("duration"));
  const animationDuration = parseNum(el.getAttribute("animation-duration"));
  const thumbColor = el.getAttribute("thumb-color") ?? undefined;
  const trackColor = el.getAttribute("track-color") ?? undefined;
  const activeThumbColor = el.getAttribute("active-thumb-color") ?? undefined;
  const thumbHoverColor = el.getAttribute("thumb-hover-color") ?? undefined;
  const zIndex = parseNum(el.getAttribute("z-index"));

  if (autoHide !== undefined) opts.autoHide = autoHide;
  if (hoverExpand !== undefined) opts.hoverExpand = hoverExpand;
  if (draggable !== undefined) opts.draggable = draggable;
  if (clickToJump !== undefined) opts.clickToJump = clickToJump;
  if (smooth !== undefined) opts.smooth = smooth;
  if (overscroll !== undefined) opts.overscroll = overscroll;
  if (arrows !== undefined) opts.arrows = arrows;
  if (arrowIcon !== undefined) opts.arrowIcon = arrowIcon;
  if (arrowUpIcon !== undefined) opts.arrowUpIcon = arrowUpIcon;
  if (arrowDownIcon !== undefined) opts.arrowDownIcon = arrowDownIcon;
  if (arrowLeftIcon !== undefined) opts.arrowLeftIcon = arrowLeftIcon;
  if (arrowRightIcon !== undefined) opts.arrowRightIcon = arrowRightIcon;
  if (touch !== undefined) opts.touch = touch;
  if (thickness !== undefined) opts.thickness = thickness;
  if (hoverThickness !== undefined) opts.hoverThickness = hoverThickness;
  if (radius !== undefined) opts.radius = radius;
  if (minThumbSize !== undefined) opts.minThumbSize = minThumbSize;
  if (offset !== undefined) opts.offset = offset;
  if (trackOpacity !== undefined) opts.trackOpacity = trackOpacity;
  if (thumbOpacity !== undefined) opts.thumbOpacity = thumbOpacity;
  if (duration !== undefined) opts.duration = duration;
  if (animationDuration !== undefined) opts.animationDuration = animationDuration;
  if (thumbColor !== undefined) opts.thumbColor = thumbColor;
  if (trackColor !== undefined) opts.trackColor = trackColor;
  if (activeThumbColor !== undefined) opts.activeThumbColor = activeThumbColor;
  if (thumbHoverColor !== undefined) opts.thumbHoverColor = thumbHoverColor;
  if (zIndex !== undefined) opts.zIndex = zIndex;

  const dir = el.getAttribute("dir");
  if (dir === "ltr" || dir === "rtl" || dir === "auto") opts.dir = dir;

  const axes = el.getAttribute("axes");
  if (axes) {
    opts.axes = axes
      .split(",")
      .map((a) => a.trim())
      .filter((a): a is "vertical" | "horizontal" =>
        a === "vertical" || a === "horizontal",
      );
  }

  return opts;
}

/**
 * Phase 2 — ThemeKitScrollbar (Web Component): overlay only.
 *
 * Creates the custom scrollbar overlay.
 *
 * Lifecycle:
 *   connectedCallback  → inject pre-paint hiding CSS + class
 *                        ↓ (Phase 1)
 *   connectedCallback  → create overlay → measure → attach listeners
 *                        ↓ (Phase 2)
 *   later              → add tk-scrollbar-ready
 *                        ↓ (Phase 3)
 *
 * Phase 1 is injected synchronously in `connectedCallback`. For static HTML
 * served via the Vite plugin (scrollbar: true), the pre-paint script in <head>
 * runs before first paint. This component's injection is a fallback for
 * dynamically-inserted scrollbar elements (which may have already painted).
 *
 * @see {@link ThemeKitProvider}
 */
export class ThemeKitScrollbar extends CustomElementBase {
  private handle: { destroy(): void } | null = null;
  private initialized = false;

  /**
   * Every attribute `optionsFrom` reads.
   *
   * The engine resolves its options once, when the overlay is created, so a
   * changed attribute has to rebuild it — without this list a new value was
   * ignored until the page was reloaded.
   */
  static get observedAttributes(): string[] {
    return [
      "auto-hide",
      "hover-expand",
      "draggable",
      "click-to-jump",
      "smooth",
      "overscroll",
      "arrows",
      "arrow-icon",
      "arrow-up-icon",
      "arrow-down-icon",
      "arrow-left-icon",
      "arrow-right-icon",
      "touch",
      "thickness",
      "hover-thickness",
      "radius",
      "min-thumb-size",
      "offset",
      "track-opacity",
      "thumb-opacity",
      "duration",
      "animation-duration",
      "thumb-color",
      "track-color",
      "active-thumb-color",
      "thumb-hover-color",
      "z-index",
      "dir",
      "axes",
    ];
  }

  /** Lifecycle hook: rebuilds the overlay when a watched attribute changes. */
  attributeChangedCallback() {
    // Before `connectedCallback` runs there is nothing to rebuild; the first
    // `init()` reads the attributes as they are then.
    if (!this.initialized) return;
    this.handle?.destroy();
    this.handle = null;
    this.init();
  }

  /** Lifecycle hook: injects pre-paint CSS and initializes the overlay. */
  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;

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

  /** Lifecycle hook: destroys the overlay scrollbar. */
  disconnectedCallback() {
    this.handle?.destroy();
    this.handle = null;
  }

  private init() {
    const runtime = findProviderRuntime(this);
    if (!runtime) return;
    this.handle = createOverlayScrollbar(
      runtime.store as any,
      optionsFrom(this),
    );
  }

  static define(tag = "theme-kit-scrollbar") {
    // SSR-safe: customElements only exists in the browser. Framework wrappers
    // (Vue, Solid, Angular, Astro, …) call define() from both server and client
    // environments, so this must be a no-op on the server.
    if (typeof customElements === "undefined") return;
    if (!customElements.get(tag)) {
      customElements.define(tag, ThemeKitScrollbar);
    }
  }
}
