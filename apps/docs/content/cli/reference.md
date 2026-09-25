# CLI reference

## Prerequisites
- Node.js 22+
- @theme-kit/cli installed or available via npx

A compact reference for `theme-kit`. The CLI is file-oriented: it reads a
theme file, prints, and exits. No config files, no daemon.

## Global options

```text
theme-kit <command> [options]

Options:
  -h, --help      Show help ("theme-kit <command> --help" for a command's help)
  -v, --version   Show the installed version
```

<!-- cli-reference:generated:start -->
> Generated from `packages/cli/src/cli.ts` and `packages/cli/src/exit-codes.ts` by `apps/docs/scripts/generate-cli-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs cli:generate`.

## Commands

| Command | Usage | Options |
| ------- | ----- | ------- |
| `generate` | `theme-kit generate [options]` | `--seed`, `--family`, `--mode`, `--code`, `--output` |
| `validate` | `theme-kit validate <file> [options]` | `--file` |
| `migrate` | `theme-kit migrate <file> [options]` | `--file`, `--output` |
| `inspect` | `theme-kit inspect <file> [options]` | `--file` |
| `export` | `theme-kit export <file> [options]` | `--file`, `--format`, `--output` |

Every command accepts the theme as a positional path instead of `--file`, and accepts either a single theme or a `{ light, dark }` pair.

### Options per command

The blocks below are the exact output of `theme-kit <command> --help`.

#### `theme-kit generate`

Derives a complete light + dark pair (or a single theme) from one seed color.

```text
Generate a Theme

Derives a complete light + dark pair (or a single theme) from one seed color.

Usage:
  theme-kit generate [options]

Options:
  --seed <color>       Source hex color (#rrggbb)    [default #6366f1]
  --family <name>      Family name for the theme name [default "default"]
  --mode <mode>        light | dark | both             [default both]
  --code               Also generate a tokens.code syntax palette (opt-in)
  --output <file>      Write JSON to a file instead of stdout
```

#### `theme-kit validate`

Checks a theme file against the Theme Kit schema, required tokens, references, and contrast calculations.

```text
Validate a Theme

Checks a theme file against the Theme Kit schema, required tokens, references,
and contrast calculations.

Usage:
  theme-kit validate <file> [options]

Options:
  --file <path>        Theme file to validate (or pass positionally)

Exit codes:
  0   theme is valid
  3   validation failed (issues are listed)
```

#### `theme-kit migrate`

Migrates a legacy theme file to the current Theme Kit format.

```text
Migrate a Theme

Migrates a legacy theme file to the current Theme Kit format.

Usage:
  theme-kit migrate <file> [options]

Options:
  --file <path>        Legacy theme file to migrate (or pass positionally)
  --output <file>      Write the migrated theme to a file
```

#### `theme-kit inspect`

Prints a human-readable summary of a theme's meta, token groups, and references.

```text
Inspect a Theme

Prints a human-readable summary of a theme's meta, token groups, and references.

Usage:
  theme-kit inspect <file> [options]

Options:
  --file <path>        Theme file to inspect (or pass positionally)
```

#### `theme-kit export`

Exports theme tokens to CSS variables or a flat JSON map.

```text
Export a Theme

Exports theme tokens to CSS variables or a flat JSON map.

Usage:
  theme-kit export <file> [options]

Options:
  --file <path>        Theme file to export (or pass positionally)
  --format <fmt>       css | json                        [default css]
  --output <file>      Write the export to a file instead of stdout
```

## Exit codes

| Code | Constant | Meaning |
| ---- | -------- | ------- |
| `0` | `ExitCodes.OK` | Command completed successfully. |
| `1` | `ExitCodes.Error` | A runtime or command error occurred. |
| `2` | `ExitCodes.Usage` | Invalid arguments / usage error. |
| `3` | `ExitCodes.ValidationFailed` | A theme failed validation (the `validate` command). |

CI and editors can switch on these without parsing stdout. The per-command exit codes listed above are the subset each command can actually return.
<!-- cli-reference:generated:end -->

## Output formats

- **`export --format css`** — `--theme-*` custom properties. A pair emits
  `:root` for light and `.dark, [data-theme="dark"]` for dark.
- **`export --format json`** — the flat `--theme-*` variable map as JSON.
- **`generate`** — pretty-printed theme JSON (a pair by default).

## Environment & non-interactive mode

The CLI never prompts, always respects `--output` for file writes, never
overwrites without being told to, and prints plain text. It has no
environment-variable knobs; behavior is fully driven by arguments.

## Troubleshooting

### `theme-kit: command not found`

The global npm/pnpm `bin` directory isn't on your PATH, or the package is not
installed globally.

```bash
# npm: confirm the install (`-g` is npm's global flag)
npm list -g @theme-kit/cli
npm prefix -g

# or just use npx (no global install)
npx --yes @theme-kit/cli --help
```

Alternatively, install it per project (see [Installation](/cli/installation)).

### Cannot find theme file

```text
Error: cannot read file path
```

Pass a readable path, or as a positional value after the command:
`theme-kit inspect themes/mint.json`.

### Invalid theme

When `validate` reports missing tokens, add the required semantic token set
(e.g. `colors.background`) and re-run. A theme tree whose structure is wrong
(token groups under `tokens`) is reported the same way.

### Unknown command

```text
Unknown command: <name>
```

Run `theme-kit --help` for the list, or `theme-kit <command> --help`.

### Node version

The CLI needs **Node.js 22+**. Running an older Node surfaces a loader error.

## Next Steps

- [Run the CLI in CI](/cli/ci) — exit codes as a gate.
- [View individual command options](/cli/generate) — generate, validate, inspect, migrate, export.
- [Explore workflow patterns](/cli/workflows) — authoring loop, light/dark pairs.

## Related

- [CLI API reference](/api-reference/cli)
- [Theme files & ThemeDefinition](/core-concepts)