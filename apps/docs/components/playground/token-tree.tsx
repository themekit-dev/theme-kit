"use client";

import { useMemo, useState, useCallback } from "react";
import { useThemeTokens } from "@theme-kit/next/client";
import type { ThemeTokens } from "@theme-kit/core";
import { CopyButton } from "../ui/copy-button";
import { Icon } from "@iconify/react";

type TokenNode = {
  name: string;
  path: string[];
  value?: string;
  children?: TokenNode[];
};

function isHexColor(value: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value.trim());
}

function buildNodes(
  obj: Record<string, unknown>,
  path: string[],
): TokenNode[] {
  return Object.entries(obj).map(([key, value]) => {
    const nextPath = [...path, key];
    if (typeof value === "object" && value !== null) {
      return {
        name: key,
        path: nextPath,
        children: buildNodes(value as Record<string, unknown>, nextPath),
      };
    }
    return { name: key, path: nextPath, value: String(value) };
  });
}

const CATEGORY_PREFIX: Record<string, string> = {
  colors: "color",
  spacing: "spacing",
  radius: "radius",
  shadows: "shadow",
  borderWidths: "border-width",
  zIndex: "z-index",
  breakpoints: "breakpoint",
  fontFamilies: "typography-font-family",
  fontSizes: "typography-font-size",
  lineHeights: "typography-line-height",
};

function cssVarFor(path: string[]): string {
  const [category, ...rest] = path;
  const prefix = CATEGORY_PREFIX[category!] ?? category ?? "";
  return `--theme-${prefix}${rest.length ? "-" + rest.join("-") : ""}`;
}

function TreeNode({
  node,
  depth,
  defaultOpen,
}: {
  node: TokenNode;
  depth: number;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [copiedValue, setCopiedValue] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const isColor =
    node.value !== undefined &&
    node.path[0] === "colors" &&
    isHexColor(node.value);

  const handleCopyValue = useCallback(async () => {
    if (!node.value) return;
    try {
      await navigator.clipboard.writeText(node.value);
      setCopiedValue(true);
      setTimeout(() => setCopiedValue(false), 1200);
    } catch {
      // ignore
    }
  }, [node.value]);

  if (!hasChildren) {
    return (
      <li className="py-0.5">
        <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted/60 group transition-colors cursor-default">
          <span className="w-4 shrink-0" />
          <span className="mono text-[11px] font-medium">{node.name}</span>
          <span className="mono text-[10px] opacity-40 group-hover:opacity-70 hidden sm:inline truncate transition-opacity">
            {cssVarFor(node.path)}
          </span>
          {isColor ? (
            <button
              type="button"
              onClick={handleCopyValue}
              className="ml-auto flex items-center gap-1.5 shrink-0 cursor-pointer group/swatch"
              title={`Click to copy ${node.value}`}
            >
              <span
                className="w-4 h-4 rounded-full border border-black/10 swatch transition-transform group-hover/swatch:scale-110"
                style={{ background: node.value }}
              />
              <span className="mono text-[10px] opacity-60 group-hover/swatch:opacity-100 transition-opacity">
                {copiedValue ? "Copied!" : node.value}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCopyValue}
              className="mono text-[11px] opacity-70 ml-auto shrink-0 cursor-pointer hover:opacity-100 transition-opacity"
              title="Click to copy value"
            >
              {copiedValue ? "Copied!" : node.value}
            </button>
          )}
          <span
            onClick={(e) => e.stopPropagation()}
            className="inline-flex"
          >
            <CopyButton
              text={cssVarFor(node.path)}
              label="copy var"
              className="text-[10px] px-1.5 py-0.5 rounded border border-border opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity cursor-pointer shrink-0 mono"
            />
          </span>
        </div>
      </li>
    );
  }

  return (
    <li className="py-0.5">
      <div
        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted/60 cursor-pointer transition-colors"
        onClick={() => setOpen((v) => !v)}
        role="button"
        aria-expanded={open}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((v) => !v); } }}
      >
        <span className="w-4 shrink-0 grid place-items-center text-[10px] opacity-60 transition-transform duration-200" style={{ transform: open ? "rotate(0)" : "rotate(-90deg)" }}>
          <Icon icon="lucide:chevron-down" className="h-3 w-3" />
        </span>
        <span className="mono text-[11px] font-semibold">{node.name}</span>
        <span className="mono text-[10px] opacity-40 bg-muted px-1.5 py-0.5 rounded-full">
          {node.children!.length}
        </span>
      </div>
      <div
        className="overflow-hidden transition-all duration-200 ease-out"
        style={{ maxHeight: open ? "2000px" : "0", opacity: open ? 1 : 0 }}
      >
        <ul className="ml-3 border-l border-border/70 pl-2 mt-0.5">
          {node.children!.map((child) => (
            <TreeNode
              key={child.name}
              node={child}
              depth={depth + 1}
              defaultOpen={defaultOpen}
            />
          ))}
        </ul>
      </div>
    </li>
  );
}

