# `theme-kit validate`

## Prerequisites
- Node.js 22+
- Theme file(s) to validate
- Project with @theme-kit/cli installed or npx access

Check a theme file against the Theme Kit schema: required semantic tokens,
theme structure, references, and contrast calculations. It is a CI tool —
run it before commit and in a pipeline, and branch on the exit code.

<!-- cli-command:generated:start -->
## Synopsis

Checks a theme file against the Theme Kit schema, required tokens, references, and contrast calculations.

```text
Usage:
  theme-kit validate <file> [options]
```

## Options

| Option | Description | Default |
| ------ | ----------- | ------- |
| `--file <path>` | Theme file to validate (or pass positionally) | — |

> Generated from `packages/cli/src/cli.ts` — the same text `theme-kit validate --help` prints.
<!-- cli-command:generated:end -->
## Examples

```bash
theme-kit validate theme.json
theme-kit validate themes/berry.json
theme-kit validate themes/
```

The file may be a single theme or a `{ light, dark }` pair; both are validated.

## What it checks

`validate` asserts:

- the root is a theme object (or a light/dark pair),
- **required semantic tokens** are present (e.g. `colors.background`,
  `colors.foreground`, `colors.primary`, …),
- theme structure and inheritance are well-formed,
- token **references** resolve without circular chains,
- **contrast** pairs meet the accessibility floor.

## Output

On success:

```
✓ Theme is valid: indigo-light + indigo-dark
```

On failure, it lists every missing token or issue and exits `3`:

```
✗ Theme is invalid: x
  - Missing token: `colors.background`
  - Missing token: `colors.foreground`
  ...
(validation failed for 1 theme)
```

## Exit codes

| Code | Meaning |
| ---- | ------- |
| `0`  | Theme is valid. |
| `2`  | No theme file supplied (invalid arguments). |
| `3`  | Validation failed (issues are listed). |

Because failure is a real nonzero exit code, `validate` works in any build
tool:

```bash
theme-kit validate themes/ || exit 1
```

## Next Steps
- [Inspect validation output](./inspect)
- [Export as CSS or JSON](./export)
- [CLI reference](./reference)

## Related
- [Theme Kit Quick Start](../quickstart)
- [Custom Themes](../../custom-themes)
- [API Reference](../../api-reference)

Next: [inspect](/cli/inspect).
