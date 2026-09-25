import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");
const docsDir = join(repoRoot, "apps", "docs");
const outRoot = join(docsDir, "content", "api-reference");

const KINDS = {
  Class: 128,
  Interface: 256,
  Function: 64,
  Variable: 32,
  TypeAlias: 2097152, // Typedoc 0.28 ReflectionKind.TypeAlias
  Enum: 4,
  Property: 1024,
  Method: 2048,
  TypeLiteral: 65536,
  Signature: 4096,
};

/**
 * Entries for the framework-binding adapters: every one ships the same six
 * entrypoints (root factory + `./factory` + `./react|vue|svelte|solid|angular`),
 * which is all of them except the non-TypeScript CSS subpath.
 */
const frameworkAdapterEntries = () => [
  { page: null, entry: "src/index.ts" },
  { page: "factory", entry: "src/factory.ts" },
  { page: "react", entry: "src/react.ts" },
  { page: "vue", entry: "src/vue.ts" },
  { page: "svelte", entry: "src/svelte.ts" },
  { page: "solid", entry: "src/solid.ts" },
  { page: "angular", entry: "src/angular.ts" },
];

const PACKAGES = [
  {
    slug: "core",
    name: "@theme-kit/core",
    entries: [
      { page: null, entry: "src/index.ts" },
      { page: "vanilla", entry: "src/vanilla.ts" },
      { page: "vite", entry: "src/vite-plugin.ts" },
      // Build-time only: discovery of the application's `theme.config.ts`. A
      // separate entrypoint because it uses node builtins, which the runtime
      // entry must never pull into a browser bundle.
      { page: "config", entry: "src/config.ts" },
    ],
  },
  { slug: "react", name: "@theme-kit/react", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "next", name: "@theme-kit/next", entries: [
    { page: null, entry: "src/index.ts" },
    { page: "client", entry: "src/client.ts" },
  ] },
  { slug: "vue", name: "@theme-kit/vue", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "svelte", name: "@theme-kit/svelte", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "solid", name: "@theme-kit/solid", entries: [{ page: null, entry: "src/index.tsx" }] },
  { slug: "angular", name: "@theme-kit/angular", entries: [{ page: null, entry: "src/public-api.ts" }] },
  { slug: "web", name: "@theme-kit/web", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "tailwind", name: "@theme-kit/tailwind", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "astro", name: "@theme-kit/astro", entries: [
    { page: null, entry: "src/index.ts" },
    // The node-side / build-time entry. Kept separate from the root entry
    // because it uses node builtins and must never reach a browser bundle.
    { page: "runtime", entry: "src/runtime.ts" },
    { page: "client", entry: "src/client.tsx" },
  ] },
  { slug: "nuxt", name: "@theme-kit/nuxt", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "remix", name: "@theme-kit/remix", entries: [
    { page: null, entry: "src/index.ts" },
    { page: "server", entry: "src/server/index.ts" },
  ] },
  { slug: "cli", name: "@theme-kit/cli", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "devtools", name: "@theme-kit/devtools", entries: [{ page: null, entry: "src/index.ts" }] },

  // Adapter integrations (the shared toolkit plus every published adapter).
  // `dir` points at packages/adapters/<name>, because they do not live
  // directly under packages/.
  { slug: "mui", name: "@theme-kit/mui", dir: "adapters/mui", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "chakra", name: "@theme-kit/chakra", dir: "adapters/chakra", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "antd", name: "@theme-kit/antd", dir: "adapters/antd", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "mantine", name: "@theme-kit/mantine", dir: "adapters/mantine", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "unocss", name: "@theme-kit/unocss", dir: "adapters/unocss", entries: [{ page: null, entry: "src/index.ts" }] },
  {
    slug: "adapters",
    name: "@theme-kit/adapters",
    dir: "adapters/shared",
    entries: [
      { page: null, entry: "src/index.ts" },
      { page: "react", entry: "src/react.ts" },
    ],
  },
  { slug: "shadcn", name: "@theme-kit/shadcn", dir: "adapters/shadcn", entries: frameworkAdapterEntries() },
  { slug: "bootstrap", name: "@theme-kit/bootstrap", dir: "adapters/bootstrap", entries: frameworkAdapterEntries() },
  { slug: "daisyui", name: "@theme-kit/daisyui", dir: "adapters/daisyui", entries: frameworkAdapterEntries() },
  { slug: "open-props", name: "@theme-kit/open-props", dir: "adapters/open-props", entries: frameworkAdapterEntries() },
];

