import fs from "node:fs";
import path from "node:path";

const filePath = path.resolve(
  "D:/Code/NPM Packages/theme-kit/apps/docs/lib/search.ts",
);

const content = [
'import { readdirSync, readFileSync } from "node:fs";',
'import { join } from "node:path";',
'',
'import { rawPackages } from "./packages";',
'import { rawLibraries } from "./libraries";',
'import { rawFrameworks } from "./frameworks";',
'',
'export type SearchEntry = {',
'  title: string;',
'  route: string;',
'  text: string;',
'  /** Category label shown in search results (e.g. "Package", "Framework"). */',
'  category?: string;',
'};',
'',
'',
].join("\n");

fs.writeFileSync(filePath, content, "utf8");
console.log("Part 1 written:", content.length, "chars");
