#!/usr/bin/env node
/**
 * Generate the drift-prone tables in `content/cli/reference.md` from the CLI's
 * own source of truth.
 *
 * `packages/cli/src/cli.ts` already owns the command list, each command's usage
 * and its options (that is what `--help` prints), and `exit-codes.ts` owns the
 * exit codes. The reference page duplicated both by hand — and had already
 * drifted: the CLI documents `generate --code`, the docs table did not list it.
 *
 * Only the marked regions are generated; the surrounding prose is hand-written
 * and left alone.
 *
 *   node scripts/generate-cli-reference.mjs           # write
 *   node scripts/generate-cli-reference.mjs --check   # verify (CI gate)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");
const CLI_DIR = join(repoRoot, "packages", "cli", "src");
const REFERENCE = join(here, "..", "content", "cli", "reference.md");

const START = "<!-- cli-reference:generated:start -->";
const END = "<!-- cli-reference:generated:end -->";

/** Read a template literal starting at the backtick; tolerates escaped backticks. */
function readTemplate(src, start) {
  let out = "";
  let i = start + 1;
  while (i < src.length) {
    if (src[i] === "\\") {
      out += src[i + 1];
      i += 2;
      continue;
    }
    if (src[i] === "`") return [out, i];
    out += src[i];
    i++;
  }
  return [out, i];
}

/** Parse `commandHelp` out of cli.ts into an ordered list of command specs. */
function parseCommandHelp(src) {
  const anchor = src.indexOf("const commandHelp");
  if (anchor === -1) throw new Error("commandHelp not found in cli.ts");
  const open = src.indexOf("{", anchor);
  const body = src.slice(open + 1);

  const commands = [];
  const keyRe = /(\w+):\s*`/g;
  let m;
  while ((m = keyRe.exec(body))) {
    const [text] = readTemplate(body, m.index + m[0].length - 1);
    const lines = text.split("\n");

    const titleIdx = lines.findIndex((l) => l.trim());
    const title = titleIdx === -1 ? m[1] : lines[titleIdx].trim();

    const idx = (label) => lines.findIndex((l) => l.trim() === label);
    const usageIdx = idx("Usage:");
    const optionsIdx = idx("Options:");
    const exitIdx = idx("Exit codes:");

    // The paragraph between the title and `Usage:` — the title itself is
    // already the heading, so it must not be folded into the summary.
    const summary = lines
      .slice(titleIdx + 1, usageIdx === -1 ? lines.length : usageIdx)
      .map((l) => l.trim())
      .filter(Boolean)
      .join(" ");

    const section = (from) => {
      if (from === -1) return [];
      const out = [];
      for (let i = from + 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) break;
        out.push(line);
      }
      return out;
    };

    const usage = section(usageIdx)
      .map((l) => l.trim())
      .join(" ");

    const options = section(optionsIdx)
      .map((l) => l.replace(/\s+$/, ""))
      .filter(Boolean)
      .map((l) => {
        const mm = /^\s*(--?[^\s]+(?:\s+<[^>]+>)?)\s{2,}(.*)$/.exec(l);
        if (!mm) return { flag: l.trim(), description: "" };
        const desc = mm[2].trim();
        const def = /\[default\s+([^\]]+)\]\s*$/.exec(desc);
        return {
          flag: mm[1].trim(),
          description: def ? desc.replace(/\s*\[default[^\]]+\]\s*$/, "").trim() : desc,
          default: def ? def[1] : null,
        };
      });

    const exitCodes = section(exitIdx)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const mm = /^(\d+)\s+(.*)$/.exec(l);
        return mm ? { code: mm[1], meaning: mm[2].trim() } : { code: "", meaning: l };
      });

    commands.push({
      name: m[1],
      title,
      summary,
      usage,
      options,
      exitCodes,
      // The exact text `theme-kit <cmd> --help` prints. Emitted verbatim so the
      // page cannot re-flow or re-align the CLI's own output.
      rawHelp: text.replace(/^\n+/, "").replace(/\s+$/, ""),
    });
  }
  return commands;
}

/** Parse the ExitCodes frozen object, keeping each entry's JSDoc. */
function parseExitCodes(src) {
  const anchor = src.indexOf("export const ExitCodes");
  if (anchor === -1) throw new Error("ExitCodes not found in exit-codes.ts");
  const body = src.slice(anchor);

  const out = [];
  const re = /\/\*\*\s*([\s\S]*?)\*\/\s*(\w+):\s*(\d+)/g;
  let m;
  while ((m = re.exec(body))) {
    const doc = m[1]
      .split("\n")
      .map((l) => l.replace(/^\s*\*?\s?/, "").trim())
      .filter(Boolean)
      .join(" ");
    out.push({ name: m[2], code: m[3], meaning: doc });
  }
  return out;
}

function render(commands, exitCodes) {
  const lines = [];

  lines.push("## Commands");
  lines.push("");
  lines.push("| Command | Usage | Options |");
  lines.push("| ------- | ----- | ------- |");
  for (const c of commands) {
    const opts = c.options
      .map((o) => `\`${o.flag.split(" ")[0]}\``)
      .join(", ");
    lines.push(`| \`${c.name}\` | \`${c.usage}\` | ${opts} |`);
  }
  lines.push("");
  lines.push(
    "Every command accepts the theme as a positional path instead of `--file`, " +
      "and accepts either a single theme or a `{ light, dark }` pair.",
  );

  lines.push("");
  lines.push("### Options per command");
  lines.push("");
  lines.push(
    "The blocks below are the exact output of `theme-kit <command> --help`.",
  );
  lines.push("");
  for (const c of commands) {
    lines.push(`#### \`theme-kit ${c.name}\``);
    lines.push("");
    lines.push(c.summary);
    lines.push("");
    lines.push("```text");
    lines.push(c.rawHelp);
    lines.push("```");
    lines.push("");
  }

  lines.push("## Exit codes");
  lines.push("");
  lines.push("| Code | Constant | Meaning |");
  lines.push("| ---- | -------- | ------- |");
  for (const e of exitCodes) {
    lines.push(`| \`${e.code}\` | \`ExitCodes.${e.name}\` | ${e.meaning} |`);
  }
  lines.push("");
  lines.push(
    "CI and editors can switch on these without parsing stdout. The per-command " +
      "exit codes listed above are the subset each command can actually return.",
  );

  return lines.join("\n");
}