const TYPE_ALIAS_KIND = 2097152;

function commentText(comment) {
  if (!comment?.summary) return "";
  return comment.summary.map((p) => p.text ?? "").join("").trim();
}

/**
 * Sanitise a value for a markdown table cell.
 *
 * A JSDoc summary keeps its source line breaks, and a raw newline inside a
 * `| … |` row terminates it: the rest of the sentence escapes the table and
 * becomes a stray paragraph, and the row loses a column. A raw `|` is worse —
 * it splits the cell outright. Both are routine here: most parameter
 * descriptions wrap in the source, and `renderType` joins union types with
 * `" | "`, so `ThemeTokens | undefined` is a perfectly ordinary type.
 *
 * Collapsing whitespace and escaping the pipe fixes all of it. GFM resolves
 * `\|` to a literal `|` even inside a code span, which is why the escape is
 * safe to apply to the backticked type column.
 */
function tableCell(text) {
  return String(text ?? "")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
}

function blockTag(comment, tag) {
  if (!comment?.blockTags) return "";
  for (const b of comment.blockTags) {
    if (b.tag === tag) return b.content.map((p) => p.text ?? "").join("").trim();
  }
  return "";
}

function typeParamsText(typeParameters) {
  if (!typeParameters?.length) return "";
  const inner = typeParameters
    .map((tp) => {
      const name = tp.name ?? "";
      const constraint = tp.type ? ` extends ${renderType(tp.type)}` : "";
      return `${name}${constraint}`;
    })
    .join(", ");
  return `<${inner}>`;
}

function renderReflectionDeclaration(declaration, depth) {
  const parts = [];
  if (declaration.signatures?.length) {
    parts.push(declaration.signatures.map(renderSignature).join("; "));
  }
  if (declaration.children?.length) {
    const props = declaration.children
      .filter((c) => !c.name.startsWith("__"))
      .map((c) => {
        const opt = c.flags?.isOptional ? "?" : "";
        const type = renderType(c.type, depth);
        return `${c.name}${opt}: ${type}`;
      });
    parts.push(`{ ${props.join("; ")} }`);
  }
  if (declaration.indexSignatures?.length) {
    for (const is of declaration.indexSignatures) {
      const p = is.parameters?.[0];
      parts.push(
        `{ [${p?.name ?? "key"}: ${renderType(p?.type, depth)}]: ${renderType(is.type, depth)} }`,
      );
    }
  }
  return parts.join(" ") || "object";
}

