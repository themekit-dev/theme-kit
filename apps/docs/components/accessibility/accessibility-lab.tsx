"use client";

import { useMemo, useState } from "react";
import {
  checkContrastPair,
  createAccessibilityPlugin,
  getCVDLabel,
  simulateCVD,
  simulateThemeForCVD,
  validateThemeContrast,
  type ContrastCheck,
  type CVDType,
} from "@theme-kit/core";
import { useTheme, useThemeRuntime } from "@theme-kit/next/client";
import { CodeBlock } from "../code-block";
import { highlightCode } from "../../lib/highlight";

const CVD_TYPES: CVDType[] = [
  "protanopia",
  "deuteranopia",
  "tritanopia",
  "achromatopsia",
];

const ACCESSIBILITY_PROFILES = [
  {
    name: "high-contrast-light",
    label: "High Contrast · Light",
    desc: "Maximum contrast for readability.",
  },
  {
    name: "high-contrast-dark",
    label: "High Contrast · Dark",
    desc: "Maximum contrast on dark backgrounds.",
  },
  {
    name: "large-text-light",
    label: "Large Text · Light",
    desc: "Enlarged type on light backgrounds.",
  },
  {
    name: "large-text-dark",
    label: "Large Text · Dark",
    desc: "Enlarged type on dark backgrounds.",
  },
];

type StatusLabel = "PASS" | "FAIL";

function getContrastStatus(
  passesAANormal: boolean,
  passesAALarge: boolean,
  passesAAANormal: boolean,
  passesAAALarge: boolean,
): { aa: StatusLabel; aaLarge: StatusLabel; aaa: StatusLabel; aaaLarge: StatusLabel } {
  return {
    aa: passesAANormal ? "PASS" : "FAIL",
    aaLarge: passesAALarge ? "PASS" : "FAIL",
    aaa: passesAAANormal ? "PASS" : "FAIL",
    aaaLarge: passesAAALarge ? "PASS" : "FAIL",
  };
}