function FlatColorGrid({ tokens }: { tokens: ThemeTokens | undefined }) {
  const colors = tokens?.colors as Record<string, unknown> | undefined;
  const flat = useMemo(() => {
    const out: { name: string; value: string }[] = [];
    const walk = (obj: Record<string, unknown>, base: string[]) => {
      for (const [key, value] of Object.entries(obj)) {
        const path = [...base, key];
        if (typeof value === "object" && value !== null) {
          walk(value as Record<string, unknown>, path);
        } else if (typeof value === "string" && isHexColor(value)) {
          out.push({ name: path.join("."), value });
        }
      }
    };
    if (colors) walk(colors, []);
    return out;
  }, [colors]);

  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleSwatchClick = useCallback(async (value: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1200);
    } catch {
      // ignore
    }
  }, []);

  if (flat.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {flat.map((c, idx) => (
        <button
          key={c.name}
          type="button"
          onClick={() => handleSwatchClick(c.value, idx)}
          className="flex flex-col items-center gap-1 cursor-pointer group transition-transform hover:scale-105"
          title={`${c.name}: ${c.value} (click to copy)`}
        >
          <div
            className="w-8 h-8 rounded-md border border-black/10 swatch transition-shadow group-hover:shadow-md"
            style={{ background: c.value }}
          />
          <span className="mono text-[9px] opacity-50 max-w-16 truncate group-hover:opacity-80 transition-opacity">
            {copiedIdx === idx ? "Copied!" : c.name}
          </span>
        </button>
      ))}
    </div>
  );
}

export function TokenTree() {
  const tokens = useThemeTokens();
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const nodes = useMemo(() => {
    if (!tokens) return [];
    return buildNodes(tokens as unknown as Record<string, unknown>, []);
  }, [tokens]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return nodes;
    const match = (node: TokenNode): boolean =>
      node.name.toLowerCase().includes(q) ||
      node.path.join(".").toLowerCase().includes(q) ||
      (node.value !== undefined && node.value.toLowerCase().includes(q)) ||
      (node.children ? node.children.some(match) : false);
    const filter = (node: TokenNode): TokenNode | null => {
      const children = node.children
        ? node.children
            .map(filter)
            .filter((c): c is TokenNode => c !== null)
        : undefined;
      if (children && children.length > 0) return { ...node, children };
      if (node.value !== undefined && match(node)) return node;
      return null;
    };
    return nodes.map(filter).filter((n): n is TokenNode => n !== null);
  }, [nodes, query]);

  const hasResults = filtered.length > 0;
  const isSearching = query.trim().length > 0;

  const totalLeaves = useMemo(() => {
    const count = (n: TokenNode): number =>
      n.children ? n.children.reduce((sum, c) => sum + count(c), 0) : 1;
    return filtered.reduce((sum, n) => sum + count(n), 0);
  }, [filtered]);

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6" aria-label="Token tree">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold mb-0.5">Interactive token tree</h2>
          <p className="text-xs opacity-60">
            Click groups to expand. Click any value or swatch to copy it. Search to filter.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="chip text-[11px] cursor-pointer"
        >
          <Icon icon={expanded ? "lucide:chevrons-up" : "lucide:chevrons-down"} className="h-3 w-3" />
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      <div className="relative mb-4">
        <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-40" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tokens... e.g. colors.primary, border-width"
          aria-label="Search tokens"
          className="w-full rounded-lg border border-border bg-muted/40 pl-8 pr-3 py-2 text-sm outline-none focus:border-ring transition-colors"
        />
        {isSearching && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <Icon icon="lucide:x" className="h-3 w-3 opacity-50" />
          </button>
        )}
      </div>

      <div
        className="rounded-xl border mb-4 p-3 flex flex-wrap gap-2 transition-colors"
        style={{ borderColor: "var(--theme-color-border)" }}
      >
        <FlatColorGrid tokens={tokens} />
      </div>

      <div className="rounded-xl border border-border max-h-[28rem] overflow-auto transition-all">
        {hasResults ? (
          <ul className="py-2" key={expanded ? "open" : isSearching ? "search" : "closed"}>
            {filtered.map((node) => (
              <TreeNode
                key={node.name}
                node={{ ...node, path: [node.name] }}
                depth={0}
                defaultOpen={expanded || isSearching}
              />
            ))}
          </ul>
        ) : (
          <div className="p-6 text-center">
            <Icon icon="lucide:search-x" className="h-6 w-6 mx-auto mb-2 opacity-30" />
            <p className="text-sm opacity-60">
              No tokens match "{query}".
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] opacity-50">
          {nodes.length} groups · {totalLeaves} tokens ·{" "}
          {isSearching ? `${filtered.length} matching` : "showing all"}
        </p>
        <p className="text-[11px] opacity-50">
          Values are <em>resolved</em> runtime tokens
        </p>
      </div>
    </section>
  );
}
