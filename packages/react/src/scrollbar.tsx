"use client";

import React, { useEffect, useInsertionEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  createPrePaintScrollbarScript,
  createOverlayScrollbar,
  type OverlayScrollbarHandle,
  type OverlayScrollbarOptions,
  type ScrollbarArrowDir,
  type ScrollbarAxis,
} from "@theme-kit/core";
import { useThemeRuntime } from "./provider";

type IconProp = React.ReactNode;

/** Behavior — how the overlay scrolls and hides. */
export interface ThemeScrollbarBehavior extends Pick<
  OverlayScrollbarOptions,
  | "autoHide"
  | "hoverExpand"
  | "draggable"
  | "clickToJump"
  | "smooth"
  | "overscroll"
  | "axes"
  | "touch"
  | "dir"
> {
  /** Idle (ms) before a revealed strip fades out. Default `900`. */
  autoHideDelay?: number;
}

/** Appearance — the look/size of every strip. */
export interface ThemeScrollbarAppearance extends Pick<
  OverlayScrollbarOptions,
  | "arrows"
  | "thickness"
  | "hoverThickness"
  | "radius"
  | "minThumbSize"
  | "offset"
  | "trackOpacity"
  | "thumbOpacity"
  | "zIndex"
  | "duration"
  | "animationDuration"
  | "thumbColor"
  | "trackColor"
  | "activeThumbColor"
  | "thumbHoverColor"
> {
  /** Scope the overlay to these containers (document is always tracked). */
  include?: string[] | null;
  /** Skip these containers when tracking. */
  exclude?: string[] | null;
}

/**
 * Arrow button icons (any `ReactNode` — JSX, inline SVG, text, …).
 */
export interface ThemeScrollbarIcons {
  /** Icon for all arrow directions (individual overrides win). */
  arrow?: React.ReactNode;
  /** Icon for the "scroll up" button. */
  up?: React.ReactNode;
  /** Icon for the "scroll down" button. */
  down?: React.ReactNode;
  /** Icon for the "scroll left" button. */
  left?: React.ReactNode;
  /** Icon for the "scroll right" button. */
  right?: React.ReactNode;
}

/**
 * Props for the {@link ThemeScrollbar} overlay component.
 *
 * Options are grouped into `behavior`, `appearance`, and `icons` — but every
 * option is also accepted as a flat, top-level prop (flat props win over the
 * grouped ones).
 */
