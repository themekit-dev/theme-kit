/**
 * The result of parsing command-line arguments.
 *
 * Positional arguments are collected in `_`; flags and their values are stored
 * under their key (with or without leading dashes).
 */
export interface ParsedArgs {
  /** Positional (non-flag) arguments in order. */
  _: string[];
  [key: string]: any;
}

/**
 * Parses an array of command-line arguments into a {@link ParsedArgs} object.
 *
 * Supports `--flag value`, `--flag` (boolean), `-f value`, and `-f` (boolean)
 * forms. Repeated flags accumulate into an array. Positional arguments are
 * collected under `_`.
 *
 * @param argv The raw argument array (for example `process.argv.slice(2)`).
 * @returns The parsed arguments.
 *
 * @see {@link UsageError}
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = { _: [] };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;

    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];

      if (next !== undefined && !next.startsWith("-")) {
        const existing = result[key];
        if (Array.isArray(existing)) {
          existing.push(next);
        } else if (existing !== undefined) {
          result[key] = [existing, next];
        } else {
          result[key] = next;
        }
        i++;
      } else {
        result[key] = true;
      }
    } else if (arg.startsWith("-") && arg.length === 2) {
      const key = arg.slice(1);
      const next = argv[i + 1];

      if (next !== undefined && !next.startsWith("-")) {
        result[key] = next;
        i++;
      } else {
        result[key] = true;
      }
    } else {
      result._.push(arg);
    }
  }

  return result;
}

export function getString(args: ParsedArgs, key: string, fallback?: string): string | undefined {
  const val = args[key];
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val[0] as string | undefined;
  return fallback;
}