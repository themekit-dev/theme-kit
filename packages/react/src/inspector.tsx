"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { themeToCSSVariables } from "@theme-kit/core";
import { useThemeRuntime } from "./provider";
import { useThemeValue } from "./hooks";

const DEFAULT_DURATION = 300;
// Default toggle placement (used when no props are passed). The panel always
// opens ABOVE the toggle (never covering it): toggle height + a small gap, so
// the toggle stays clickable to dismiss the panel.
const DEFAULT_BOTTOM_OFFSET = 104;
const DEFAULT_RIGHT_OFFSET = 32;
const DEFAULT_SIZE = 40;

type Phase = "closed" | "open" | "closing";

function isColorValue(value: string): boolean {
  return /^(#|rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|hwb|color-mix|light-dark)/i.test(
    value.trim(),
  );
}

function Section({
  label,
  count,
  children,
}: {
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: "16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          marginBottom: "6px",
        }}
      >
        <span
          style={{
            width: "3px",
            height: "12px",
            borderRadius: "2px",
            background: "var(--theme-color-primary)",
            opacity: 0.75,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontWeight: 600,
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.09em",
            color: "var(--theme-color-muted-foreground)",
          }}
        >
          {label}
        </span>
        {typeof count === "number" && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "10px",
              fontFamily: "var(--font-mono, monospace)",
              color: "var(--theme-color-muted-foreground)",
              opacity: 0.65,
            }}
          >
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function KeyValue({ k, v }: { k: string; v: string }) {
  const showSwatch = isColorValue(v);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        fontSize: "11.5px",
        padding: "3px 4px",
        borderRadius: "6px",
        fontFamily: "var(--font-mono, monospace)",
      }}
    >
      <span
        title={k}
        style={{
          color: "var(--theme-color-muted-foreground)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
        }}
      >
        {k}
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          minWidth: 0,
          maxWidth: "60%",
          justifyContent: "flex-end",
        }}
      >
        {showSwatch && (
          <span
            aria-hidden
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "3px",
              flexShrink: 0,
              background: v,
              border: "1px solid var(--theme-color-border)",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
            }}
          />
        )}
        <span
          title={v}
          style={{
            color: "var(--theme-color-foreground)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {v}
        </span>
      </span>
    </div>
  );
}

function Chip({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: "999px",
        fontSize: "10px",
        fontWeight: 600,
        textTransform: "capitalize",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        background: accent
          ? "color-mix(in srgb, var(--theme-color-primary) 14%, transparent)"
          : "var(--theme-color-muted)",
        color: accent
          ? "var(--theme-color-primary)"
          : "var(--theme-color-muted-foreground)",
        border: "1px solid var(--theme-color-border)",
      }}
    >
      {children}
    </span>
  );
}

function flattenTokens(
  obj: Record<string, unknown> | undefined,
  prefix = "",
): [string, string][] {
  if (!obj) return [];
  const entries: [string, string][] = [];

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null) {
      entries.push(...flattenTokens(value as Record<string, unknown>, path));
    } else if (typeof value === "string") {
      entries.push([path, value]);
    }
  }

  return entries;
}

function EyeIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function XIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export interface ThemeInspectorProps {
  /** Vertical distance from the bottom of the viewport, in px. Default 104. */
  bottom?: number;
  /** Horizontal distance from the right edge of the viewport, in px. Default 32. */
  right?: number;
  /** Toggle button size (width and height), in px. Default 40. */
  size?: number;
  /** Z-index for the floating toggle and panel. Default 9999. */
  zIndex?: number;
}

