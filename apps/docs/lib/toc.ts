export type TocItem = { id: string; text: string; level: 2 | 3 };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`*_]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Strip a leading section number ("1Define a theme" / "1 Define…" / "1 · Install"). */
export function stripNumberPrefix(text: string): string {
  return text.replace(/^\d+\s*·?\s*/, "");
}

/**
 * Deterministic duplicate-id allocation shared by the server-side TOC
 * collector and the client-side scanner, so both produce identical ids for
 * the same heading sequence.
 */
export function allocateId(seen: Map<string, number>, text: string): string {
  const base = slugify(text);
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count > 0 ? `${base}-${count}` : base;
}

/**
 * Build TOC items from plain heading text, allocating ids exactly as the
 * client-side scanner does (`stripNumberPrefix` + `allocateId`). Pages whose
 * headings render inside client components (or SectionHeading) aren't visible
 * to the layout's RSC tree walk, so they pass their known headings here to
 * DocsLayout — ids stay in lockstep with the authoritative client scan.
 */
export function buildPageHeadings(
  entries: Array<{ text: string; level: 2 | 3 }>,
): TocItem[] {
  const seen = new Map<string, number>();
  return entries.map(({ text, level }) => ({
    text,
    level,
    id: allocateId(seen, stripNumberPrefix(text)),
  }));
}
