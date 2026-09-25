/**
 * Public surface of the showcase compositions.
 *
 * The implementations live in `./scenes/*` and the shared product primitives in
 * `./ui`. This module is the single import point for the gallery, so the file
 * layout can change without touching call sites.
 */
export { COMPOSITIONS, type CompositionId } from "./scenes";
export type { CompositionProps } from "./ui";
