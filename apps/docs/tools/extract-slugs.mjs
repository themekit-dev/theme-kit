import fs from "node:fs";
import path from "node:path";

const dir = "D:/Code/NPM Packages/theme-kit/apps/docs";

// Check frontmatter in content files
const contentDir = path.join(dir, "content");
function walk(d) {
  const out = [];
  for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
    const abs = path.join(d, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs));
    else if (entry.name.endsWith(".md")) out.push(abs);
  }
  return out;
}
const mdFiles = walk(contentDir);
mdFiles.forEach((f) => {
  const rel = path.relative(contentDir, f);
  const raw = fs.readFileSync(f, "utf8");
  const hasFrontmatter = /^---[ \t]*\r?\n/.test(raw);
  console.log((hasFrontmatter ? "FM " : "NO ") + rel);
});
console.log("\n=== SLUGS ===");
const pkgRaw = fs.readFileSync(path.join(dir, "lib/packages.tsx"), "utf8");
const libRaw = fs.readFileSync(path.join(dir, "lib/libraries.tsx"), "utf8");
const fwRaw = fs.readFileSync(path.join(dir, "lib/frameworks.tsx"), "utf8");

function extractSlugs(content) {
  const items = [];
  const regex = /\{\s*slug:\s*"([^"]+)",\s*name:\s*"([^"]+)",/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    items.push({ slug: m[1], name: m[2] });
  }
  return items;
}

function extractSlugsAndTaglines(content) {
  const items = [];
  const regex = /\{\s*slug:\s*"([^"]+)",[\s\S]*?name:\s*"([^"]+)",[\s\S]*?tagline:\s*"([^"]+)",/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    items.push({ slug: m[1], name: m[2], tagline: m[3] });
  }
  return items;
}

console.log("=== PACKAGES ===");
extractSlugsAndTaglines(pkgRaw).forEach((i) => console.log(i.slug, "|", i.name, "|", i.tagline));
console.log("=== LIBRARIES ===");
extractSlugsAndTaglines(libRaw).forEach((i) => console.log(i.slug, "|", i.name, "|", i.tagline));
console.log("=== FRAMEWORKS ===");
extractSlugsAndTaglines(fwRaw).forEach((i) => console.log(i.slug, "|", i.name, "|", i.tagline));

// Blog posts
const blogDir = path.join(dir, "content", "blog");
const blogFiles = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));
console.log("=== BLOG POSTS ===");
blogFiles.forEach((f) => {
  const raw = fs.readFileSync(path.join(blogDir, f), "utf8");
    const fm = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/.exec(raw);
  const meta = {};
  if (fm) {
    fm[1].split(/\r?\n/).forEach((line) => {
      const i = line.indexOf(":");
      if (i !== -1) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
  }
  console.log(f.replace(/\.md$/, "") + " => " + (meta.title || "(no title)") + " [" + (meta.date || "") + "]");
});
