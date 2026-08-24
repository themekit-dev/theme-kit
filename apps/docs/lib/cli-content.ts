import { readFileSync } from "node:fs";
import { join } from "node:path";

const cliDir = join(process.cwd(), "content", "cli");

/**
 * Load a markdown page from the docs/cli content directory. Pages are written
 * in plain markdown and rendered by the shared Markdown component.
 */
export function getCliContent(slug: string): string {
  return readFileSync(join(cliDir, `${slug}.md`), "utf8");
}