"use client";

import { useMemo, useState } from "react";
import { themeToCSSVariables, type ThemeDefinition } from "@theme-kit/core";
import { Select } from "./ui/select";
import { CopyButton } from "./ui/copy-button";
import { CodeBlock } from "./code-block";
import { highlightCode } from "../lib/highlight";
import { c, colorsOf, contrastRatio } from "../lib/contrast";
import {
  type PresetFamilyGroup,
  FrameworkSelector,
  getPresetFrameworkSnippet,
} from "./presets";

type VariableFormat = "css" | "ts" | "json";

/** `slack-light` → `slackLight`, for a usable export identifier. */
function identifierFor(name: string): string {
  return (
    name
      .replace(/[^a-zA-Z0-9]+(.)?/g, (_, c: string) => (c ? c.toUpperCase() : ""))
      .replace(/^./, (c) => c.toLowerCase()) || "theme"
  );
}

/**
 * Resolved CSS variables for the theme **being previewed**, with copy and
 * download.
 *
 * This used to read the live runtime's theme, so it always reported the
 * documentation site's own theme (`slack-light`) no matter which preset the
 * reader had selected above — the panel answered a different question from the
 * one the page was asking. It now takes the previewed theme as a prop, which
 * `PresetComparison` already has in scope.
 *
 * The output is the same three things anyone actually needs: the CSS custom
 * properties, a ready-to-paste `defineTheme()` call, and the raw JSON.
 */
