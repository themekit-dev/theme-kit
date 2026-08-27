/**
 * Scrollbar overlay engine — public options, runtime types and per-host
 * runtime state.
 *
 * The philosophy: the browser always performs the scrolling. This module only
 * renders a theme-aware, animated overlay that *represents* the scrollbar. It
 * never replaces or moves native scrolling — it only synchronizes with it.
 */

export type ScrollbarAxis = "vertical" | "horizontal";

/** Direction of a single arrow button on an axis strip. */
export type ScrollbarArrowDir = "up" | "down" | "left" | "right";

/** A raw arrow glyph for a scrollbar button. Accepts an HTML/`innerHTML` string,
 *  a DOM node (element / inline SVG / text) or an array of both. */
/** @internal */
export type ArrowIcon = string | Node | Array<string | Node>;

/** A live arrow button element plus its direction. */
/** @internal */
export interface ArrowButton {
  dir: ScrollbarArrowDir;
  element: HTMLDivElement;
}

export interface OverlayScrollbarOptions {
  /** Fade the thumb/track out while idle. Default `true` (macOS-style). */
  autoHide?: boolean;
  /** Idle (ms) before a revealed strip fades out after its last activity.
   *  Each host has its own timer, so only the strip you're scrolling/hovering
   *  is revealed, then it fades after idle; other scrollbars stay hidden.
   *  Default `900`. Only takes effect when `autoHide` is `true`. */
  autoHideDelay?: number;
  /** Grow the strip on hover / drag. Default `false` (thickness stays
   *  constant so the scrollbar never shifts while scrolling). */
  hoverExpand?: boolean;
  /** Allow dragging the thumb to scroll. Default `true`. */
  draggable?: boolean;
  /** Clicking the empty track scrolls smoothly to that position. Default `true`. */
  clickToJump?: boolean;
  /** Use rAF-lerped (eased) thumb motion instead of a hard snap. Default `true`. */
  smooth?: boolean;
  /** Subtly compress the thumb at the scroll boundaries (rubber-band feel). Default `true`. */
  overscroll?: boolean;
  /** Resting thumb thickness (width for vertical, height for horizontal). Default `8`. */
  thickness?: number;
  /** Thumb thickness while hovered / dragged — only used when `hoverExpand` is true. Default `thickness + 4`. */
  hoverThickness?: number;
  /** Show the up/down (or left/right) navigation buttons like native browser
   *  scrollbars. Clicking scrolls a step; holding repeats. Default `true`. */
  arrows?: boolean;
  /** Optional content shown inside every arrow button (overrides the built-in
   *  CSS triangle). Accepts an `innerHTML` string, a DOM node (element / inline
   *  SVG / text) or an array of both. */
  arrowIcon?: ArrowIcon;
  /** Content for the "scroll up" button. Falls back to `arrowIcon`. */
  arrowUpIcon?: ArrowIcon;
  /** Content for the "scroll down" button. Falls back to `arrowIcon`. */
  arrowDownIcon?: ArrowIcon;
  /** Content for the "scroll left" button. Falls back to `arrowIcon`. */
  arrowLeftIcon?: ArrowIcon;
  /** Content for the "scroll right" button. Falls back to `arrowIcon`. */
  arrowRightIcon?: ArrowIcon;
  /** Framework hook: invoked for every arrow button that has custom content, so
   *  framework wrappers (React/Vue/Svelte/...) can render framework-owned
   *  elements (JSX/VNodes/...) into the button. When set it replaces the
   *  `innerHTML`/node injection for `arrowIcon`-style options. */
  arrowIconRenderer?: (button: HTMLDivElement, dir: ScrollbarArrowDir) => void;
  /** Thumb corner radius in px. Default `999`. */
  radius?: number;
  /** Minimum thumb travel size. Default `32`. */
  minThumbSize?: number;
  /** Gap between the thumb and the container edge in px. Default `2`. */
  offset?: number;
  /** Track strip opacity (0 = invisible). Default `0.25`. */
  trackOpacity?: number;
  /** Thumb opacity while visible. Default `0.7`. */
  thumbOpacity?: number;
  /** Custom thumb color (any CSS color string). When set, overrides
   *  the theme-derived color. Default `undefined` (theme-derived). */
  thumbColor?: string;
  /** Custom track color (any CSS color string). When set, overrides
   *  the theme-derived color. Default `undefined` (theme-derived). */
  trackColor?: string;
  /** Custom thumb color while the user is dragging it. When set,
   *  overrides the theme-derived active color. Default `undefined`
   *  (uses `thumbColor` or theme-derived). */
  activeThumbColor?: string;
  /** Custom thumb color while hovered. When set, overrides the
   *  theme-derived hover color. Default `undefined` (uses `thumbColor`
   *  or theme-derived). */
  thumbHoverColor?: string;
  /** Z-index for the overlay strips. Defaults to the tracked container's own
   *  `z-index` (so the scrollbar stays inside its container's stacking order —
   *  e.g. below a sticky header). The document scrollbar defaults to `55`
   *  (above typical sticky headers, below full-screen modal backdrops) and
   *  containers without a z-index default to `30`. Overriding lets you force
   *  scrollbars above fixed headers/modals if you need to. */
  zIndex?: number;
  /** CSS transition duration (ms) for thickness/opacity/color. Default `250`. */
  duration?: number;
  /** rAF easing time constant (ms) for smooth thumb travel. Default `180`. */
  animationDuration?: number;
  /** Which axes to render. Defaults to both. */
  axes?: ScrollbarAxis[];
  /** Scope overlay to these CSS selectors for inner scrollables (the window is
   *  always tracked). When empty, all scrollable elements are tracked. */
  include?: string[] | null;
  /** Skip these CSS selectors when tracking inner scrollables. */
  exclude?: string[] | null;
  /** Native (touch) devices: keep native scrollbars by default. Pass `true` to
   *  force the overlay on coarse-pointer devices. Default `false`. */
  touch?: boolean;
  /** Text direction. Defaults to the resolved `dir` / CSS `direction`. */
  dir?: "ltr" | "rtl" | "auto";
}

