import { readFileSync } from "node:fs";
import { join } from "node:path";

const contentDir = join(process.cwd(), "content");

export function getContent(slug: string): string {
  return readFileSync(join(contentDir, `${slug}.md`), "utf8");
}
