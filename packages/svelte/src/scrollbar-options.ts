import type { OverlayScrollbarOptions } from "@theme-kit/core";

/**
 * Props accepted by the Svelte `ThemeScrollbar` component.
 *
 * Extends the core overlay scrollbar options to configure the overlay engine
 * (auto-hide, thickness, colors, axes, touch, direction, and so on). The
 * component renders nothing itself; it only creates and tears down the overlay
 * engine.
 *
 * Lives in its own module so `theme-scrollbar.svelte` can import it without
 * importing the barrel — a component that imported `index.ts` would create a
 * cycle, since the barrel exports the component.
 */
export interface ThemeScrollbarProps extends OverlayScrollbarOptions {}

/**
 * Narrows a `ThemeScrollbarProps` object to the overlay-engine options.
 *
 * Defined values are copied one key at a time and `undefined` keys are dropped
 * entirely, so an explicitly-undefined prop cannot override an engine default.
 * The result is a fresh object; `props` is never mutated.
 *
 * @param props - The component's props. Omit or pass `undefined` for an empty
 *   options object.
 * @returns A new `OverlayScrollbarOptions` containing only the keys that were
 *   defined on `props`.
 */
export function pickOptions(props?: ThemeScrollbarProps): OverlayScrollbarOptions {
  const opts: OverlayScrollbarOptions = {};
  if (!props) return opts;
  if (props.autoHide !== undefined) opts.autoHide = props.autoHide;
  if (props.autoHideDelay !== undefined) opts.autoHideDelay = props.autoHideDelay;
  if (props.hoverExpand !== undefined) opts.hoverExpand = props.hoverExpand;
  if (props.draggable !== undefined) opts.draggable = props.draggable;
  if (props.clickToJump !== undefined) opts.clickToJump = props.clickToJump;
  if (props.smooth !== undefined) opts.smooth = props.smooth;
  if (props.overscroll !== undefined) opts.overscroll = props.overscroll;
  if (props.arrows !== undefined) opts.arrows = props.arrows;
  if (props.arrowIcon !== undefined) opts.arrowIcon = props.arrowIcon;
  if (props.arrowUpIcon !== undefined) opts.arrowUpIcon = props.arrowUpIcon;
  if (props.arrowDownIcon !== undefined) opts.arrowDownIcon = props.arrowDownIcon;
  if (props.arrowLeftIcon !== undefined) opts.arrowLeftIcon = props.arrowLeftIcon;
  if (props.arrowRightIcon !== undefined) opts.arrowRightIcon = props.arrowRightIcon;
  if (props.thickness !== undefined) opts.thickness = props.thickness;
  if (props.hoverThickness !== undefined)
    opts.hoverThickness = props.hoverThickness;
  if (props.radius !== undefined) opts.radius = props.radius;
  if (props.minThumbSize !== undefined) opts.minThumbSize = props.minThumbSize;
  if (props.offset !== undefined) opts.offset = props.offset;
  if (props.trackOpacity !== undefined) opts.trackOpacity = props.trackOpacity;
  if (props.thumbOpacity !== undefined) opts.thumbOpacity = props.thumbOpacity;
  if (props.thumbColor !== undefined) opts.thumbColor = props.thumbColor;
  if (props.trackColor !== undefined) opts.trackColor = props.trackColor;
  if (props.activeThumbColor !== undefined)
    opts.activeThumbColor = props.activeThumbColor;
  if (props.thumbHoverColor !== undefined)
    opts.thumbHoverColor = props.thumbHoverColor;
  if (props.zIndex !== undefined) opts.zIndex = props.zIndex;
  if (props.duration !== undefined) opts.duration = props.duration;
  if (props.animationDuration !== undefined)
    opts.animationDuration = props.animationDuration;
  if (props.axes !== undefined) opts.axes = props.axes;
  if (props.include !== undefined) opts.include = props.include;
  if (props.exclude !== undefined) opts.exclude = props.exclude;
  if (props.touch !== undefined) opts.touch = props.touch;
  if (props.dir !== undefined) opts.dir = props.dir;
  return opts;
}
