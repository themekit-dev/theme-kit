import { useEffect, useRef } from "react";

/**
 * Scrolls to `targetId` whenever any value in `deps` changes, but never on the
 * first render. The scroll runs in a `useEffect` + `requestAnimationFrame` so
 * it measures the target's final position *after* React has committed the new
 * layout — otherwise content above the target that changes height (e.g. a
 * framework snippet) shifts the target after the scroll has already fired.
 */
export function useScrollToOnChange(
  targetId: string | undefined,
  ...deps: unknown[]
) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    const skip = isFirstRender.current;
    isFirstRender.current = false;

    if (!targetId || skip) return;

    const frame = requestAnimationFrame(() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, ...deps]);
}
