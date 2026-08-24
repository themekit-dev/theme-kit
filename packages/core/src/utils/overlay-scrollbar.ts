/**
 * Backward-compatible entry point for the scrollbar overlay engine.
 *
 * The full engine (five layers: scroll manager, thumb physics, renderer,
 * interaction layer, theme integration) lives in `../scrollbar/`; this module
 * re-exports it so existing imports keep working without code changes.
 */
export * from "../scrollbar";