function renderType(t, depth = 0) {
  if (!t) return "void";
  switch (t.type) {
    case "intrinsic":
      return t.name;
    case "literal":
      return typeof t.value === "string" ? `"${t.value}"` : String(t.value);
    case "reference": {
      const args = t.typeArguments?.length
        ? `<${t.typeArguments.map((a) => renderType(a, depth)).join(", ")}>`
        : "";
      return `${t.name}${args}`;
    }
    case "array":
      return `${renderType(t.elementType, depth)}[]`;
    case "union":
      return t.types.map((x) => renderType(x, depth)).join(" | ");
    case "intersection":
      return t.types.map((x) => renderType(x, depth)).join(" & ");
    case "typeOperator":
      return `${t.operator} ${renderType(t.target, depth)}`;
    case "predicate":
      return `${t.name} is ${renderType(t.targetType, depth)}`;
    case "reflection":
      return renderReflectionDeclaration(t.declaration, depth + 1);
    case "tuple":
      return `[${(t.elements ?? t.elementTypes ?? []).map((x) => renderType(x, depth)).join(", ")}]`;
    case "namedTupleMember":
      return `${t.name}: ${renderType(t.element, depth)}`;
    case "rest":
      return `...${renderType(t.elementType, depth)}`;
    case "optional":
      return `${renderType(t.elementType, depth)}?`;
    case "indexedAccess":
      return `${renderType(t.objectType, depth)}[${renderType(t.indexType, depth)}]`;
    case "typeParameter":
      return t.name;
    case "query":
      return `typeof ${t.queryType.name}`;
    case "inferred":
      return `infer ${t.name}`;
    case "templateLiteral": {
      const tail = (t.tail ?? []).map((x) => `${"${"}${renderType(x, depth)}${"}"}${x.text ?? ""}`).join("");
      return `\`${t.head ?? ""}${tail}\``;
    }
    case "conditional":
      return `${renderType(t.checkType, depth)} extends ${renderType(t.extendsType, depth)} ? ${renderType(t.trueType, depth)} : ${renderType(t.falseType, depth)}`;
    case "mapped": {
      const p = t.parameter ?? "K";
      const name = t.parameterType ? `[${p} in ${renderType(t.parameterType, depth)}]` : `[${p} in keyof ${renderType(t.templateType, depth)}]`;
      return `{ ${name}: ${renderType(t.templateType, depth)} }`;
    }
    default:
      return t.name ?? "unknown";
  }
}

function renderSignature(sig) {
  const params = (sig.parameters ?? [])
    .map((p) => {
      const opt = p.flags?.isRest ? "..." : p.flags?.isOptional ? "?" : "";
      const type = renderType(p.type);
      return `${p.name}${opt}: ${type}`;
    })
    .join(", ");
  const tps = typeParamsText(sig.typeParameters);
  return `${sig.name}${tps}(${params}): ${renderType(sig.type)}`;
}

function renderCommentLine(comment) {
  const text = commentText(comment);
  if (!text) return "";
  return `\n${text}\n`;
}

/**
 * Renders all `@see` block tags of a comment as a single "See also" line.
 *
 * TypeDoc parses consecutive `@see {@link X}` lines into one block tag whose
 * content interleaves inline `@link` parts with `" - "`/newline text parts,
 * so the link targets are extracted from the inline-tag parts directly.
 * Plain `@see` text (no `{@link}`) falls back to the joined text.
 */
function renderSeeAlso(comment) {
  if (!comment?.blockTags) return "";
  const links = [];
  for (const b of comment.blockTags) {
    if (b.tag !== "@see") continue;
    const parts = b.content ?? [];
    const inline = parts
      .filter(
        (p) =>
          p.kind === "inline-tag" &&
          (p.tag === "@link" || p.tag === "@linkcode"),
      )
      .map((p) => p.text?.trim())
      .filter(Boolean);
    if (inline.length) {
      links.push(...inline);
    } else {
      const text = parts
        .map((p) => p.text ?? "")
        .join("")
        .trim();
      if (text) links.push(text);
    }
  }
  if (!links.length) return "";
  const unique = [...new Set(links.map((l) => l.replace(/^\{@link\s+|\}$/g, "").trim()))];
  return `\n**See also:** ${unique.map((l) => `\`${l}\``).join(", ")}\n`;
}

/**
 * Renders a comment's `@remarks` prose, if present.
 *
 * Worth its own helper because the API pages were summary-only until now: a
 * function's contract — the discovery rules, the injection points, the
 * limitations — lives in `@remarks`, and dropping it left the page asserting
 * what a symbol does without saying how it behaves.
 */
function renderRemarks(comment) {
  const text = blockTag(comment, "@remarks");
  if (!text) return "";
  return `\n${text}\n`;
}

/**
 * Renders a comment's `@example` blocks as fenced TypeScript.
 *
 * TypeDoc hands back the example's content without its fences, so the language
 * is supplied here. Multiple `@example` tags are joined as separate blocks.
 */
function renderExample(comment) {
  if (!comment?.blockTags) return "";
  const blocks = [];
  for (const b of comment.blockTags) {
    if (b.tag !== "@example") continue;
    const text = (b.content ?? [])
      .map((p) => p.text ?? "")
      .join("")
      .trim()
      // A `@example` written with its own fence keeps it; strip the outer pair
      // so the block is not double-fenced.
      .replace(/^```[a-z]*\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    if (text) blocks.push(text);
  }
  if (!blocks.length) return "";
  return blocks.map((b) => `\n\`\`\`ts\n${b}\n\`\`\`\n`).join("");
}