function main() {
  const check = process.argv.includes("--check");

  const cliSrc = readFileSync(join(CLI_DIR, "cli.ts"), "utf8");
  const exitSrc = readFileSync(join(CLI_DIR, "exit-codes.ts"), "utf8");

  const commands = parseCommandHelp(cliSrc);
  const exitCodes = parseExitCodes(exitSrc);

  if (commands.length === 0) throw new Error("parsed 0 commands — parser is broken");

  const outputs = [];

  // 1. the reference page's tables
  const generated = `${START}\n> Generated from \`packages/cli/src/cli.ts\` and \`packages/cli/src/exit-codes.ts\` by \`apps/docs/scripts/generate-cli-reference.mjs\`. Do not edit by hand — run \`pnpm --filter @theme-kit/docs cli:generate\`.\n\n${render(commands, exitCodes)}\n${END}`;
  outputs.push(splice(REFERENCE, START, END, generated, "content/cli/reference.md"));

  // 2. a Synopsis block on each command page, so every page carries the same
  //    generated section and no page can document different options.
  for (const c of commands) {
    const page = join(here, "..", "content", "cli", `${c.name}.md`);
    let text;
    try {
      text = readFileSync(page, "utf8");
    } catch {
      continue; // no dedicated page for this command
    }

    const start = "<!-- cli-command:generated:start -->";
    const end = "<!-- cli-command:generated:end -->";

    const table = [
      "| Option | Description | Default |",
      "| ------ | ----------- | ------- |",
      ...c.options.map((o) => {
        const flag = o.flag.replace(/\|/g, "\\|");
        const desc = o.description.replace(/\|/g, "\\|");
        const def = o.default ? `\`${o.default}\`` : "—";
        return `| \`${flag}\` | ${desc} | ${def} |`;
      }),
    ].join("\n");

    const block = [
      start,
      "## Synopsis",
      "",
      c.summary,
      "",
      "```text",
      `Usage:`,
      `  ${c.usage}`,
      "```",
      "",
      "## Options",
      "",
      table,
      "",
      `> Generated from \`packages/cli/src/cli.ts\` — the same text \`theme-kit ${c.name} --help\` prints.`,
      end,
    ].join("\n");

    if (text.includes(start)) {
      outputs.push(splice(page, start, end, block, `content/cli/${c.name}.md`));
    } else {
      // First run: place it directly after the page's Prerequisites section.
      const idx = text.indexOf("\n## ", text.indexOf("\n## Prerequisites"));
      const insertAt = idx === -1 ? text.length : idx + 1;
      const next = `${text.slice(0, insertAt)}${block}\n\n${text.slice(insertAt)}`;
      outputs.push({ path: page, label: `content/cli/${c.name}.md`, next, current: text });
    }
  }

  const changed = outputs.filter((o) => o.next !== o.current);

  if (check) {
    if (changed.length > 0) {
      console.error("CLI reference is out of date:");
      for (const o of changed) console.error(`  ${o.label}`);
      console.error("Run: pnpm --filter @theme-kit/docs cli:generate");
      process.exit(1);
    }
    console.log(
      `CLI docs in sync (${commands.length} commands, ${exitCodes.length} exit codes, ${outputs.length} files).`,
    );
    return;
  }

  for (const o of changed) writeFileSync(o.path, o.next);
  console.log(
    changed.length === 0
      ? `CLI docs already up to date (${outputs.length} files).`
      : `Regenerated ${changed.length} file(s):\n` +
          changed.map((o) => `  ${o.label}`).join("\n"),
  );
}

/** Replace the region between two markers. */
function splice(file, start, end, block, label) {
  const current = readFileSync(file, "utf8");
  const a = current.indexOf(start);
  const b = current.indexOf(end);
  if (a === -1 || b === -1) {
    throw new Error(`markers not found in ${label} — expected ${start} … ${end}`);
  }
  return {
    path: file,
    label,
    current,
    next: current.slice(0, a) + block + current.slice(b + end.length),
  };
}

main();
