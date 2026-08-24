# CI & Automation

The CLI is file-oriented and deterministic: it reads a theme, prints, exits,
and never prompts. That makes it a natural build step.

## Run everywhere

`theme-kit` (installed) or `npx --yes @theme-kit/cli` behaves the same on npm,
pnpm, yarn, bun, cmd, PowerShell, bash, and zsh. Prefer a **project-local
install** in CI so the version is locked and reviewed:

```json
{
  "scripts": {
    "theme:validate": "theme-kit validate themes/"
  }
}
```

## Exit codes make it a gate

`validate` fails with a nonzero exit code, so an invalid theme stops the
pipeline:

| Code | Meaning            |
| ---- | ------------------ |
| `0`  | Success            |
| `1`  | Command/runtime error |
| `2`  | Invalid arguments  |
| `3`  | Validation failed  |

```bash
theme-kit validate themes/
if [ $? -ne 0 ]; then
  echo "theme invalid — rejecting"
  exit 1
fi
```

## GitHub Actions

```yaml
name: Validate Themes

on:
  pull_request:
  push:
    branches: [main]

jobs:
  themes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec theme-kit validate themes/
```

## Automation-friendly behaviours

- **No prompts.** The CLI never asks for input.
- **File writes are explicit.** Only `--output` writes; the default is stdout.
- **Deterministic per project.** A script in `package.json` fixes the version,
  so machines agree.
- **Pre-build step.** Run `theme:generate` before `next build`, `vite build`,
  or a Tailwind pass so `theme.json` / `theme.css` exist first.

Next: [Reference](/cli/reference).