function renderParamsTable(sig) {
  const params = (sig.parameters ?? []).filter((p) => p.name !== "__namedParameters");
  if (!params.length) return "";
  const rows = params
    .map((p) => {
      const required = p.flags?.isRest ? "" : p.flags?.isOptional ? " (optional)" : "";
      // `tableCell` on the type too: `renderType` joins unions with a raw
      // `" | "`, so `ThemeTokens | undefined` would split the cell.
      const type = `\`${tableCell(renderType(p.type))}\``;
      const desc = tableCell(commentText(p.comment) || "—");
      const name = p.flags?.isRest ? `...${p.name}` : `\`${p.name}\``;
      return `| ${name} | ${type}${required} | ${desc} |`;
    })
    .join("\n");
  return `\n| Parameter | Type | Description |\n| --------- | ---- | ----------- |\n${rows}\n`;
}

function renderReturns(sig) {
  const returns = blockTag(sig.comment, "@returns") || blockTag(sig.comment, "@return");
  const line = `\n**Returns** \`${renderType(sig.type)}\``;
  if (returns) return `${line} — ${returns}\n`;
  return `${line}\n`;
}

function renderSignatureSection(sig) {
  const tps = typeParamsText(sig.typeParameters);
  let out = `\n### \`${sig.name}${tps}(${sig.parameters?.map((p) => `${p.name}${p.flags?.isOptional ? "?" : ""}${p.flags?.isRest ? "..." : ""}`).join(", ") ?? ""}): ${renderType(sig.type)}\``;
  out += renderCommentLine(sig.comment);
  out += renderSeeAlso(sig.comment);
  out += renderParamsTable(sig);
  out += renderReturns(sig);
  out += renderRemarks(sig.comment);
  out += renderExample(sig.comment);
  out += "\n---\n";
  return out;
}

function renderFunction(ref) {
  const sig = ref.signatures?.[0] ?? ref;
  let out = "";
  if (sig.parameters?.length) {
    out += renderSignatureSection(sig);
    return out;
  }
  out += `\n### \`${renderSignature(sig)}\``;
  out += renderCommentLine(sig.comment);
  out += renderSeeAlso(sig.comment);
  out += renderReturns(sig);
  out += renderRemarks(sig.comment);
  out += renderExample(sig.comment);
  out += "\n---\n";
  return out;
}

function renderMembersTable(members) {
  const rows = [];
  for (const m of members) {
    const name = m.flags?.isReadonly ? `readonly \`${m.name}\`` : `\`${m.name}\``;
    const opt = m.flags?.isOptional ? " (optional)" : m.flags?.isAbstract ? " (abstract)" : "";
    if (m.kind === KINDS.Method || m.signatures) {
      const sig = m.signatures?.[0] ?? m;
      rows.push(`| ${name}${opt} | \`${tableCell(renderType(sig.type))}\` | ${tableCell(commentText(m.comment) || "—")} |`);
    } else {
      rows.push(`| ${name}${opt} | \`${tableCell(renderType(m.type))}\` | ${tableCell(commentText(m.comment) || "—")} |`);
    }
  }
  return `\n| Member | Type | Description |\n| ------ | ---- | ----------- |\n${rows.join("\n")}\n`;
}

