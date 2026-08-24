import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

const PACKAGES = [
  {
    slug: "core",
    name: "@theme-kit/core",
    entries: [
      { page: null, entry: "src/index.ts" },
      { page: "vanilla", entry: "src/vanilla.ts" },
      { page: "vite", entry: "src/vite-plugin.ts" },
    ],
  },
  { slug: "react", name: "@theme-kit/react", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "next", name: "@theme-kit/next", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "vue", name: "@theme-kit/vue", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "svelte", name: "@theme-kit/svelte", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "solid", name: "@theme-kit/solid", entries: [{ page: null, entry: "src/index.tsx" }] },
  { slug: "angular", name: "@theme-kit/angular", entries: [{ page: null, entry: "src/public-api.ts" }] },
  { slug: "web", name: "@theme-kit/web", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "tailwind", name: "@theme-kit/tailwind", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "astro", name: "@theme-kit/astro", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "nuxt", name: "@theme-kit/nuxt", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "remix", name: "@theme-kit/remix", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "cli", name: "@theme-kit/cli", entries: [{ page: null, entry: "src/index.ts" }] },
  { slug: "devtools", name: "@theme-kit/devtools", entries: [{ page: null, entry: "src/index.ts" }] },
];

const TYPE_ALIAS_KIND = 2097152;

function commentText(comment) {
  if (!comment?.summary) return "";
  return comment.summary.map((p) => p.text ?? "").join("").trim();
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

function renderParamsTable(sig) {
  const params = (sig.parameters ?? []).filter((p) => p.name !== "__namedParameters");
  if (!params.length) return "";
  const rows = params
    .map((p) => {
      const required = p.flags?.isRest ? "" : p.flags?.isOptional ? " (optional)" : "";
      const type = `\`${renderType(p.type)}\``;
      const desc = commentText(p.comment) || "—";
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
  out += renderParamsTable(sig);
  out += renderReturns(sig);
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
  out += renderReturns(sig);
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
      rows.push(`| ${name}${opt} | \`${renderType(sig.type)}\` | ${commentText(m.comment) || "—"} |`);
    } else {
      rows.push(`| ${name}${opt} | \`${renderType(m.type)}\` | ${commentText(m.comment) || "—"} |`);
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
  const members = (ref.children ?? []).filter(
    (c) => ![KINDS.Signature].includes(c.kind),
  );
  if (members.length) out += renderMembersTable(members);
  out += "\n---\n";
  return out;
}

function renderClass(ref) {
  let out = `\n### \`class ${ref.name}${typeParamsText(ref.typeParameters)}\``;
  if (ref.extendedTypes?.length) {
    out += `\n\n**Extends** ${ref.extendedTypes.map((t) => `\`${renderType(t)}\``).join(", ")}`;
  }
  out += renderCommentLine(ref.comment);
  const members = (ref.children ?? []).filter(
    (c) => ![KINDS.Signature, KINDS.TypeLiteral].includes(c.kind),
  );
  if (members.length) out += renderMembersTable(members);
  out += "\n---\n";
  return out;
}

function renderTypeAlias(ref) {
  let out = `\n### \`${ref.name}${typeParamsText(ref.typeParameters)}\``;
  out += renderCommentLine(ref.comment);
  const type = renderType(ref.type);
  if (ref.name !== type) out += `\n\`${type}\`\n`;
  out += "\n---\n";
  return out;
}

function renderVariable(ref) {
  let out = `\n### \`${ref.name}\``;
  out += renderCommentLine(ref.comment);
  out += `\n\`${renderType(ref.type)}\`\n`;
  out += "\n---\n";
  return out;
}

function renderEnum(ref) {
  let out = `\n### \`enum ${ref.name}\``;
  out += renderCommentLine(ref.comment);
  const rows = (ref.children ?? []).map(
    (c) => `| \`${c.name}\` | \`${c.defaultValue ?? c.name}\` | ${commentText(c.comment) || "—"} |`,
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

function generateEntry(pkg, entry, tmpJson) {
  const pkgDir = join(repoRoot, "packages", pkg.slug);
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
  return `## ${heading}\n\n> Generated from \`packages/${pkg.slug}/src\` by \`apps/docs/scripts/generate-api-reference.mjs\`. Do not edit by hand — run \`pnpm --filter @theme-kit/docs api:generate\`.\n\n${body}`;
}

function main() {
  mkdirSync(outRoot, { recursive: true });
  let count = 0;
  for (const pkg of PACKAGES) {
    for (const entry of pkg.entries) {
      const tmpJson = join(process.env.TEMP ?? "/tmp", `theme-kit-api-${pkg.slug}-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
      try {
        const md = generateEntry(pkg, entry, tmpJson);
        const outFile = entry.page
          ? join(outRoot, pkg.slug, `${entry.page}.md`)
          : join(outRoot, `${pkg.slug}.md`);
        mkdirSync(dirname(outFile), { recursive: true });
        writeFileSync(outFile, md, "utf8");
        const lines = md.split("\n").length;
        console.log(`generated ${outFile.replace(docsDir, "apps/docs").replace(/\\/g, "/")} (${lines} lines)`);
        count++;
      } catch (err) {
        console.error(`FAILED ${pkg.name}/${entry.page ?? "index"}: ${err.message}`);
        console.error(err.stack);
      }
    }
  }
  console.log(`\nDone. Generated ${count} API reference files.`);
}

main();
