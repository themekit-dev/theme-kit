"use client";

import { useMemo, useState } from "react";
import { useThemeTokens } from "@theme-kit/next/client";
import type { ThemeTokens } from "@theme-kit/core";
import { CopyButton } from "../ui/copy-button";

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
  const hasChildren = node.children && node.children.length > 0;

  const isColor =
    node.value !== undefined &&
    node.path[0] === "colors" &&
    isHexColor(node.value);

  if (!hasChildren) {
    return (
      <li className="py-0.5">
        <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted group">
          <span className="w-4 shrink-0" />
          <span className="mono text-[11px] font-medium">{node.name}</span>
          <span className="mono text-[10px] opacity-40 group-hover:opacity-70 hidden sm:inline truncate">
            {cssVarFor(node.path)}
          </span>
          {isColor ? (
            <span
              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 ml-auto swatch"
              style={{ background: node.value }}
              title={node.value}
            />
          ) : (
            <span className="mono text-[11px] opacity-70 ml-auto shrink-0">
              {node.value}
            </span>
          )}
          <span
            onClick={(e) => e.stopPropagation()}
            className="inline-flex"
          >
            <CopyButton
              text={cssVarFor(node.path)}
              label="copy"
              copiedLabel="✓"
              className="text-[10px] px-1.5 py-0.5 rounded border border-border opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity cursor-pointer shrink-0 mono"
            />
          </span>
        </div>
      </li>
    );
  }

  return (
    <li className="py-0.5">
      <div className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-4 shrink-0 grid place-items-center text-[10px] opacity-60 cursor-pointer"
        >
          {open ? "▾" : "▸"}
        </button>
        <span className="mono text-[11px] font-semibold">{node.name}</span>
        <span className="mono text-[10px] opacity-40">
          {node.children!.length}
        </span>
      </div>
      {open && (
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
      )}
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

  if (flat.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {flat.map((c) => (
        <div key={c.name} className="flex flex-col items-center gap-1">
          <div
            className="w-8 h-8 rounded-md border border-black/10 swatch"
            style={{ background: c.value }}
            title={c.name}
          />
          <span className="mono text-[9px] opacity-50 max-w-16 truncate">
            {c.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TokenTree() {
  const tokens = useThemeTokens();
  const [expanded, setExpanded] = useState(true);
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

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6" aria-label="Token tree">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold mb-0.5">Interactive token tree</h2>
          <p className="text-xs opacity-60">
            Expand a group, search a token, or hover a value to copy its CSS
            variable.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[11px] font-medium opacity-60 hover:opacity-100 underline underline-offset-2 cursor-pointer"
        >
          {expanded ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tokens… e.g. colors.primary, border-width"
        className="w-full mb-4 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary"
        style={{ borderColor: "var(--theme-color-border)" }}
      />

      <div
        className="rounded-xl border mb-4 p-3 flex flex-wrap gap-2"
        style={{ borderColor: "var(--theme-color-border)" }}
      >
        <FlatColorGrid tokens={tokens} />
      </div>

      <div className="rounded-xl border border-border max-h-96 overflow-auto">
        {hasResults ? (
          <ul className="py-2" key={expanded ? "open" : "closed"}>
            {filtered.map((node) => (
              <TreeNode
                key={node.name}
                node={{ ...node, path: [node.name] }}
                depth={0}
                defaultOpen={expanded || query.trim().length > 0}
              />
            ))}
          </ul>
        ) : (
          <p className="p-4 text-sm opacity-60">
            No tokens match “{query}”.
          </p>
        )}
      </div>

      <p className="mt-3 text-[11px] opacity-50">
        {nodes.length} token groups · values are the <em>resolved</em> runtime
        tokens for the active theme.
      </p>
    </section>
  );
}