export interface ThemeScrollbarProps {
  /** Grouped behavior options. Flat props (e.g. `autoHide`) override these. */
  behavior?: ThemeScrollbarBehavior;
  /** Grouped appearance options. Flat props override these. */
  appearance?: ThemeScrollbarAppearance;
  /** Grouped arrow button icons. Flat `arrow*Icon` props override these. */
  icons?: ThemeScrollbarIcons;
  /** JSX / element rendered inside every arrow button (overrides the built-in
   *  CSS triangle). Accepts any `ReactNode`. */
  arrowIcon?: IconProp;
  /** JSX / element for the "scroll up" button. Falls back to `arrowIcon`. */
  arrowUpIcon?: IconProp;
  /** JSX / element for the "scroll down" button. Falls back to `arrowIcon`. */
  arrowDownIcon?: IconProp;
  /** JSX / element for the "scroll left" button. Falls back to `arrowIcon`. */
  arrowLeftIcon?: IconProp;
  /** JSX / element for the "scroll right" button. Falls back to `arrowIcon`. */
  arrowRightIcon?: IconProp;
  /** Flat alias for `OverlayScrollbarOptions.autoHide`. */
  autoHide?: boolean;
  /** Idle (ms) before a revealed strip fades out after its last activity.
   *  Each host has its own timer, so only the strip you're scrolling/hovering
   *  is revealed, then it fades after idle; other scrollbars stay hidden.
   *  Default `900`. Only takes effect when `autoHide` is `true`. */
  autoHideDelay?: number;
  /** Flat alias for `OverlayScrollbarOptions.hoverExpand`. */
  hoverExpand?: boolean;
  /** Flat alias for `OverlayScrollbarOptions.draggable`. */
  draggable?: boolean;
  /** Flat alias for `OverlayScrollbarOptions.clickToJump`. */
  clickToJump?: boolean;
  /** Flat alias for `OverlayScrollbarOptions.smooth`. */
  smooth?: boolean;
  /** Flat alias for `OverlayScrollbarOptions.overscroll`. */
  overscroll?: boolean;
  /** Flat alias for `OverlayScrollbarOptions.arrows`. */
  arrows?: boolean;
  /** Flat alias for `OverlayScrollbarOptions.thickness`. */
  thickness?: number;
  /** Flat alias for `OverlayScrollbarOptions.hoverThickness`. */
  hoverThickness?: number;
  /** Flat alias for `OverlayScrollbarOptions.radius`. */
  radius?: number;
  /** Flat alias for `OverlayScrollbarOptions.minThumbSize`. */
  minThumbSize?: number;
  /** Flat alias for `OverlayScrollbarOptions.offset`. */
  offset?: number;
  /** Flat alias for `OverlayScrollbarOptions.trackOpacity`. */
  trackOpacity?: number;
  /** Flat alias for `OverlayScrollbarOptions.thumbOpacity`. */
  thumbOpacity?: number;
  /** Flat alias for `OverlayScrollbarOptions.thumbColor`. */
  thumbColor?: string;
  /** Flat alias for `OverlayScrollbarOptions.trackColor`. */
  trackColor?: string;
  /** Flat alias for `OverlayScrollbarOptions.activeThumbColor`. */
  activeThumbColor?: string;
  /** Flat alias for `OverlayScrollbarOptions.thumbHoverColor`. */
  thumbHoverColor?: string;
  /** Flat alias for `OverlayScrollbarOptions.zIndex`. */
  zIndex?: number | undefined;
  /** Flat alias for `OverlayScrollbarOptions.duration`. */
  duration?: number;
  /** Flat alias for `OverlayScrollbarOptions.animationDuration`. */
  animationDuration?: number;
  /** Flat alias for `OverlayScrollbarOptions.axes`. */
  axes?: ScrollbarAxis[];
  /** Flat alias for `OverlayScrollbarOptions.include`. */
  include?: string[] | null;
  /** Flat alias for `OverlayScrollbarOptions.exclude`. */
  exclude?: string[] | null;
  /** Flat alias for `OverlayScrollbarOptions.touch`. */
  touch?: boolean;
  /** Flat alias for `OverlayScrollbarOptions.dir`. */
  dir?: "ltr" | "rtl" | "auto";
  /** Renders nothing visible; kept for API symmetry (the overlay is created
   *  against the runtime, not the component tree). */
  children?: React.ReactNode;
}

function isIcon(value: React.ReactNode): value is NonNullable<React.ReactNode> {
  return value !== undefined && value !== null && value !== false;
}

/**
 * A stable key for the overlay's options.
 *
 * The engine resolves its options once, when the overlay is created, so a prop
 * change only takes effect if the overlay is recreated. Keying the creation
 * effect on this string is what makes an updated prop apply without a reload.
 *
 * React elements and functions cannot be stringified, so they are reduced to a
 * token that still tells one icon from another (`el:ArrowUp` vs `el:ArrowDown`).
 * `children` is excluded: it is accepted for API symmetry and never reaches the
 * engine, so changing it must not tear the overlay down.
 */
function optionsKeyOf(props: ThemeScrollbarProps): string {
  return JSON.stringify(props, (key, value) => {
    if (key === "children") return undefined;
    if (typeof value === "function") return "fn";
    if (value && typeof value === "object" && "$$typeof" in value) {
      const type = (value as { type?: unknown }).type;
      const name =
        typeof type === "string"
          ? type
          : ((type as { displayName?: string; name?: string } | undefined)
              ?.displayName ??
            (type as { name?: string } | undefined)?.name ??
            "el");
      return `el:${name}`;
    }
    return value;
  });
}

/**
 * ThemeScrollbar — overlay only.
 *
 * Creates the custom scrollbar overlay.
 *
 * Lifecycle:
 *   mount  → create overlay → measure → attach listeners
 *   paint  → add tk-scrollbar-ready
 *   destroy → remove overlay
 *
 * Props are organized into three optional groups — `behavior`, `appearance`
 * and `icons` — but every option is also accepted as a flat, top-level prop
 * (flat props win over the grouped ones).
 *
 *   <ThemeScrollbar
 *     behavior={{ autoHide: true, smooth: true }}
 *     appearance={{ thickness: 8, radius: 999 }}
 *     icons={{ up: <ArrowUpIcon />, down: <ArrowDownIcon /> }}
 *   />
 *
 * @see {@link ThemeProvider}
 * @see `OverlayScrollbarOptions`
 */