function renderInterface(ref) {
  let out = `\n### \`${ref.name}${typeParamsText(ref.typeParameters)}\``;
  if (ref.extendedTypes?.length) {
    out += `\n\n**Extends** ${ref.extendedTypes.map((t) => `\`${renderType(t)}\``).join(", ")}`;
  }
  out += renderCommentLine(ref.comment);
  out += renderSeeAlso(ref.comment);
  const members = (ref.children ?? []).filter(
    (c) => ![KINDS.Signature].includes(c.kind),
  );
  if (members.length) out += renderMembersTable(members);
  out += renderRemarks(ref.comment);
  out += renderExample(ref.comment);
  out += "\n---\n";
  return out;
}

function renderClass(ref) {
  let out = `\n### \`class ${ref.name}${typeParamsText(ref.typeParameters)}\``;
  if (ref.extendedTypes?.length) {
    out += `\n\n**Extends** ${ref.extendedTypes.map((t) => `\`${renderType(t)}\``).join(", ")}`;
  }
  out += renderCommentLine(ref.comment);
  out += renderSeeAlso(ref.comment);
  const members = (ref.children ?? []).filter(
    (c) => ![KINDS.Signature, KINDS.TypeLiteral].includes(c.kind),
  );
  if (members.length) out += renderMembersTable(members);
  out += renderRemarks(ref.comment);
  out += renderExample(ref.comment);
  out += "\n---\n";
  return out;
}

function renderTypeAlias(ref) {
  let out = `\n### \`${ref.name}${typeParamsText(ref.typeParameters)}\``;
  out += renderCommentLine(ref.comment);
  out += renderSeeAlso(ref.comment);
  const type = renderType(ref.type);
  if (ref.name !== type) out += `\n\`${type}\`\n`;
  out += renderRemarks(ref.comment);
  out += renderExample(ref.comment);
  out += "\n---\n";
  return out;
}

function renderVariable(ref) {
  let out = `\n### \`${ref.name}\``;
  out += renderCommentLine(ref.comment);
  out += renderSeeAlso(ref.comment);
  out += `\n\`${renderType(ref.type)}\`\n`;
  out += "\n---\n";
  return out;
}

function renderEnum(ref) {
  let out = `\n### \`enum ${ref.name}\``;
  out += renderCommentLine(ref.comment);
  const rows = (ref.children ?? []).map(
    (c) =>
      `| \`${c.name}\` | \`${tableCell(c.defaultValue ?? c.name)}\` | ${tableCell(commentText(c.comment) || "—")} |`,
  );
  out += `\n| Member | Value | Description |\n| ------ | ----- | ----------- |\n${rows.join("\n")}\n`;
  out += "\n---\n";
  return out;
}

const ORDER = [KINDS.Function, KINDS.Class, KINDS.Interface, KINDS.TypeAlias, KINDS.Variable, KINDS.Enum];

function renderJson(json) {
  const sections = new Map();
  for (const ref of json.children ?? []) {
    const key = ORDER.find((k) => (ref.kind & k) === k);
    const label =
      ref.kind === KINDS.Class
        ? "Classes"
        : ref.kind === KINDS.Interface
          ? "Interfaces"
          : ref.kind === KINDS.Function
            ? "Functions"
            : ref.kind === KINDS.Variable
              ? "Variables"
              : ref.kind === KINDS.TypeAlias
                ? "Type Aliases"
                : ref.kind === KINDS.Enum
                  ? "Enums"
                  : null;
    if (!label) continue;
    if (!sections.has(label)) sections.set(label, []);
    sections.get(label).push(ref);
  }

  const parts = [];
  for (const label of ["Functions", "Classes", "Interfaces", "Type Aliases", "Variables", "Enums"]) {
    const refs = sections.get(label);
    if (!refs?.length) continue;
    parts.push(`## ${label}`);
    for (const ref of refs.sort((a, b) => a.name.localeCompare(b.name))) {
      if (ref.kind === KINDS.Function) parts.push(renderFunction(ref));
      else if (ref.kind === KINDS.Class) parts.push(renderClass(ref));
      else if (ref.kind === KINDS.Interface) parts.push(renderInterface(ref));
      else if (ref.kind === KINDS.TypeAlias) parts.push(renderTypeAlias(ref));
      else if (ref.kind === KINDS.Variable) parts.push(renderVariable(ref));
      else if (ref.kind === KINDS.Enum) parts.push(renderEnum(ref));
    }
  }
  return parts.join("\n");
}

