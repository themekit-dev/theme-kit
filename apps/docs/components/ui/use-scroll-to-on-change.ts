import { useEffect, useRef } from "react";

/**
 * Scrolls to `targetId` when the watched value actually changes — never on the
 * initial render.
 *
 * The guard compares against the previous dependency values rather than using a
 * "first render" boolean. A boolean is consumed on the first effect invocation,
 * and React StrictMode invokes mount effects **twice** in development: the
 * second invocation sees the flag already cleared and scrolls. That is why
 * navigating to a page with a picker jumped straight to the setup section before
 * the reader had chosen anything.
 *
 * The scroll runs in `requestAnimationFrame` so it measures the target's final
 * position *after* React has committed the new layout — otherwise content above
 * the target that changes height (e.g. a framework snippet) shifts the target
 * after the scroll has already fired.
 */
export function useScrollToOnChange(
  targetId: string | undefined,
  ...deps: unknown[]
) {
  const previous = useRef<unknown[] | null>(null);

  useEffect(() => {
    const before = previous.current;
    previous.current = deps;

    if (!targetId || before === null) return;
    // Nothing actually changed — StrictMode's second mount invocation, or a
    // re-render with an identical value. Do not move the viewport.
    if (before.length === deps.length && before.every((v, i) => v === deps[i])) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, ...deps]);
}