function RatioBadge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
        pass
          ? "bg-green-500/15 text-green-600 dark:text-green-400"
          : "bg-red-500/10 text-red-500/60 line-through"
      }`}
    >
      {label}
    </span>
  );
}

function ContrastStatusGrid({
  passesAANormal,
  passesAALarge,
  passesAAANormal,
  passesAAALarge,
}: {
  passesAANormal: boolean;
  passesAALarge: boolean;
  passesAAANormal: boolean;
  passesAAALarge: boolean;
}) {
  const status = useMemo(
    () => getContrastStatus(passesAANormal, passesAALarge, passesAAANormal, passesAAALarge),
    [passesAANormal, passesAALarge, passesAAANormal, passesAAALarge],
  );

  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      <div className="flex items-center justify-between text-sm">
        <span className="opacity-70">AA Normal</span>
        <RatioBadge pass={status.aa === "PASS"} label={status.aa} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="opacity-70">AA Large</span>
        <RatioBadge pass={status.aaLarge === "PASS"} label={status.aaLarge} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="opacity-70">AAA Normal</span>
        <RatioBadge pass={status.aaa === "PASS"} label={status.aaa} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="opacity-70">AAA Large</span>
        <RatioBadge pass={status.aaaLarge === "PASS"} label={status.aaaLarge} />
      </div>
    </div>
  );
}

export function AccessibilityLab({ compact = false }: { compact?: boolean }) {
  const runtime = useThemeRuntime();
  const { theme } = useTheme();

  const [fg, setFg] = useState("#0f172a");
  const [bg, setBg] = useState("#ffffff");

  const pair = useMemo(() => {
    try {
      return checkContrastPair(fg, bg);
    } catch {
      return null;
    }
  }, [fg, bg]);

  const audit = useMemo(() => validateThemeContrast(theme), [theme]);

  const primaryColor =
    typeof theme.tokens?.colors?.primary === "string"
      ? theme.tokens.colors.primary
      : "#6366f1";

  const cvd = useMemo(
    () =>
      CVD_TYPES.map((type) => ({
        type,
        label: getCVDLabel(type),
        color: simulateCVD(primaryColor, type),
      })),
    [primaryColor],
  );

  const [activeCVD, setActiveCVD] = useState<CVDType | null>(null);

  function applyProfile(name: string) {
    const profile = runtime.themes.find((t) => t.name === name);
    if (profile) runtime.update(profile.tokens ?? {});
  }

  function applyCVDSimulation() {
    if (!activeCVD) return;
    const simulated = simulateThemeForCVD(theme, activeCVD);
    runtime.update(simulated.tokens ?? {});
  }

  const [violation, setViolation] = useState<{
    themeName: string;
    checks: ContrastCheck[];
  } | null>(null);
  const [fixApplied, setFixApplied] = useState(false);

  const a11yPlugin = useMemo(
    () =>
      createAccessibilityPlugin({
        warnOnly: false,
        onViolation: (result) => setViolation(result),
      }),
    [],
  );

  function triggerViolation() {
    setFixApplied(false);
    const base = (theme.tokens ?? {}) as Record<string, unknown>;
    const currentColors = (base.colors ?? {}) as Record<string, string>;
    const candidate = {
      name: "low-contrast-demo",
      tokens: {
        ...base,
        colors: {
          ...currentColors,
          background: "#ffffff",
          foreground: "#ffffff",
          card: "#ffffff",
          cardForeground: "#ffffff",
          border: "#f1f5f9",
        },
      },
    } as const;
    // Run the exact hook the accessibility plugin listens to.
    a11yPlugin.onAfterThemeChange?.({ theme: candidate });
    setViolation((v) => v ?? { themeName: "low-contrast-demo", checks: [] });
  }

  function fixViolation() {
    applyProfile("high-contrast-light");
    setViolation(null);
    setFixApplied(true);
  }

  const simulationCss = useMemo(() => {
    if (!activeCVD) return "";
    const colors = simulateThemeForCVD(theme, activeCVD).tokens?.colors as
      Record<string, string> | undefined;
    if (!colors) return "";
    return Object.entries(colors)
      .slice(0, 12)
      .map(([k, v]) => `--theme-color-${k}: ${v};`)
      .join("\n");
  }, [activeCVD, theme]);

  return (
    <div className="flex flex-col gap-8">
      {!compact && (
        <header>
          <div className="chip mb-4">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--theme-color-primary)" }}
            />
            Accessibility Lab
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            WCAG contrast &amp; color vision, live
          </h2>
          <p className="opacity-70 max-w-2xl leading-relaxed">
            Every check below runs against the real accessibility toolkit in{" "}
            <code className="mono text-[0.9em]">@theme-kit/core</code> —{" "}
            <code className="mono text-[0.9em]">getContrastRatio</code>,{" "}
            <code className="mono text-[0.9em]">validateThemeContrast</code> and{" "}
            <code className="mono text-[0.9em]">simulateCVD</code>.
          </p>
        </header>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold mb-1">Contrast checker</h2>
          <p className="m-0 mb-2 text-sm opacity-60">
            Pick any two colors and check WCAG AA/AAA compliance instantly.
          </p>
          <p className="m-0 mb-4 text-xs opacity-50">
            This tool evaluates color contrast against WCAG 2.1 standards. It
            does not certify your entire application for WCAG conformance.
          </p>
          <div className="text-xs opacity-50 mb-4">
            WCAG 2.1 AA/AAA thresholds: AA 4.5:1 (normal) / 3:1 (large); AAA
            7:1 (normal) / 4.5:1 (large)
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fg}
                onChange={(e) => setFg(e.target.value)}
                className="w-10 h-10 p-0 border border-border rounded-lg cursor-pointer bg-transparent shrink-0"
                aria-label="Foreground color"
              />
              <input
                type="text"
                value={fg}
                onChange={(e) => setFg(e.target.value)}
                aria-label="Foreground color hex value"
                className="flex-1 min-w-0 px-3 py-2 border border-border rounded-lg bg-muted font-mono text-sm outline-none focus:border-ring"
                spellCheck={false}
              />
              <span className="text-xs opacity-40 shrink-0">foreground</span>
            </div>
            <div className="flex items-center">
              <div className="flex-1 border-t border-border/60" aria-hidden />
              <button
                type="button"
                onClick={() => {
                  setFg(bg);
                  setBg(fg);
                }}
                className="mx-2 px-2.5 py-1 rounded-lg border border-border bg-card text-xs font-medium cursor-pointer hover:bg-muted transition-colors"
                aria-label="Swap foreground and background colors"
                title="Swap foreground and background"
              >
                ⇅ swap
              </button>
              <div className="flex-1 border-t border-border/60" aria-hidden />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                className="w-10 h-10 p-0 border border-border rounded-lg cursor-pointer bg-transparent shrink-0"
                aria-label="Background color"
              />
              <input
                type="text"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                aria-label="Background color hex value"
                className="flex-1 min-w-0 px-3 py-2 border border-border rounded-lg bg-muted font-mono text-sm outline-none focus:border-ring"
                spellCheck={false}
              />
              <span className="text-xs opacity-40 shrink-0">background</span>
            </div>
          </div>

          {pair ? (
            <>
              <div
                className="flex flex-col items-center gap-2 p-6 rounded-xl border border-border"
                style={{ backgroundColor: bg, color: fg }}
              >
                <span className="text-4xl font-bold">Aa</span>
                <span className="mono text-sm">
                  ratio {pair.ratio.toFixed(2)} : 1
                </span>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  <ContrastStatusGrid
                    passesAANormal={pair.passesAANormal}
                    passesAALarge={pair.passesAALarge}
                    passesAAANormal={pair.passesAAANormal}
                    passesAAALarge={pair.passesAAALarge}
                  />
                </div>
              </div>
              <p className="mt-3 m-0 text-xs opacity-50">
                {pair.passesAANormal
                  ? "This pair passes AA for normal text."
                  : "This pair fails AA for normal text — try darkening the foreground."}
              </p>
            </>
          ) : (
            <p className="m-0 text-sm opacity-50">
              Enter valid hex colors to check contrast.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold mb-1">
            Live theme audit ·{" "}
            <span className="mono text-sm">{theme.name}</span>
          </h2>
          <div className="flex items-center gap-2 mb-2">
            <RatioBadge
              pass={audit.valid}
              label={audit.valid ? "PASS" : "FAIL"}
            />
            <span className="text-xs opacity-60">
              {audit.checks.length} color pairs checked
            </span>
          </div>
          <p className="m-0 mb-2 text-sm opacity-60">
            <code className="mono text-[0.9em]">validateThemeContrast()</code>{" "}
            run against the active theme&apos;s semantic pairs.
          </p>
          <p className="m-0 mb-4 text-xs opacity-50">
            This tool checks all semantic color pairs in the theme. Passing AA for
            normal text means the theme is generally accessible for standard
            content.
          </p>

          <div className="flex flex-col gap-1.5">
            {audit.checks.map((check) => (
              <div
                key={`${check.foregroundToken}-${check.backgroundToken}`}
                className="flex flex-col gap-1.5 px-3 py-2 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-6 h-6 rounded-md border border-black/10 shrink-0"
                      style={{ background: check.background }}
                    />
                    <span
                      className="w-6 h-6 rounded-md border border-black/10 shrink-0"
                      style={{ background: check.foreground }}
                    />
                    <code className="mono text-[11px] opacity-70 truncate">
                      {check.foregroundToken} on {check.backgroundToken}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`mono text-xs font-semibold ${
                        check.passesAANormal
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-500"
                      }`}
                    >
                      {check.ratio.toFixed(2)} : 1
                    </span>
                    <RatioBadge pass={check.passesAANormal} label="AA" />
                  </div>
                </div>
                <ContrastStatusGrid
                  passesAANormal={check.passesAANormal}
                  passesAALarge={check.passesAALarge}
                  passesAAANormal={check.passesAAANormal}
                  passesAAALarge={check.passesAAALarge}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold mb-1">
            Color vision deficiency simulation
          </h2>
          <p className="m-0 mb-4 text-sm opacity-60">
            <code className="mono text-[0.9em]">simulateCVD()</code> of the
            active primary ({primaryColor}).
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-2 mb-4">
            {cvd.map((entry) => (
              <button
                key={entry.type}
                type="button"
                onClick={() =>
                  setActiveCVD((t) => (t === entry.type ? null : entry.type))
                }
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                  activeCVD === entry.type
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/30 hover:bg-muted"
                }`}
              >
                <span
                  className="w-9 h-9 rounded-lg border border-black/10"
                  style={{ background: entry.color }}
                />
                <span className="text-[10px] font-semibold text-center leading-tight">
                  {entry.label.split(" (")[0]}
                </span>
              </button>
            ))}
          </div>

          {activeCVD ? (
            <>
              <button
                type="button"
                onClick={applyCVDSimulation}
                className="w-full px-3 py-2.5 rounded-lg border border-primary bg-primary text-primary-foreground text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
              >
                Apply {getCVDLabel(activeCVD).split(" (")[0]} simulation to this
                site
              </button>
              <p className="m-0 mt-2 text-xs opacity-50">
                Re-themes the site with every color run through{" "}
                <code className="mono">simulateThemeForCVD()</code> so you can
                check readability exactly as a user with that condition sees it.
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={applyCVDSimulation}
                className="w-full px-3 py-2.5 rounded-lg border border-primary bg-primary text-primary-foreground text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
              >
                Apply {getCVDLabel("protanopia").split(" (")[0]} simulation to
                this site
              </button>
              <p className="m-0 mt-2 text-xs opacity-50">
                Re-themes the site with every color run through{" "}
                <code className="mono">simulateThemeForCVD()</code> so you can
                check readability exactly as a user with that condition sees it.
              </p>
            </>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold mb-1">
            Accessibility profiles
          </h2>
          <p className="m-0 mb-4 text-sm opacity-60">
            Ready-made high-contrast and large-text themes shipped in{" "}
            <code className="mono text-[0.9em]">getBuiltInThemes()</code>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACCESSIBILITY_PROFILES.map((profile) => {
              const exists = runtime.themes.some(
                (t) => t.name === profile.name,
              );
              return (
                <div
                  key={profile.name}
                  className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-muted/30"
                >
                  <span className="text-sm font-semibold">{profile.label}</span>
                  <p className="m-0 text-xs opacity-60">{profile.desc}</p>
                  <button
                    type="button"
                    onClick={() => applyProfile(profile.name)}
                    disabled={!exists}
                    className="mt-auto px-3 py-1.5 rounded-lg border border-primary bg-primary text-primary-foreground text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                    Apply profile
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold mb-1">
          The accessibility plugin &mdash; reacting to violations
        </h2>
        <p className="m-0 mb-4 text-sm opacity-60">
          <code className="mono text-[0.9em]">createAccessibilityPlugin()</code>{" "}
          audits every applied theme at WCAG AA and fires{" "}
          <code className="mono text-[0.9em]">onViolation</code> when a theme
          breaks the configured requirements. This is that callback, live.
        </p>

        <div className="flex flex-wrap gap-3 mb-4">
          <button
            type="button"
            onClick={triggerViolation}
            className="px-3 py-2 rounded-lg border border-destructive/60 text-destructive text-sm font-semibold cursor-pointer hover:bg-destructive/10 transition-colors"
          >
            Trigger a violating theme
          </button>
          {violation && (
            <button
              type="button"
              onClick={fixViolation}
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            >
              Fix it — apply High Contrast Light
            </button>
          )}
        </div>

        {!violation && !fixApplied && (
          <p className="m-0 text-xs opacity-50">
            Try it: a &ldquo;low-contrast-demo&rdquo; theme (white foreground on
            white background) is handed to the plugin&apos;s{" "}
            <code className="mono">onAfterThemeChange</code> hook — exactly what
            happens when such a theme is applied to a runtime.
          </p>
        )}

        {fixApplied && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm">
            <span className="font-semibold">
              Compliant alternative applied.
            </span>{" "}
            <span className="opacity-70">
              <code className="mono">high-contrast-light</code> passes its audit
              and re-themed this page — the site is readable again.
            </span>
          </div>
        )}

        {violation && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
            <div className="text-sm font-semibold flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Theme &quot;{violation.themeName}&quot; —{" "}
              {violation.checks.length} WCAG AA violation(s)
            </div>
            <div className="flex flex-col gap-1">
              {violation.checks.map((check) => (
                <div
                  key={`${check.foregroundToken}-${check.backgroundToken}`}
                  className="flex flex-col gap-1.5 px-3 py-2 rounded-lg bg-card/60 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-5 h-5 rounded-md border border-black/10 shrink-0"
                        style={{ background: check.background }}
                      />
                      <span
                        className="w-5 h-5 rounded-md border border-black/10 shrink-0"
                        style={{ background: check.foreground }}
                      />
                      <code className="mono text-[11px] opacity-70 truncate">
                        {check.foregroundToken} on {check.backgroundToken}
                      </code>
                    </div>
                    <span className="mono text-xs font-semibold text-red-500 shrink-0">
                      {check.ratio.toFixed(2)} : 1
                    </span>
                  </div>
                  <ContrastStatusGrid
                    passesAANormal={check.passesAANormal}
                    passesAALarge={check.passesAALarge}
                    passesAAANormal={check.passesAAANormal}
                    passesAAALarge={check.passesAAALarge}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {activeCVD && (
        <section>
          <div className="text-lg font-medium">CVD CSS Tokens</div>
          <hr className="mt-2 text-(--theme-color-accent)" />
          <div className="mt-3 inline-block overflow-x-auto w-full">
            <CodeBlock
              html={highlightCode(simulationCss, "css")}
              code={simulationCss}
              language="css"
            />
          </div>
        </section>
      )}
    </div>
  );
}
