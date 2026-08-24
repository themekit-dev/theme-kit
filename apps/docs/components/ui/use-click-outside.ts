import {
  useEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

type UseClickOutsideProps = {
  rootRef: RefObject<HTMLElement | null>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

/**
 * Closes `open` when the user clicks outside `rootRef` or presses Escape.
 * Used by popovers and dropdowns.
 */
export function useClickOutside({
  rootRef,
  open,
  setOpen,
}: UseClickOutsideProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      const target = event.target;

      if (root && target instanceof Node && !root.contains(target)) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, setOpen, rootRef]);
}
