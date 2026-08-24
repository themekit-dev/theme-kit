import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

import { allocateId, stripNumberPrefix, type TocItem } from "./toc";

type Ctx = {
  seen: Map<string, number>;
  items: TocItem[];
};

function textOf(node: ReactNode): string {
  if (
    node == null ||
    typeof node === "boolean" ||
    typeof node === "string" ||
    typeof node === "number"
  ) {
    return typeof node === "string" || typeof node === "number"
      ? String(node)
      : "";
  }
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) {
    return textOf((node.props as { children?: ReactNode }).children);
  }
  return "";
}

/**
 * Recursively walks the render tree and:
 * - collects every literal `h2`/`h3` host element into TOC items,
 * - assigns each a stable id via cloneElement so anchor links work on
 *   first paint (previously ids were only assigned client-side after
 *   hydration, which made the TOC rail pop in late on refresh).
 *
 * Client-component boundaries are opaque: headings rendered inside them are
 * picked up later by the client-side scanner in `Toc`, which reconciles
 * incrementally. Ids stay stable because both sides allocate through the
 * same deterministic `allocateId`.
 */
function collect(node: ReactNode, ctx: Ctx): ReactNode {
  if (
    node == null ||
    typeof node === "boolean" ||
    typeof node === "string" ||
    typeof node === "number"
  ) {
    return node;
  }
  if (Array.isArray(node)) {
    let changed = false;
    const mapped = node.map((child, i) => {
      const next = collect(child, ctx);
      if (next !== child) changed = true;
      // Rebuilt arrays are validated as dynamic lists by React, so every
      // element needs an explicit key — static JSX siblings normally rely on
      // implicit positional slots and don't carry one. Index keys preserve
      // the exact same reconciliation behavior.
      if (isValidElement(next) && next.key === null) {
        changed = true;
        return cloneElement(next as ReactElement, { key: `.tk-${i}` });
      }
      return next;
    });
    return changed ? mapped : node;
  }
  if (!isValidElement(node)) return node;

  const el = node as ReactElement<{ children?: ReactNode; id?: string }>;

  if (el.type === "h2" || el.type === "h3") {
    const raw = textOf(el.props.children).replace(/\s+/g, " ").trim();
    if (!raw) return el;
    const text = stripNumberPrefix(raw);
    const id = allocateId(ctx.seen, text);
    ctx.items.push({ id, text, level: el.type === "h2" ? 2 : 3 });
    return cloneElement(el as ReactElement<{ id?: string }>, { id });
  }

  const child = el.props.children;
  const next = collect(child, ctx);
  return next === child ? el : cloneElement(el, {}, next);
}

export function collectTocItems(children: ReactNode): {
  tree: ReactNode;
  items: TocItem[];
} {
  const ctx: Ctx = { seen: new Map<string, number>(), items: [] };
  const tree = collect(children, ctx);
  return { tree, items: ctx.items };
}

/**
 * Collect only the TOC items from a server-rendered element tree, without
 * modifying it. Pages call this on their own JSX so they can pass `headings`
 * to DocsLayout: the layout's own walk sees a RSC-serialized tree in which
 * subtrees that share a parent with a client component are opaque templates,
 * but the page's own tree (created before that serialization) still contains
 * the literal h2/h3 host elements.
 */
export function collectPageHeadings(children: ReactNode): TocItem[] {
  const ctx: Ctx = { seen: new Map<string, number>(), items: [] };
  collect(children, ctx);
  return ctx.items;
}
