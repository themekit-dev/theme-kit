import { parseArgs } from "@theme-kit/cli";

/**
 * `parseArgs` is the CLI's own argument parser: it supports `--flag value`,
 * `--flag` (boolean), `-f value` and `-f` (boolean), and collects positional
 * arguments under `_`.
 */
const args = parseArgs([
  "generate",
  "--seed",
  "#d97706",
  "--family",
  "sunset",
  "--json",
]);

console.log("command:", args._[0]);
console.log("parsed args:", args);
