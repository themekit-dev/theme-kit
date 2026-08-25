"use client";

import { useState, useCallback, useMemo } from "react";
import {
  generateTheme,
  themeToCSSVariables,
  type ThemeDefinition,
} from "@theme-kit/core";
import { CopyButton } from "../ui/copy-button";
import { highlightCode } from "../../lib/highlight";

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function JsonPreview({ data }: { data: string }) {
  return (
    <div className="code-block overflow-hidden">
      <div className="code-block-toolbar">
        <span className="code-block-filename" title="Theme JSON">
          Theme JSON
        </span>
        <div className="flex items-center gap-1.5">
          <span className="code-block-lang">json</span>
          <CopyButton
            text={data}
            label="Copy"
            copiedLabel="Copied"
            className="code-block-copy"
          />
        </div>
      </div>
      <div
        className="max-h-64 overflow-auto sm:max-h-96"
        dangerouslySetInnerHTML={{ __html: highlightCode(data, "json") }}
      />
    </div>
  );
}

function CSSVarsPreview({ vars }: { vars: Record<string, string> }) {
  const entries = Object.entries(vars);
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 font-mono text-[11px] leading-relaxed max-h-48 overflow-auto">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-2">
          <span className="opacity-50 shrink-0">{key}</span>
          <span className="truncate">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function ThemeGenerator() {
  const [seed, setSeed] = useState("#3b82f6");
  const [family, setFamily] = useState("custom");
  const [withCode, setWithCode] = useState(false);
  const [result, setResult] = useState<{
    light: ThemeDefinition;
    dark: ThemeDefinition;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"json" | "css">("json");

  const handleGenerate = useCallback(() => {
    const generated = generateTheme({ seed, family, withCode });
    setResult(generated);
  }, [seed, family, withCode]);

  const lightCSS = result
    ? themeToCSSVariables(result.light)
    : {};
  const darkCSS = result
    ? themeToCSSVariables(result.dark)
    : {};

  const jsonOutput = useMemo(() => {
    if (!result) return "";
    return JSON.stringify(
      {
        light: {
          name: result.light.name,
          meta: result.light.meta,
          tokens: result.light.tokens,
        },
        dark: {
          name: result.dark.name,
          meta: result.dark.meta,
          tokens: result.dark.tokens,
        },
      },
      null,
      2,
    );
  }, [result]);

  const cssOutput = useMemo(() => {
    if (!result) return "";
    const lightVars = themeToCSSVariables(result.light);
    const darkVars = themeToCSSVariables(result.dark);
    const lightCSS = Object.entries(lightVars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n");
    const darkCSS = Object.entries(darkVars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n");
    return `/* Light theme */\n:root {\n${lightCSS}\n}\n\n/* Dark theme */\n.dark {\n${darkCSS}\n}`;
  }, [result]);

  const copyText = activeTab === "json" ? jsonOutput : cssOutput;

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6" aria-label="Theme generator">
      <h2 className="text-lg font-semibold tracking-tight mb-1">
        Theme generator
      </h2>
      <p className="text-sm opacity-60 mb-5">
        Pick a seed color and generate a matching light/dark theme pair.
        Optional syntax-highlighting code tokens are generated on request.
      </p>

      <div className="flex flex-wrap items-end gap-4 mb-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="seed-color"
            className="text-[11px] font-semibold uppercase tracking-widest opacity-40"
          >
            Seed color
          </label>
          <div className="flex items-center gap-2">
            <input
              id="seed-color"
              type="color"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="#3b82f6"
              className="w-32 px-2 py-1.5 rounded-md border border-border bg-card text-sm font-mono outline-none focus:border-ring transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="theme-family"
            className="text-[11px] font-semibold uppercase tracking-widest opacity-40"
          >
            Family name
          </label>
          <input
            id="theme-family"
            type="text"
            value={family}
            onChange={(e) => setFamily(e.target.value)}
            className="w-32 px-2 py-1.5 rounded-md border border-border bg-card text-sm font-mono outline-none focus:border-ring transition-colors"
          />
        </div>

        <label className="flex items-center gap-2 pb-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={withCode}
            onChange={(e) => setWithCode(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-(--theme-color-primary) cursor-pointer"
          />
          <span className="text-sm opacity-70">Include code tokens</span>
        </label>

        <button
          type="button"
          onClick={handleGenerate}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold cursor-pointer transition-colors hover:opacity-90"
        >
          Generate
        </button>
      </div>

      {result && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border border-border"
                style={{ background: `var(--theme-color-primary)` }}
              />
              <span className="text-sm font-medium">{result.light.name}</span>
            </div>
            <span className="opacity-40">→</span>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border border-border"
                style={{ background: `var(--theme-color-primary)` }}
              />
              <span className="text-sm font-medium">{result.dark.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("json")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                activeTab === "json"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border hover:bg-muted"
              }`}
            >
              JSON
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("css")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                activeTab === "css"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border hover:bg-muted"
              }`}
            >
              CSS Variables
            </button>
            <div className="flex-1" />
            <CopyButton
              text={copyText}
              className="px-2.5 py-1 rounded-md border border-border bg-card text-xs font-medium cursor-pointer transition-colors hover:bg-muted"
            />
          </div>

           {activeTab === "json" ? (
            <JsonPreview data={jsonOutput} />
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest opacity-40 mb-2 block">
                  Light
                </span>
                <CSSVarsPreview vars={lightCSS} />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest opacity-40 mb-2 block">
                  Dark
                </span>
                <CSSVarsPreview vars={darkCSS} />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}