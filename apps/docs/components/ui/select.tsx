"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@iconify/react";

import { useClickOutside } from "./use-click-outside";
import { useFocusTrap } from "./use-focus-trap";

export type SelectOption = {
  value: string;
  label: string;
  /** Optional secondary line, e.g. a timezone offset. */
  hint?: string;
  /** Optional leading swatch, e.g. a theme's primary color. */
  swatch?: string;
};

/**
 * Themed select.
 *
 * Replaces native `<select>` elements, whose popup is rendered by the OS and
 * cannot be styled — so it ignored the theme entirely and looked nothing like the
 * rest of the docs. This follows the ARIA combobox + listbox pattern: the trigger
 * exposes `aria-expanded`, the panel is a `role="listbox"`, and options are
 * `role="option"` with `aria-selected`.
 *
 * Keyboard: Enter/Space/ArrowDown open, ArrowUp/Down move, Home/End jump,
 * Enter/Space select, Escape closes and returns focus to the trigger.
 */
export function Select({
  value,
  onChange,
  options,
  label,
  className = "",
  align = "start",
  size = "md",
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Accessible name for the trigger. */
  label: string;
  className?: string;
  /** Which edge the panel aligns to. */
  align?: "start" | "end";
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((o) => o.value === value)),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const baseId = useId();

  useClickOutside({ rootRef, open, setOpen });
  useFocusTrap(listRef, false);

  const selected = options.find((o) => o.value === value);
  const listId = `${baseId}-listbox`;

  // Keep the highlight on the selected option each time the panel opens.
  useEffect(() => {
    if (open) {
      const i = options.findIndex((o) => o.value === value);
      setActiveIndex(i === -1 ? 0 : i);
    }
  }, [open, options, value]);

  // Escape is handled by `useClickOutside`. Focus never leaves the trigger
  // (the highlight is tracked with `activeIndex` rather than by moving focus
  // into the panel), so there is nothing to restore when it closes.

  const commit = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const move = (delta: number) => {
    setActiveIndex((i) => {
      const next = (i + delta + options.length) % options.length;
      return next;
    });
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        move(-1);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        commit(activeIndex);
        break;
    }
  };

  const pad = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        className={`w-full inline-flex items-center gap-2 rounded-lg border bg-card font-medium cursor-pointer transition-colors ${pad} ${
          open ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-ring"
        }`}
      >
        {selected?.swatch ? (
          <span
            className="w-3 h-3 rounded-full shrink-0 border border-black/10"
            style={{ background: selected.swatch }}
            aria-hidden
          />
        ) : null}
        <span className="flex-1 min-w-0 truncate text-left">{selected?.label ?? value}</span>
        <Icon
          icon="ph:caret-up-down"
          width={10}
          height={10}
          className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          /*
            `pr-3` leaves room for the site's overlay scrollbar. The docs theme
            draws its scrollbar *on top of* the content (`tk-thumb`), so with the
            previous 4px padding the thumb overlapped the option labels — which
            read as "no gap" and made the thumb the topmost element under the
            pointer. `overscroll-contain` stops a scroll gesture inside the panel
            from chaining to the page behind it.
          */
          className={`absolute z-50 mt-1.5 max-h-72 w-full min-w-56 overflow-auto overscroll-contain rounded-xl border border-border bg-card py-1 pl-1 pr-3 shadow-lg ${
            align === "end" ? "right-0" : "left-0"
          }`}
        >
          {options.map((option, i) => {
            const isSelected = option.value === value;
            const isActive = i === activeIndex;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => commit(i)}
                  className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm cursor-pointer ${
                    isActive ? "bg-muted" : ""
                  }`}
                >
                  {option.swatch ? (
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                      style={{ background: option.swatch }}
                      aria-hidden
                    />
                  ) : null}
                  <span className="flex-1 min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.hint ? (
                      <span className="block text-[10px] text-muted-foreground truncate">
                        {option.hint}
                      </span>
                    ) : null}
                  </span>
                  {isSelected ? (
                    <Icon
                      icon="ph:check"
                      width={12}
                      height={12}
                      className="shrink-0 text-primary"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
