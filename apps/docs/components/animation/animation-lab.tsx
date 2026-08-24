"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useServerInsertedHTML } from "next/navigation";
import type { TransitionPreset } from "@theme-kit/core";
import {
  createScopedThemeBinding,
  resolveScopedThemePrePaint,
  type ScopedThemeSelection,
} from "@theme-kit/core";
import { useThemeRuntime } from "@theme-kit/react";
import { Callout } from "../ui/callout";

const EASINGS = [
  "cubic-bezier(0.4, 0, 0.2, 1)",
  "ease",
  "ease-in-out",
  "ease-out",
  "linear",
];

const PRESETS: { value: TransitionPreset; label: string }[] = [
  { value: "smooth", label: "smooth" },
  { value: "subtle", label: "subtle" },
  { value: "instant", label: "instant" },
  {
    value: ["color", "background-color", "border-radius"],
    label: "custom list",
  },
];

/** Follow the page's current mode as a scoped selection, so when the site is on
 *  `system` the demo regions resolve light/dark from the OS (like every theme-kit
 *  scope). The first-paint stylesheet is generated generically by the core
 *  helper from the theme data — nothing here hardcodes the lab/scope colors. */
function followModeSelection(
  family: "lab" | "scope",
  runtime: ReturnType<typeof useThemeRuntime>,
): ScopedThemeSelection {
  return { family, mode: runtime.selection.getMode() };
}

function tileStyle(prePaint: ReturnType<typeof resolveScopedThemePrePaint>): CSSProperties | undefined {
  return prePaint.systemBased ? undefined : (prePaint.lightVariables as CSSProperties);
}

