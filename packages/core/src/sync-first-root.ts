/**
 * Synchronous-first-render wrapper for a React `createRoot`.
 *
 * @packageDocumentation
 */
/**
 * The shape this helper wraps: React's `createRoot` with a `render` method.
 *
 * Typed structurally, and the render argument as `unknown`, so core carries no
 * React dependency — it is framework-agnostic and must stay that way.
 */
export interface SyncFirstRenderRoot {
  /** Render a tree into the root. */
  render(node: unknown): unknown;
  /** Tear the root down. */
  unmount(): void;
  [key: string]: unknown;
}

/** React's `createRoot`, structurally. */
export type CreateRootLike<TRoot extends SyncFirstRenderRoot> = (
  container: Element | DocumentFragment,
  options?: unknown,
) => TRoot;

/**
 * Options for {@link createSyncFirstRoot}.
 *
 * @see {@link createSyncFirstRoot}
 */
export interface SyncFirstRootOptions {
  /**
   * Wrap only the **first** root created, and pass every later one through
   * untouched. Defaults to `false`.
   *
   * @remarks
   * This is what a build-time integration wants. Libraries legitimately call
   * `createRoot` from an effect — Theme Kit's own `ThemeScrollbar` does, once per
   * arrow — and flushing inside React's commit phase makes React log
   * *"flushSync was called from inside a lifecycle method"*. The application's
   * own root is created at module scope before anything renders, so it is always
   * first; the rest have nothing to gain and a warning to lose.
   */
  onlyFirstRoot?: boolean;
}

/**
 * Wraps a React `createRoot` so the **first** `render` call on each root it
 * creates is committed synchronously.
 *
 * @typeParam TRoot - The root object React returns.
 * @param createRoot - The real `createRoot` to delegate to.
 * @param flushSync - React's `flushSync`.
 * @param options - See {@link SyncFirstRootOptions}.
 * @returns A `createRoot` that commits its first render synchronously.
 *
 * @remarks
 * React's concurrent root *schedules* the initial commit, so the browser can
 * paint a frame with the container still empty before React commits — one frame,
 * ~33 ms, visible as the UI blinking on reload. `flushSync` around that first
 * render closes it, and it has to happen at the root: the offending frame is
 * painted before any of the application's React code runs, so no provider,
 * insertion effect or layout effect is in time.
 *
 * Only the **first** `render` of each root is flushed. Every later render keeps
 * React's normal concurrent scheduling, so transitions, Suspense and
 * time-slicing behave exactly as before.
 *
 * This is deliberately a plain function of its dependencies rather than
 * something that reaches for React globals, so it can be unit-tested against
 * stubs — the behaviour it encodes (first render flushed, later renders not) is
 * otherwise only observable in a real browser.
 *
 * @see {@link themeKitVitePlugin} — applies this to application code
 *   automatically, via a `react-dom/client` shim.
 */
export function createSyncFirstRoot<TRoot extends SyncFirstRenderRoot>(
  createRoot: CreateRootLike<TRoot>,
  flushSync: (callback: () => void) => void,
  options: SyncFirstRootOptions = {},
): CreateRootLike<TRoot> {
  let claimed = false;

  return function createSyncRoot(container, rootOptions) {
    const root = createRoot(container, rootOptions);

    if (options.onlyFirstRoot) {
      if (claimed) return root;
      claimed = true;
    }

    let first = true;

    return new Proxy(root, {
      get(target, prop, receiver) {
        if (prop === "render") {
          return function render(node: unknown) {
            if (!first) {
              return (target.render as (n: unknown) => unknown).call(target, node);
            }
            first = false;
            let result: unknown;
            flushSync(() => {
              result = (target.render as (n: unknown) => unknown).call(target, node);
            });
            return result;
          };
        }
        const value = Reflect.get(target, prop, receiver);
        return typeof value === "function" ? value.bind(target) : value;
      },
    }) as TRoot;
  };
}