export function ThemeScrollbar(props: ThemeScrollbarProps) {
  const runtime = useThemeRuntime();
  const handleRef = useRef<OverlayScrollbarHandle | null>(null);
  const optionsKey = optionsKeyOf(props);

  // Phase 1 — hide the native scrollbar before the first paint. The blocking
  // script adds `tk-scrollbar` to <html> plus a <style> hiding native bars, so
  // the custom overlay is the only scrollbar from the very first frame
  // (matching the Next.js/Nuxt SSR experience). Idempotent: when the Vite
  // plugin or an SSR adapter already emitted it, this no-ops.
  useInsertionEffect(() => {
    if (typeof document === "undefined" || !document.head) return;
    if (document.getElementById("tk-scrollbar-style")) return;
    const script = document.createElement("script");
    script.text = createPrePaintScrollbarScript();
    document.head.appendChild(script);
  }, []);

  const {
    behavior = {},
    appearance = {},
    icons = {},
    arrowIcon,
    arrowUpIcon,
    arrowDownIcon,
    arrowLeftIcon,
    arrowRightIcon,
    // flat overrides
    autoHide,
    autoHideDelay,
    hoverExpand,
    draggable,
    clickToJump,
    smooth,
    overscroll,
    arrows,
    thickness,
    hoverThickness,
    radius,
    minThumbSize,
    offset,
    trackOpacity,
    thumbOpacity,
    thumbColor,
    trackColor,
    activeThumbColor,
    thumbHoverColor,
    zIndex,
    duration,
    animationDuration,
    axes,
    include,
    exclude,
    touch,
    dir,
  } = props;

  useEffect(() => {
    const opts: OverlayScrollbarOptions = {};
    // behavior — grouped props, flat overrides win
    if (autoHide !== undefined) opts.autoHide = autoHide;
    else if (behavior.autoHide !== undefined) opts.autoHide = behavior.autoHide;
    if (autoHideDelay !== undefined) opts.autoHideDelay = autoHideDelay;
    else if (behavior.autoHideDelay !== undefined)
      opts.autoHideDelay = behavior.autoHideDelay;
    if (hoverExpand !== undefined) opts.hoverExpand = hoverExpand;
    else if (behavior.hoverExpand !== undefined)
      opts.hoverExpand = behavior.hoverExpand;
    if (draggable !== undefined) opts.draggable = draggable;
    else if (behavior.draggable !== undefined)
      opts.draggable = behavior.draggable;
    if (clickToJump !== undefined) opts.clickToJump = clickToJump;
    else if (behavior.clickToJump !== undefined)
      opts.clickToJump = behavior.clickToJump;
    if (smooth !== undefined) opts.smooth = smooth;
    else if (behavior.smooth !== undefined) opts.smooth = behavior.smooth;
    if (overscroll !== undefined) opts.overscroll = overscroll;
    else if (behavior.overscroll !== undefined)
      opts.overscroll = behavior.overscroll;
    if (axes !== undefined) opts.axes = axes;
    else if (behavior.axes !== undefined) opts.axes = behavior.axes;
    if (touch !== undefined) opts.touch = touch;
    else if (behavior.touch !== undefined) opts.touch = behavior.touch;
    if (dir !== undefined) opts.dir = dir;
    else if (behavior.dir !== undefined) opts.dir = behavior.dir;

    // appearance — grouped props, flat overrides win
    if (arrows !== undefined) opts.arrows = arrows;
    else if (appearance.arrows !== undefined) opts.arrows = appearance.arrows;
    if (thickness !== undefined) opts.thickness = thickness;
    else if (appearance.thickness !== undefined)
      opts.thickness = appearance.thickness;
    if (hoverThickness !== undefined) opts.hoverThickness = hoverThickness;
    else if (appearance.hoverThickness !== undefined)
      opts.hoverThickness = appearance.hoverThickness;
    if (radius !== undefined) opts.radius = radius;
    else if (appearance.radius !== undefined) opts.radius = appearance.radius;
    if (minThumbSize !== undefined) opts.minThumbSize = minThumbSize;
    else if (appearance.minThumbSize !== undefined)
      opts.minThumbSize = appearance.minThumbSize;
    if (offset !== undefined) opts.offset = offset;
    else if (appearance.offset !== undefined) opts.offset = appearance.offset;
    if (trackOpacity !== undefined) opts.trackOpacity = trackOpacity;
    else if (appearance.trackOpacity !== undefined)
      opts.trackOpacity = appearance.trackOpacity;
    if (thumbOpacity !== undefined) opts.thumbOpacity = thumbOpacity;
    else if (appearance.thumbOpacity !== undefined)
      opts.thumbOpacity = appearance.thumbOpacity;
    if (zIndex !== undefined) opts.zIndex = zIndex;
    else if (appearance.zIndex !== undefined) opts.zIndex = appearance.zIndex;
    if (duration !== undefined) opts.duration = duration;
    else if (appearance.duration !== undefined)
      opts.duration = appearance.duration;
    if (animationDuration !== undefined)
      opts.animationDuration = animationDuration;
    else if (appearance.animationDuration !== undefined)
      opts.animationDuration = appearance.animationDuration;
    if (thumbColor !== undefined) opts.thumbColor = thumbColor;
    else if (appearance.thumbColor !== undefined)
      opts.thumbColor = appearance.thumbColor;
    if (trackColor !== undefined) opts.trackColor = trackColor;
    else if (appearance.trackColor !== undefined)
      opts.trackColor = appearance.trackColor;
    if (activeThumbColor !== undefined)
      opts.activeThumbColor = activeThumbColor;
    else if (appearance.activeThumbColor !== undefined)
      opts.activeThumbColor = appearance.activeThumbColor;
    if (thumbHoverColor !== undefined) opts.thumbHoverColor = thumbHoverColor;
    else if (appearance.thumbHoverColor !== undefined)
      opts.thumbHoverColor = appearance.thumbHoverColor;
    if (include !== undefined) opts.include = include;
    else if (appearance.include !== undefined)
      opts.include = appearance.include;
    if (exclude !== undefined) opts.exclude = exclude;
    else if (appearance.exclude !== undefined)
      opts.exclude = appearance.exclude;

    // Framework-owned arrow content: JSX/`ReactNode` icons are rendered into
    // each arrow button via its own React root, so SVG/component icons work for
    // every scrollable host the engine picks up (including ones discovered
    // later). Strings render natively; dirs without a custom icon keep the
    // built-in CSS triangle. `icons.*` overrides are the grouped form.
    const arrowUp = arrowUpIcon ?? icons.up ?? icons.arrow;
    const arrowDown = arrowDownIcon ?? icons.down ?? icons.arrow;
    const arrowLeft = arrowLeftIcon ?? icons.left ?? icons.arrow;
    const arrowRight = arrowRightIcon ?? icons.right ?? icons.arrow;
    /** Wrap a JSX arrow icon and rotate it so a vertical glyph can serve the
     *  horizontal arrows (and vice-versa) — one custom glyph family, four
     *  native-consistent buttons. */
    const rotated = (icon: React.ReactNode, deg: number): React.ReactNode =>
      isIcon(icon) ? (
        <span
          aria-hidden
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            transform: `rotate(${deg}deg)`,
          }}
        >
          {icon}
        </span>
      ) : null;
    const first = (...nodes: Array<React.ReactNode | null>): React.ReactNode =>
      nodes.find(isIcon) ?? null;
    const iconByDir: Record<ScrollbarArrowDir, React.ReactNode> = {
      up: arrowUp ?? first(rotated(arrowRight, -90), rotated(arrowLeft, 90)),
      down:
        arrowDown ?? first(rotated(arrowRight, 90), rotated(arrowLeft, -90)),
      left: arrowLeft ?? first(rotated(arrowUp, -90), rotated(arrowRight, 180)),
      right: arrowRight ?? first(rotated(arrowUp, 90), rotated(arrowLeft, 180)),
    };
    const hasCustomIcons = [arrowUp, arrowDown, arrowLeft, arrowRight].some(
      isIcon,
    );
    const roots = new Map<HTMLDivElement, Root>();
    if (hasCustomIcons) {
      opts.arrowIconRenderer = (el, arrowDir) => {
        const node = iconByDir[arrowDir];
        if (!isIcon(node)) return;
        el.classList.add("tk-arrow-custom");
        const existing = roots.get(el);
        if (existing) {
          existing.render(node);
          return;
        }
        const root = createRoot(el);
        roots.set(el, root);
        root.render(node);
      };
    }

    // Phase 2 — create overlay. The engine adds tk-scrollbar-ready to <html>
    // after the first paint (Phase 3).
    handleRef.current = createOverlayScrollbar(runtime.store, opts);

    return () => {
      handleRef.current?.destroy();
      handleRef.current = null;
      for (const root of roots.values()) root.unmount();
      roots.clear();
    };
    // Recreated when the resolved options change, so an updated prop takes
    // effect immediately instead of waiting for a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtime.store, optionsKey]);

  return null;
}