export function ThemeInspector({
  bottom = DEFAULT_BOTTOM_OFFSET,
  right = DEFAULT_RIGHT_OFFSET,
  size = DEFAULT_SIZE,
  zIndex = 9999,
}: ThemeInspectorProps = {}) {
  const runtime = useThemeRuntime();

  const [phase, setPhase] = useState<Phase>("closed");
  const [toggleHovered, setToggleHovered] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // The panel opens above the toggle with a gap, so the toggle stays clickable
  // to dismiss the panel.
  const panelBottom = bottom + size + 8;
  const panelMaxHeight = `min(480px, calc(100vh - ${panelBottom + 56}px))`;

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // Match the ThemeProvider's own transition duration so the panel fades in/out
  // at the same speed as theme changes (e.g. 200ms on the docs site).
  const duration = prefersReducedMotion
    ? 0
    : (runtime.transition?.duration ?? DEFAULT_DURATION);

  const isOpen = phase === "open";

  const open = useCallback(() => setPhase("open"), []);
  const close = useCallback((restoreFocus = true) => {
    setPhase("closing");
    // Only return focus to the toggle when the close came from within the
    // inspector (toggle / Esc). Closing by clicking outside must not steal
    // focus from wherever the user actually clicked.
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Clicking outside the inspector dismisses it without moving focus.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        close(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, close]);

  // Finish the exit animation, then drop the panel from the DOM.
  useEffect(() => {
    if (phase !== "closing") return;
    const timer = setTimeout(() => setPhase("closed"), duration);
    return () => clearTimeout(timer);
  }, [phase, duration]);

  return (
    <div ref={rootRef}>
      <button
        ref={toggleRef}
        type="button"
        part="inspector-toggle"
        onClick={isOpen ? () => close() : open}
        onMouseEnter={() => setToggleHovered(true)}
        onMouseLeave={() => setToggleHovered(false)}
        aria-label={isOpen ? "Close theme inspector" : "Open theme inspector"}
        aria-expanded={isOpen}
        title="Toggle Theme Inspector"
        style={{
          position: "fixed",
          bottom: `${bottom}px`,
          right: `${right}px`,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.round(size * 0.3)}px`,
          background: isOpen
            ? "var(--theme-color-muted)"
            : "color-mix(in srgb, var(--theme-color-primary) 80%, transparent)",
          color: isOpen
            ? "var(--theme-color-foreground)"
            : "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))",
          border: "1px solid var(--theme-color-border)",
          cursor: "pointer",
          fontSize: `${Math.round(size * 0.4)}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isOpen
            ? "none"
            : "0 8px 24px -8px color-mix(in srgb, var(--theme-color-primary) 60%, transparent)",
          transform: toggleHovered ? "scale(1.06)" : "scale(1)",
          transition: `transform 150ms cubic-bezier(0.16, 1, 0.3, 1), background-color ${duration}ms ease, color ${duration}ms ease, box-shadow ${duration}ms ease`,
          zIndex,
        }}
      >
        {isOpen ? <XIcon size={Math.round(size * 0.4)} /> : <EyeIcon size={Math.round(size * 0.45)} />}
      </button>

      <InspectorPanel
        isOpen={isOpen}
        visible={phase !== "closed"}
        duration={duration}
        onClose={() => close()}
        toggleRef={toggleRef}
        bottom={bottom}
        right={right}
        panelBottom={panelBottom}
        panelMaxHeight={panelMaxHeight}
        zIndex={zIndex}
      />
    </div>
  );
}

