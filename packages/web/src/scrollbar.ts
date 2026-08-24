import { createOverlayScrollbar, type OverlayScrollbarOptions } from "@theme-kit/core";
import { findProviderRuntime } from "./utils";

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
 * Creates the custom scrollbar overlay. Does NOT hide the native
 * scrollbar — that's the bootstrap script's job (Phase 1, tk-scrollbar).
 */
export class ThemeKitScrollbar extends HTMLElement {
  private handle: { destroy(): void } | null = null;

  connectedCallback() {
    const runtime = findProviderRuntime(this);
    if (!runtime) {
      this.addEventListener("theme-ready", () => this.init(), { once: true });
      return;
    }
    this.init();
  }

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
    if (!customElements.get(tag)) {
      customElements.define(tag, ThemeKitScrollbar);
    }
  }
}
