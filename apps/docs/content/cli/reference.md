# CLI reference

A compact reference for `theme-kit`. The CLI is file-oriented: it reads a
theme file, prints, and exits. No config files, no daemon.

## Global options

```text
theme-kit <command> [options]

Options:
  -h, --help      Show help ("theme-kit <command> --help" for a command's help)
  -v, --version   Show the installed version
```

## Commands

| Command    | Usage                                             | Options |
| ---------- | ------------------------------------------------- | ------- |
| `generate` | `theme-kit generate` | `--seed`, `--family`, `--mode`, `--output` |
| `validate` | `theme-kit validate <file>` | `--file` |
| `inspect`  | `theme-kit inspect <file>` | `--file` |
| `migrate`  | `theme-kit migrate <file>` | `--file`, `--output` |
| `export`   | `theme-kit export <file>` | `--file`, `--format`, `--output` |

All of `validate`, `inspect`, `migrate`, and `export` accept the theme as a
positional path instead of `--file`. Every command accepts a single theme or a
`{ light, dark }` pair.

## Exit codes

| Code    | Meaning |
| ------- | ------- |
| `0`     | Success |
| `1`     | Command or runtime error |
| `2`     | Invalid arguments / usage error |
| `3`     | Validation failed (the `validate` command) |

CI and editors can switch on these without parsing stdout.

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

## Related

- [CLI API reference](/api-reference/cli)
- [Theme files & ThemeDefinition](/core-concepts)