export function AnimationLab() {
  const runtime = useThemeRuntime();
  // Seed first paint from the resolved mode so SSR and hydration agree (server
  // and client both read the cookie-derived selection; `system` stays light on
  // the initial render — the subscription below flips it post-hydration).
  const [labTheme, setLabTheme] = useState(() =>
    runtime.selection.getMode() === "dark" ? "lab-dark" : "lab-light",
  );
  const [scopedTheme, setScopedTheme] = useState(() =>
    runtime.selection.getMode() === "dark" ? "scope-dark" : "scope-light",
  );
  const [duration, setDuration] = useState(400);
  const [easing, setEasing] = useState<string>(
    EASINGS[0] ?? "cubic-bezier(0.4, 0, 0.2, 1)",
  );
  const [preset, setPreset] = useState<TransitionPreset>("smooth");
  const [useVT, setUseVT] = useState(false);
  const [simulateReduced, setSimulateReduced] = useState(false);

  const [vtSupported, setVtSupported] = useState(false);

  useEffect(() => {
    setVtSupported(
      typeof document !== "undefined" &&
        "startViewTransition" in document &&
        typeof (document as unknown as { startViewTransition?: unknown })
          .startViewTransition === "function",
    );
  }, []);

  // Follow the main theme mode: when the site flips light/dark/system, snap the
  // scoped demos to the matching theme of their family so they stay in sync
  // with the page. Their own "Switch theme" / "Restyle region" still override.
  const lastDarkRef = useRef<boolean | null>(null);
  useEffect(() => {
    const isDark = () => {
      const mode = runtime.selection.getMode();
      if (mode === "dark") return true;
      if (mode === "light") return false;
      return (
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    };
    const sync = () => {
      const dark = isDark();
      if (dark === lastDarkRef.current) return;
      lastDarkRef.current = dark;
      setLabTheme(dark ? "lab-dark" : "lab-light");
      setScopedTheme(dark ? "scope-dark" : "scope-light");
    };
    sync();
    return runtime.store.subscribe(sync);
  }, [runtime]);

  // First-paint setup comes from the generic core helper: stable style objects
  // for explicit modes (so React never rewrites the binding's inline vars), a
  // `@media (prefers-color-scheme: dark)` stylesheet for system-mode scopes
  // (so the very first paint already matches the OS), and nothing hardcoded.
  const labPrePaint = useMemo(
    () =>
      resolveScopedThemePrePaint(
        runtime.themes,
        followModeSelection("lab", runtime),
        { selector: "[data-theme-kit-demo='lab']" },
      ),
    [runtime],
  );
  const scopePrePaint = useMemo(
    () =>
      resolveScopedThemePrePaint(
        runtime.themes,
        followModeSelection("scope", runtime),
        { selector: "[data-theme-kit-demo='scope']" },
      ),
    [runtime],
  );

  useServerInsertedHTML(() => {
    const styles = [
      labPrePaint.css
        ? { key: "lab", css: labPrePaint.css }
        : null,
      scopePrePaint.css
        ? { key: "scope", css: scopePrePaint.css }
        : null,
    ].filter(
      (entry): entry is { key: string; css: string } => entry !== null,
    );
    if (styles.length === 0) return null;
    return (
      <>
        {styles.map((entry) => (
          <style
            key={entry.key}
            data-theme-kit-demo-pre-paint={entry.key}
            dangerouslySetInnerHTML={{ __html: entry.css }}
          />
        ))}
      </>
    );
  });

  // --- Lab card: live binding with the real theme-kit animation pipeline ---
  const transition = useMemo(
    () => ({
      enabled: !simulateReduced,
      duration,
      easing,
      preset,
      useViewTransition: useVT && vtSupported,
    }),
    [simulateReduced, duration, easing, preset, useVT, vtSupported],
  );

  const labRef = useRef<HTMLDivElement | null>(null);
  const labBindingRef = useRef<
    ReturnType<typeof createScopedThemeBinding> | null
  >(null);

  // (Re)create the binding whenever the transition config changes.
  useLayoutEffect(() => {
    const el = labRef.current;
    if (!el) return;
    labBindingRef.current?.destroy();
    labBindingRef.current = createScopedThemeBinding(
      runtime.themes,
      el,
      followModeSelection("lab", runtime),
      transition.enabled ? { transition } : {},
    );
    return () => labBindingRef.current?.destroy();
  }, [runtime, transition]);

  // Animate the lab theme when its name changes (labTheme → lab-dark).
  useEffect(() => {
    if (labBindingRef.current) {
      labBindingRef.current.update(
        ({
          family: "lab",
          mode: labTheme === "lab-dark" ? "dark" : "light",
        }) satisfies ScopedThemeSelection,
      );
    }
  }, [labTheme]);

  // --- Scoped region: separate binding, same pipeline ---
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const scopeBindingRef = useRef<
    ReturnType<typeof createScopedThemeBinding> | null
  >(null);
  const scopeTransition = useMemo(
    () => ({ enabled: !simulateReduced, preset: "smooth" as const }),
    [simulateReduced],
  );

  useLayoutEffect(() => {
    const el = scopeRef.current;
    if (!el) return;
    scopeBindingRef.current?.destroy();
    scopeBindingRef.current = createScopedThemeBinding(
      runtime.themes,
      el,
      followModeSelection("scope", runtime),
      scopeTransition.enabled ? { transition: scopeTransition } : {},
    );
    return () => scopeBindingRef.current?.destroy();
  }, [runtime, scopeTransition]);

  useEffect(() => {
    if (scopeBindingRef.current) {
      scopeBindingRef.current.update(
        ({
          family: "scope",
          mode: scopedTheme === "scope-dark" ? "dark" : "light",
        }) satisfies ScopedThemeSelection,
      );
    }
  }, [scopedTheme]);

  const switchLab = useCallback(() => {
    setLabTheme((t) => (t === "lab-light" ? "lab-dark" : "lab-light"));
  }, []);

    const switchScoped = useCallback(() => {
    setScopedTheme((t) =>
      t === "scope-light" ? "scope-dark" : "scope-light",
    );
  }, []);

  const note = useMemo(() => {
    if (simulateReduced) {
      return "prefers-reduced-motion \u2014 instant switch, nothing animates.";
    }
    const props = typeof preset === "string"
      ? runtime.transition?.properties ?? []
      : preset;
    return `createScopedThemeBinding runs the real pipeline \u2192 createThemeDiff \u2192 createTransitionPlan \u2192 runThemeAnimation (${
      preset === "smooth"
        ? "smooth preset"
        : typeof preset === "string"
          ? preset
          : "custom list"
    }) \u2192 coordinating ${duration}ms ${easing} on ${
      props.length > 0
        ? [...props].slice(0, 4).join(", ") + (props.length > 4 ? "\u2026" : "")
        : "matched properties"
    }.`;
  }, [simulateReduced, duration, easing, preset, runtime.transition]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                          {/* Lab card - scoped via createScopedThemeBinding with the real theme-kit animation pipeline */}
        <div
          ref={labRef}
          data-theme-kit-demo="lab"
          className="rounded-2xl border p-6 min-h-64 flex flex-col bg-(--theme-color-card) text-(--theme-color-foreground)"
          style={tileStyle(labPrePaint)}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold opacity-80">
              brand.app
            </span>
            <span
              className="w-8 h-8 rounded-full grid place-items-center text-xs font-bold"
              style={{
                background: "var(--theme-color-primary)",
                color: "var(--theme-color-primary-foreground)",
              }}
            >
              A
            </span>
          </div>
          <div className="mt-6 space-y-2">
            <div
              className="h-3 w-2/3 rounded-full"
              style={{ background: "var(--theme-color-muted)" }}
            />
            <div
              className="h-3 w-1/2 rounded-full"
              style={{ background: "var(--theme-color-muted)" }}
            />
          </div>
          <div className="mt-auto pt-6 flex items-center justify-between">
            <div className="flex gap-1.5">
              {[
                "var(--theme-color-card)",
                "var(--theme-color-secondary)",
                "var(--theme-color-primary)",
              ].map((c) => (
                <span
                  key={c}
                  className="w-5 h-5 rounded-full"
                  style={{
                    background: c,
                    filter:
                      labTheme === "lab-dark" ? "brightness(1.15)" : "none",
                  }}
                />
              ))}
            </div>
            <span
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: "var(--theme-color-primary)",
                color: "var(--theme-color-primary-foreground)",
              }}
            >
              Get started
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col gap-4">
          <button
            type="button"
            onClick={switchLab}
            className="w-full px-3 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-opacity hover:opacity-90"
            style={{
              background: "var(--theme-color-primary)",
              color:
                "var(--theme-color-primary-foreground, var(--theme-color-primaryForeground))",
            }}
          >
            Switch theme
          </button>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="anidur" className="text-xs opacity-60">
                Duration
              </label>
              <span className="mono text-[11px] opacity-60">{duration}ms</span>
            </div>
            <input
              id="anidur"
              type="range"
              min={0}
              max={1200}
              step={50}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-(--theme-color-primary)"
            />
          </div>

          <div>
            <div className="text-xs opacity-60 mb-1">Easing</div>
            <select
              value={easing}
              onChange={(e) => setEasing(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none focus:border-ring"
            >
              {EASINGS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs opacity-60 mb-1">Preset</div>
            <div className="flex flex-wrap gap-1.5" role="tablist">
              {PRESETS.map((p) => (
                <button
                  key={String(p.value)}
                  type="button"
                  role="tab"
                  aria-selected={preset === p.value}
                  onClick={() => setPreset(p.value)}
                  className={`chip ${preset === p.value ? "chip-active" : ""}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useVT}
                disabled={!vtSupported}
                onChange={(e) => setUseVT(e.target.checked)}
                className="accent-(--theme-color-primary)"
              />
              <span className="text-xs opacity-70">
                View Transitions API
                {!vtSupported && (
                  <span className="opacity-40"> (unsupported)</span>
                )}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={simulateReduced}
                onChange={(e) => setSimulateReduced(e.target.checked)}
                className="accent-(--theme-color-primary)"
              />
              <span className="text-xs opacity-70">
                Simulate reduced motion
              </span>
            </label>
          </div>
        </div>
      </div>

      <Callout>{note}</Callout>


      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider opacity-50">
          Scoped / nested region &#8212; transitions independently
        </div>
        <div className="p-4">
          {/* Scoped region - separate createScopedThemeBinding, runs its own transition */}
          <div
            ref={scopeRef}
            data-theme-kit-demo="scope"
            className="rounded-xl p-4 flex items-center justify-between text-(--theme-color-foreground)"
            style={tileStyle(scopePrePaint)}
          >
            <div>
              <span className="text-sm font-semibold">Feature tile</span>
              <span className="block text-xs opacity-60 mt-0.5">
                Scoped via <code className="mono">createScopedThemeBinding</code> &#8212; runs its
                own transition while the rest of the page is untouched.
              </span>
            </div>
            <button
              type="button"
              onClick={switchScoped}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-opacity hover:opacity-80"
              style={{
                borderColor: "var(--theme-color-border)",
                color: "var(--theme-color-primary)",
                background: "var(--theme-color-primary-foreground)",
              }}
            >
              Restyle region
            </button>
          </div>
          <p className="m-0 mt-3 text-xs opacity-50">
            Scoped subtree runs the real theme-kit animation pipeline
            ({"createThemeDiff"}&#8594;{"createTransitionPlan"}&#8594;{"runThemeAnimation"}).
            Its transition timeline is independent of the page-level theme.
          </p>
        </div>
      </div>
    </div>
  );
}