export interface OverlayScrollbarHandle {
  /** Force a synchronize of layout + physics. */
  update(): void;
  /** Tear down all DOM, observers and listeners. */
  destroy(): void;
}

/** Resolved (defaulted) options used internally. */
export interface ScrollbarOptionsResolved {
    autoHide: boolean;
  autoHideDelay: number;
  hoverExpand: boolean;
  draggable: boolean;
  clickToJump: boolean;
  smooth: boolean;
  overscroll: boolean;
  arrows: boolean;
  arrowIcon: ArrowIcon | undefined;
  arrowUpIcon: ArrowIcon | undefined;
  arrowDownIcon: ArrowIcon | undefined;
  arrowLeftIcon: ArrowIcon | undefined;
  arrowRightIcon: ArrowIcon | undefined;
  arrowIconRenderer: ((button: HTMLDivElement, dir: ScrollbarArrowDir) => void) | undefined;
  thickness: number;
  hoverThickness: number;
  radius: number;
  minThumbSize: number;
  offset: number;
  trackOpacity: number;
  thumbOpacity: number;
  thumbColor: string | undefined;
  trackColor: string | undefined;
  activeThumbColor: string | undefined;
  thumbHoverColor: string | undefined;
  zIndex: number | undefined;
  duration: number;
  animationDuration: number;
  axes: ScrollbarAxis[];
  include: string[];
  exclude: string[];
  touch: boolean;
  dir: "ltr" | "rtl";
}

/** Frozen per-axis view state written into the DOM. */
/** @internal */
export interface RenderState {
  /** Base travel size (height for vertical, width for horizontal), before translate. */
  size: number;
  /** Final travel size after overscroll compression. */
  drawSize: number;
  /** Target translate in px (the smoothed resting position). */
  targetTranslate: number;
  /** Current translate in px (lerped toward the target). */
  currentTranslate: number;
}

/** Per-axis runtime state for a single scroll container (host). */
/** @internal */
export interface AxisState {
  axis: ScrollbarAxis;
  root: HTMLDivElement;
  track: HTMLDivElement;
  thumb: HTMLDivElement;
  btnTop: HTMLDivElement;
  btnBottom: HTMLDivElement;
  dragging: boolean;
  hovered: boolean;
  shown: boolean;
  pointerId: number;
  /** Start offset for drag. */
  dragStartClient: number;
  dragStartScroll: number;
  /** Physics/overscroll view. */
  render: RenderState;
  /** Last written fixed-placement geometry of the strip. Used to detect motion
   *  — when a host (or an ancestor) is being animated by a CSS transform /
   *  opacity transition, no scroll/resize/mutation event fires, so the strip
   *  would otherwise stay glued to its stale position. Comparing this snapshot
   *  per frame lets the render loop keep running (and re-position the strip)
   *  until the animation settles, keeping the bar visually attached to its
   *  container. */
  lastGeometry:
    | { display: string; left: number; top: number; width: number; height: number }
    | null;
  /** Whether the strip root is currently rendered (`display !== "none"`).
   *  Display toggles can't transition on their own, so show/hide is driven by a
   *  two-step opacity fade (prime at 0, ease to the target on the next frame,
   *  or ease to 0 and only then flip `display:none`) to match native bars. */
  __displayed: boolean;
  /** Pending timer that flips `display:none` once the fade-out completes. */
  __hideTimer: ReturnType<typeof setTimeout> | undefined;
  /** Internal teardown hook wired by the manager. */
  __cleanup: (() => void) | undefined;
}

/** A single managed scroll container. */
/** @internal */
export interface Host {
  target: HTMLElement;
  isRoot: boolean;
  vertical: AxisState | null;
  horizontal: AxisState | null;
  ro: ResizeObserver | null;
  hideTimer: ReturnType<typeof setTimeout> | null;
  /** Last witnessed visibility of the host. `undefined` until the first
   *  layout, so the engine can reveal a strip the *moment* a previously
   *  hidden scrollable (mobile menu, dialog, tabbed panel) becomes visible —
   *  without flashing every visible scrollable on the initial page load. */
  prevVisible?: boolean;
  /** Effective opacity (product of the ancestor chain) on the last layout
   *  pass. When it decreases between frames the host is fading out (e.g. a
   *  panel closing), so the strip dissolves in sync instead of lingering
   *  fully opaque while the container fades away. */
  prevOpacity?: number;
  /** Cleanup for host-level (target) listeners, e.g. container hover. */
  targetCleanup?: () => void;
}