/**
 * §6.4 — every generated API page links back to the guide(s) that own its
 * symbols. Sources: `docs/reference/capabilities.ts` (the registry). Both
 * halves contribute:
 *  - a *capability* contributes a backlink when its `packages` map lists this
 *    package (or package entrypoint) and it declares a `guide` route;
 *  - an *integration* (framework/adapter plumbing) contributes one the same
 *    way, so adapter/framework-subpath pages link back to their guide page
 *    instead of rendering no "Related docs" section at all.
 */
let registry;
let guideLabels;
/**
 * `docs-routes.ts` owns the site IA (href → label). Reuse its labels for the
 * integration backlinks so the generated section reads like the sidebar.
 */
function labelForGuide(route) {
  if (!guideLabels) {
    guideLabels = new Map();
    try {
      const src = readFileSync(join(docsDir, "lib", "docs-routes.ts"), "utf8");
      for (const m of src.matchAll(/\{\s*href:\s*"([^"]+)"\s*,\s*label:\s*"([^"]+)"/g)) {
        guideLabels.set(m[1], m[2]);
      }
    } catch {
      /* fall back to slugs */
    }
  }
  return guideLabels.get(route);
}

async function backlinksFor(pkgName, entry) {
  if (!registry) {
    const registryPath = join(repoRoot, "scripts", "docs", "lib", "registry.mjs");
    const { loadRegistry } = await import(pathToFileURL(registryPath).href);
    registry = loadRegistry();
  }
  const pkgKey = entry.page ? `${pkgName}/${entry.page}` : pkgName;
  const links = [];
  const seen = new Set();
  const push = (title, guide, summary) => {
    if (seen.has(guide)) return;
    seen.add(guide);
    links.push(`- [${title}](${guide}) — ${summary}`);
  };

  for (const cap of Object.values(registry.capabilities)) {
    if (!cap.guide) continue;
    if (!cap.packages?.[pkgKey]?.length) continue;
    push(cap.title, cap.guide, cap.summary);
  }

  for (const [slug, integ] of Object.entries(registry.integrations)) {
    if (!integ.guide) continue;
    if (!integ.packages?.[pkgKey]?.length) continue;
    push(
      labelForGuide(integ.guide) ?? slug,
      integ.guide,
      `the ${integ.kind} integration`,
    );
  }

  return links;
}

async function generateEntry(pkg, entry, tmpJson) {
  // `dir` addresses packages that do not live directly under `packages/`
  // (the adapters live under `packages/adapters/*`).
  const pkgDir = join(repoRoot, "packages", pkg.dir ?? pkg.slug);
  const entryAbs = join(pkgDir, entry.entry).replace(/\\/g, "/");
  const tsconfig = join(pkgDir, "tsconfig.json").replace(/\\/g, "/");
  const args = [
    join(docsDir, "node_modules", "typedoc", "bin", "typedoc"),
    "--tsconfig",
    tsconfig,
    "--entryPoints",
    entryAbs,
    "--json",
    tmpJson,
    "--excludePrivate",
    "--excludeInternal",
    "--skipErrorChecking",
    "--logLevel",
    "Error",
  ];
  execFileSync(process.execPath, args, { stdio: "pipe" });
  const json = JSON.parse(readFileSync(tmpJson, "utf8"));
  rmSync(tmpJson, { force: true });

  const heading = entry.page ? `${pkg.name}/${entry.page}` : pkg.name;
  const body = renderJson(json);
  const moduleComment = commentText(json.comment);
  const moduleIntro = moduleComment ? `\n${moduleComment}\n` : "";
  // §6.4: link the page back to the capability guide(s) that own its symbols.
  const links = await backlinksFor(pkg.name, entry);
  const related = links.length
    ? `\n## Related docs\n\n${links.join("\n")}\n`
    : "";
  return `## ${heading}${moduleIntro}\n> Generated from \`packages/${pkg.slug}/src\` by \`apps/docs/scripts/generate-api-reference.mjs\`. Do not edit by hand — run \`pnpm --filter @theme-kit/docs api:generate\`.\n\n${body}${related}`;
}

/** Every `.md` under a directory, recursively. */
function walkMarkdown(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdown(p));
    else if (entry.name.endsWith(".md")) out.push(p);
  }
  return out;
}