function PreviewedVariables({ theme }: { theme: ThemeDefinition }) {
  const [format, setFormat] = useState<VariableFormat>("css");

  const vars = themeToCSSVariables(theme, { prefix: "theme-" });
  const json = JSON.stringify(theme, null, 2);
  const outputs: Record<VariableFormat, { code: string; lang: string; ext: string }> = {
    css: {
      code: `:root {\n${Object.entries(vars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join("\n")}\n}`,
      lang: "css",
      ext: "css",
    },
    ts: {
      code: `import { defineTheme } from "@theme-kit/core";\n\nexport const ${identifierFor(
        theme.name,
      )} = defineTheme(${json});\n`,
      lang: "ts",
      ext: "ts",
    },
    json: { code: `${json}\n`, lang: "json", ext: "json" },
  };

  const active = outputs[format];
  const filename = `${theme.name}.${active.ext}`;

  const download = () => {
    const blob = new Blob([active.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest opacity-50">
            Resolved CSS variables
          </div>
          <div className="text-xs opacity-60 mt-0.5">
            For <span className="mono text-foreground">{theme.name}</span> — the
            preset you are previewing. {Object.keys(vars).length} variables.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex items-center rounded-lg border border-border bg-card p-0.5"
            role="group"
            aria-label="Output format"
          >
            {(["css", "ts", "json"] as VariableFormat[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                aria-pressed={format === f}
                className={`text-[11px] font-medium uppercase px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                  format === f
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <CopyButton
            text={active.code}
            label="Copy"
            className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-border cursor-pointer hover:border-ring transition-colors"
          />
          <button
            type="button"
            onClick={download}
            className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-border bg-card cursor-pointer hover:border-ring transition-colors"
          >
            Download .{active.ext}
          </button>
        </div>
      </div>

      <CodeBlock
        html={highlightCode(active.code, active.lang)}
        code={active.code}
        language={active.lang}
        filename={filename}
        className="rounded-lg m-0"
      />
    </div>
  );
}


/**
 * Shared themed-application preview for the presets pages.
 *
 * One component, identical content, used by both /presets/default and
 * /presets/brand so visitors can compare presets without layout or content
 * shifting — the only variable is the preset itself. Renders real component
 * states (default, selected, disabled, focused, validation) rather than only
 * attractive default buttons, and shows measured contrast instead of a
 * blanket "accessible" badge.
 */

/**
 * Color-token differences between two themes, sorted by token name. Only
 * meaningful where the two presets share a token vocabulary.
 */
export function diffThemes(
  from: ThemeDefinition,
  to: ThemeDefinition,
): TokenDiff[] {
  const a = colorsOf(from);
  const b = colorsOf(to);
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  return keys
    .filter((k) => a[k] !== b[k])
    .map((k) => ({ token: k, from: a[k], to: b[k] }));
}

type TokenDiff = {
  token: string;
  from: string | undefined;
  to: string | undefined;
};

/**
 * The themed application surface. Identical on both preset pages so the only
 * variable the visitor perceives is the preset itself.
 */
export function ThemedAppPreview({
  theme,
  label,
}: {
  theme: ThemeDefinition;
  label?: string;
}) {
  const colors = colorsOf(theme);
  const fg = c(colors, "foreground", "#0f172a");
  const bg = c(colors, "background", "#ffffff");
  const card = c(colors, "card", "#ffffff");
  const border = c(colors, "border", "#e2e8f0");
  const muted = c(colors, "muted", "#f1f5f9");
  const mutedFg = c(colors, "mutedForeground", "#64748b");
  const primary = c(colors, "primary", "#4f46e5");
  const primaryFg = c(colors, "primaryForeground", "#ffffff");
  const secondary = c(colors, "secondary", "#f1f5f9");
  const accent = c(colors, "accent", "#f59e0b");
  const destructive = c(colors, "destructive", "#ef4444");
  const success = c(colors, "success", "#22c55e");
  const ring = c(colors, "ring", "#6366f1");
  const input = c(colors, "input", "#e2e8f0");

  return (
    <div
      className="rounded-xl overflow-hidden border text-left"
      style={{ background: bg, color: fg, borderColor: border }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-1.5 px-3 py-2"
        style={{ background: muted }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: destructive }}
        />
        <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: success }}
        />
        <span className="ml-2 text-[10px] opacity-50 mono">
          {label ?? theme.meta?.label ?? theme.name}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Sidebar + content: a compact application, not a swatch wall */}
        <div className="flex gap-4">
          <div
            className="hidden sm:flex flex-col gap-2 w-28 shrink-0 p-2.5 rounded-lg"
            style={{ background: muted }}
          >
            <div
              className="h-2 w-16 rounded-full"
              style={{ background: primary, opacity: 0.9 }}
            />
            <div
              className="h-2 w-12 rounded-full"
              style={{ background: mutedFg, opacity: 0.5 }}
            />
            <div
              className="h-2 w-14 rounded-full"
              style={{ background: mutedFg, opacity: 0.35 }}
            />
            <div
              className="h-2 w-10 rounded-full"
              style={{ background: mutedFg, opacity: 0.35 }}
            />
          </div>

          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {/* Typography sample */}
            <div>
              <div className="text-sm font-bold leading-tight">
                Account settings
              </div>
              <div
                className="text-[11px] leading-relaxed mt-0.5"
                style={{ color: mutedFg }}
              >
                Manage how your workspace looks and behaves.
              </div>
            </div>

            {/* Form with validation state */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: mutedFg }}
                htmlFor="preset-demo-email"
              >
                Email
              </label>
              <input
                id="preset-demo-email"
                type="email"
                defaultValue="alex@example.com"
                className="w-full px-2.5 py-1.5 rounded-md text-xs outline-none"
                style={{
                  background: bg,
                  border: `1px solid ${input}`,
                  color: fg,
                }}
              />
              <div
                className="text-[10px] font-medium"
                style={{ color: success }}
              >
                ✓ Verified
              </div>
            </div>

            {/* Buttons across states */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="px-3 py-1.5 rounded-md text-[11px] font-semibold"
                style={{ background: primary, color: primaryFg }}
              >
                Save changes
              </span>
              <span
                className="px-3 py-1.5 rounded-md text-[11px] font-semibold"
                style={{ border: `1px solid ${border}`, color: fg }}
              >
                Selected
              </span>
              <span
                className="px-3 py-1.5 rounded-md text-[11px] font-semibold"
                style={{
                  border: `1px solid ${border}`,
                  color: mutedFg,
                  opacity: 0.5,
                }}
              >
                Disabled
              </span>
              <span
                className="px-3 py-1.5 rounded-md text-[11px] font-semibold"
                style={{
                  border: `1px solid ${ring}`,
                  color: fg,
                  boxShadow: `0 0 0 2px ${ring}33`,
                }}
              >
                Focused
              </span>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: `${success}1f`, color: success }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: success }}
                />
                Healthy
              </span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: `${destructive}1f`, color: destructive }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: destructive }}
                />
                1 error
              </span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: secondary, color: fg }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: accent }}
                />
                Pending
              </span>
            </div>
          </div>
        </div>

        {/* Token strip: the semantic vocabulary this preset defines */}
        <div
          className="flex flex-wrap items-center gap-1.5 pt-3 border-t"
          style={{ borderColor: border }}
        >
          {(
            [
              ["primary", primary],
              ["secondary", secondary],
              ["accent", accent],
              ["success", success],
              ["destructive", destructive],
              ["muted", muted],
              ["card", card],
              ["border", border],
              ["ring", ring],
            ] as [string, string][]
          ).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold"
              style={{ background: bg, border: `1px solid ${border}` }}
              title={`${key}: ${value}`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: value,
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
                }}
              />
              {key}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SwatchValue({ value }: { value: string | undefined }) {
  if (!value) {
    return <span className="text-xs opacity-40">—</span>;
  }
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="w-4 h-4 rounded-md border border-black/10 shrink-0"
        style={{ background: value }}
        aria-hidden
      />
      <code className="mono text-[0.8em] opacity-70">{value}</code>
    </span>
  );
}

/**
 * "Changes from Default": token name, previous value, new value, and visual
 * samples. Contrast column is shown only when both values resolve as hex.
 */
export function TokenDiffTable({ diffs }: { diffs: TokenDiff[] }) {
  if (diffs.length === 0) {
    return (
      <p className="text-sm opacity-60">
        No color-token differences — these presets share the same resolved
        palette.
      </p>
    );
  }
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider">
                Token
              </th>
              <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider">
                Default
              </th>
              <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider">
                Brand
              </th>
            </tr>
          </thead>
          <tbody>
            {diffs.map((row) => (
              <tr
                key={row.token}
                className="border-b border-border last:border-0 align-middle"
              >
                <td className="px-4 py-2.5">
                  <code className="mono text-[0.85em] font-semibold">
                    {row.token}
                  </code>
                </td>
                <td className="px-4 py-2.5">
                  <SwatchValue value={row.from} />
                </td>
                <td className="px-4 py-2.5">
                  <SwatchValue value={row.to} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Badge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
        pass
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/10 text-red-600 dark:text-red-400"
      }`}
    >
      {pass ? "PASS" : "FAIL"} {label}
    </span>
  );
}

/**
 * Measured contrast for specific foreground/background pairs, replacing
 * blanket "accessible" badges with actual numbers.
 */
export function ContrastEvidence({ theme }: { theme: ThemeDefinition }) {
  const colors = colorsOf(theme);
  const pairs: [string, string, string][] = [
    ["foreground", "background", "Body text on background"],
    ["primaryForeground", "primary", "Primary button label"],
    ["mutedForeground", "muted", "Muted text on muted surface"],
    ["destructiveForeground", "destructive", "Destructive button label"],
  ];
  const rows = pairs
    .map(([fgKey, bgKey, label]) => {
      const fgV = colors[fgKey];
      const bgV = colors[bgKey];
      if (!fgV || !bgV) return null;
      const ratio = contrastRatio(fgV, bgV);
      if (!ratio) return null;
      return { fgKey, bgKey, label, ratio, fgV, bgV };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider opacity-60">
        Measured contrast · WCAG relative luminance
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => {
          const passesAA = row.ratio >= 4.5;
          const passesAALarge = row.ratio >= 3;
          return (
            <div
              key={row.label}
              className="px-4 py-2.5 flex flex-wrap items-center gap-3 text-sm"
            >
              <span className="inline-flex items-center gap-1.5 shrink-0">
                <span
                  className="w-4 h-4 rounded border border-black/10"
                  style={{ background: row.fgV }}
                  aria-hidden
                />
                on
                <span
                  className="w-4 h-4 rounded border border-black/10"
                  style={{ background: row.bgV }}
                  aria-hidden
                />
              </span>
              <code className="mono text-[0.8em] opacity-60 shrink-0">
                {row.fgKey}/{row.bgKey}
              </code>
              <span className="text-xs opacity-70 flex-1 min-w-0">
                {row.label}
              </span>
              <span className="mono text-xs font-semibold shrink-0">
                {row.ratio.toFixed(2)}:1
              </span>
              <span className="flex gap-1 shrink-0">
                <Badge pass={passesAA} label="AA" />
                <Badge pass={passesAALarge} label="AA Large" />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Framework-aware setup snippet for the previewed preset.
 *
 * Sits directly under the preview card. The framework picker defaults to
 * React, and the snippet re-renders for both the selected framework and the
 * previewed family/mode — every snippet uses the framework package's own
 * shipped API (`ThemeProvider` / `provideThemeKit` / `themeKit()` / …)
 * rather than dropping down to `createThemeRuntime`.
 */
function PresetFrameworkSetup({
  family,
  kind,
  mode,
}: {
  family: string;
  kind: "default" | "brand";
  mode: "light" | "dark";
}) {
  // React first — visitors can switch to any framework from here.
  const [framework, setFramework] = useState<string>("react");

  const snippet = useMemo(
    () => getPresetFrameworkSnippet(family, kind, framework, mode),
    [family, kind, framework, mode]
  );

  return (
    <div className="flex flex-col gap-3">
      <FrameworkSelector selected={framework} onChange={setFramework} />
      <CodeBlock
        html={highlightCode(snippet.code, snippet.lang)}
        code={snippet.code}
        language={snippet.lang}
        filename={snippet.title}
        className="rounded-lg m-0"
      />
    </div>
  );
}

/**
 * The shared comparison surface the presets pages build on.
 *
 * Preview-first: introduction and preview, then the framework setup snippet,
 * then the deeper token detail — visitors never read a token table before
 * seeing the result. Controls are labeled "Preview theme" so it is clear they
 * affect the demo and not the documentation site's own appearance.
 */
export function PresetComparison({
  groups,
  kind,
  baseline,
}: {
  groups: PresetFamilyGroup[];
  kind: "default" | "brand";
  /** Default-family group used as the "Changes from Default" baseline. */
  baseline?: PresetFamilyGroup;
}) {
  const [selectedKey, setSelectedKey] = useState(groups[0]?.key ?? "");
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [showDiff, setShowDiff] = useState(false);

  const group = groups.find((g) => g.key === selectedKey) ?? groups[0];
  const theme = group ? (mode === "light" ? group.light : group.dark) : undefined;
  const baselineTheme = baseline
    ? mode === "light"
      ? baseline.light
      : baseline.dark
    : undefined;
  const diffs = useMemo(() => {
    if (!theme || !baselineTheme) return [];
    return diffThemes(baselineTheme, theme);
  }, [theme, baselineTheme]);

  if (!group) {
    return <p className="text-sm opacity-50">No themes in this group.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest opacity-50">
          Preview theme
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedKey}
            onChange={setSelectedKey}
            label="Preview theme family"
            className="min-w-48"
            options={groups.map((g) => {
              // `tokens.colors.primary` is typed as a string or a nested group,
              // so narrow before using it as a swatch color.
              const primary = g.light?.tokens?.colors?.primary;
              return {
                value: g.key,
                label: g.label,
                hint: g.kind === "brand" ? "Brand preset" : "Signature preset",
                ...(typeof primary === "string" ? { swatch: primary } : {}),
              };
            })}
          />
          <div
            className="inline-flex items-center gap-1 p-1 rounded-full border border-border bg-card/60"
            role="group"
            aria-label="Preview mode"
          >
            {(["light", "dark"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                  mode === m
                    ? "bg-muted text-foreground"
                    : "text-foreground/40 hover:text-foreground/70"
                }`}
              >
                {m === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {theme ? (
        <ThemedAppPreview
          theme={theme}
          label={`${group.label} · ${mode}`}
        />
      ) : (
        <p className="text-sm opacity-50">
          No {mode} variant for this family.
        </p>
      )}

      <PresetFrameworkSetup
        family={group.family}
        kind={kind}
        mode={mode}
      />

      {baselineTheme && theme ? (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowDiff((v) => !v)}
            aria-expanded={showDiff}
            className="self-start text-sm text-primary font-medium no-underline hover:underline cursor-pointer"
          >
            {showDiff
              ? "Hide changes from Default"
              : `Show changes from Default (${diffs.length})`}
          </button>
          {showDiff ? <TokenDiffTable diffs={diffs} /> : null}
        </div>
      ) : null}

      {theme ? <ContrastEvidence theme={theme} /> : null}

      {/* The variables, the definition and the JSON for the preset you picked —
          everything needed to actually use it, rather than only look at it. */}
      {theme ? <PreviewedVariables theme={theme} /> : null}
    </div>
  );
}
