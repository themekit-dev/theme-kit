# `theme-kit validate`

Check a theme file against the Theme Kit schema: required semantic tokens,
theme structure, references, and contrast calculations. It is a CI tool —
run it before commit and in a pipeline, and branch on the exit code.

```
theme-kit validate <file> [options]
```

## Options

| Option      | Description                                              |
| ----------- | -------------------------------------------------------- |
| `--file <path>` | Theme file to validate (or pass positionally). |

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

Next: [inspect](/cli/inspect).