async function main() {
  // `--check` regenerates in memory and compares, without writing. This is what
  // makes "hand-editing anything under apps/docs/content/api-reference/**" an
  // enforced anti-pattern rather than a documented one: a hand-edited file no
  // longer matches what the generator would produce, and the gate fails.
  const check = process.argv.includes("--check");
  if (!check) mkdirSync(outRoot, { recursive: true });

  // Optional scope: --packages=angular (or a comma-separated slug list).
  const pkgFilter = process.argv
    .find((a) => a.startsWith("--packages="))
    ?.replace("--packages=", "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  let count = 0;
  let failed = 0;
  const owned = new Set();
  const drifted = [];
  const missing = [];
  for (const pkg of PACKAGES) {
    if (pkgFilter && !pkgFilter.includes(pkg.slug)) continue;
    for (const entry of pkg.entries) {
      const tmpJson = join(process.env.TEMP ?? "/tmp", `theme-kit-api-${pkg.slug}-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
      try {
        const md = await generateEntry(pkg, entry, tmpJson);
        const outFile = entry.page
          ? join(outRoot, pkg.slug, `${entry.page}.md`)
          : join(outRoot, `${pkg.slug}.md`);
        const rel = outFile.replace(docsDir, "apps/docs").replace(/\\/g, "/");
        owned.add(rel);
        if (check) {
          let current = null;
          try {
            current = readFileSync(outFile, "utf8");
          } catch {
            /* missing */
          }
          if (current === null) {
            missing.push(rel);
            console.error(`MISSING  ${rel}`);
          } else if (current !== md) {
            drifted.push(rel);
            console.error(`DRIFTED  ${rel}`);
          }
        } else {
          mkdirSync(dirname(outFile), { recursive: true });
          writeFileSync(outFile, md, "utf8");
          const lines = md.split("\n").length;
          console.log(`generated ${rel} (${lines} lines)`);
        }
        count++;
      } catch (err) {
        failed++;
        console.error(`FAILED ${pkg.name}/${entry.page ?? "index"}: ${err.message}`);
        // execFileSync stores typedoc's stderr on the error; without it a
        // failure is opaque. Prefer surfacing the real error over a stack.
        if (err?.stderr) console.error(err.stderr.toString());
      }
    }
  }

  if (!check) {
    console.log(`\nDone. Generated ${count} API reference files.`);
    return;
  }

  // A file the generator no longer owns is either a leftover from a renamed
  // entrypoint or a hand-written page in a generated tree. Both are drift.
  // Only meaningful for a full run: a `--packages=` scope deliberately owns a
  // subset, so every other file would look stray.
  const strays = pkgFilter
    ? []
    : walkMarkdown(outRoot)
        .map((f) => f.replace(docsDir, "apps/docs").replace(/\\/g, "/"))
        .filter((rel) => !owned.has(rel));

  console.log(`\nChecked ${count} API reference files (${failed} failed to generate).`);
  for (const rel of strays) console.error(`UNEXPECTED  ${rel}`);
  if (drifted.length || missing.length || strays.length || failed) {
    console.error(
      `\n${drifted.length} drifted, ${missing.length} missing, ${strays.length} unexpected, ${failed} failed.` +
        `\nRegenerate with: node apps/docs/scripts/generate-api-reference.mjs`,
    );
    process.exitCode = 1;
  } else {
    console.log("No drift: every file matches the generator.");
  }
}

main();