function InspectorPanel({
  isOpen,
  visible,
  duration,
  onClose,
  toggleRef,
  bottom,
  right,
  panelBottom,
  panelMaxHeight,
  zIndex,
}: {
  isOpen: boolean;
  visible: boolean;
  duration: number;
  onClose: () => void;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
  bottom: number;
  right: number;
  panelBottom: number;
  panelMaxHeight: string;
  zIndex: number;
}) {
  const runtime = useThemeRuntime();
  const theme = useThemeValue();
  const panelRef = useRef<HTMLDivElement>(null);
  const [closeHovered, setCloseHovered] = useState(false);

  const selection = runtime.selection.getSelection();
  const mode = runtime.selection.getMode();
  const family = runtime.selection.getFamily();

  const vars = themeToCSSVariables(theme);
  const tokenEntries = flattenTokens(theme.tokens as Record<string, unknown>);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const active = document.activeElement;
      const inContext =
        (panelRef.current && panelRef.current.contains(active)) ||
        active === toggleRef.current;
      if (inContext) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, toggleRef]);

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (isOpen) panelRef.current?.focus();
  }, [isOpen]);

  if (!visible) return null;

  const easing = "cubic-bezier(0.16, 1, 0.3, 1)";

  return (
    <div
      ref={panelRef}
      part="inspector-panel"
      role="dialog"
      aria-label="Theme inspector"
      aria-hidden={!isOpen}
      tabIndex={-1}
      style={{
        position: "fixed",
        bottom: `${panelBottom}px`,
        right: `${right}px`,
        width: "320px",
        maxHeight: panelMaxHeight,
        overflowY: "auto",
        overscrollBehavior: "contain",
        background:
          "color-mix(in srgb, var(--theme-color-card) 90%, transparent)",
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
        border: "1px solid var(--theme-color-border)",
        borderRadius: "14px",
        boxShadow: "0 24px 64px -24px rgba(0,0,0,0.45)",
        // Extra right padding keeps the overlay scrollbar off the content.
        padding: "14px 20px 16px 16px",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        fontSize: "12px",
        color: "var(--theme-color-foreground)",
        zIndex,
        transformOrigin: "bottom right",
        opacity: isOpen ? 1 : 0,
        transform: isOpen
          ? "translateY(0) scale(1)"
          : "translateY(12px) scale(0.96)",
        visibility: isOpen ? "visible" : "hidden",
        pointerEvents: isOpen ? "auto" : "none",
        transition: `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}, visibility 0s linear ${isOpen ? 0 : duration}ms`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          paddingRight: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            aria-hidden
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--theme-color-card)",
              boxShadow:
                "0 0 0 3px color-mix(in srgb, var(--theme-color-primary) 22%, transparent)",
            }}
          />
          <span
            style={{
              fontWeight: 700,
              fontSize: "12px",
              letterSpacing: "0.01em",
            }}
          >
            Theme Inspector
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          onMouseEnter={() => setCloseHovered(true)}
          onMouseLeave={() => setCloseHovered(false)}
          aria-label="Close theme inspector"
          style={{
            background: closeHovered
              ? "var(--theme-color-muted)"
              : "transparent",
            border: "1px solid transparent",
            borderRadius: "7px",
            cursor: "pointer",
            fontSize: "14px",
            lineHeight: 1,
            width: "26px",
            height: "26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--theme-color-muted-foreground)",
            transition: "background-color 120ms ease, color 120ms ease",
          }}
        >
          <XIcon size={14} />
        </button>
      </div>

      {/* Theme identity */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "6px",
          marginTop: "10px",
          paddingRight: "8px",
        }}
      >
        <span
          style={{
            fontSize: "12.5px",
            fontWeight: 600,
            color: "var(--theme-color-foreground)",
            marginRight: "2px",
          }}
        >
          {theme.name}
        </span>
        <Chip>{family}</Chip>
        <Chip accent>{mode}</Chip>
      </div>

      <div
        style={{
          height: "1px",
          margin: "14px 0 0",
          background:
            "linear-gradient(90deg, var(--theme-color-border), transparent)",
        }}
      />

      <Section label="Theme">
        <KeyValue k="Name" v={String(theme.name)} />
        <KeyValue k="Family" v={family} />
        <KeyValue k="Mode" v={mode} />
        <KeyValue k="Applied" v={theme.meta?.mode ?? "unknown"} />
      </Section>

      <Section label="Selection">
        <KeyValue k="family" v={selection.family} />
        <KeyValue k="mode" v={selection.mode} />
      </Section>

      <Section label="Tokens" count={tokenEntries.length}>
        {tokenEntries.slice(0, 16).map(([path, value]) => (
          <KeyValue key={path} k={path} v={value} />
        ))}
        {tokenEntries.length > 16 && (
          <div
            style={{
              color: "var(--theme-color-muted-foreground)",
              fontSize: "10.5px",
              marginTop: "4px",
              paddingLeft: "4px",
            }}
          >
            +{tokenEntries.length - 16} more
          </div>
        )}
      </Section>

      <Section label="CSS Variables" count={Object.keys(vars).length}>
        {Object.entries(vars)
          .slice(0, 8)
          .map(([key, value]) => (
            <KeyValue key={key} k={key} v={value} />
          ))}
        {Object.keys(vars).length > 8 && (
          <div
            style={{
              color: "var(--theme-color-muted-foreground)",
              fontSize: "10.5px",
              marginTop: "4px",
              paddingLeft: "4px",
            }}
          >
            +{Object.keys(vars).length - 8} more
          </div>
        )}
      </Section>
    </div>
  );
}
