# Self-hosted fonts

These webfonts are served from the docs app itself. They replaced a
`next/font/google` setup that downloaded from Google at build/compile time —
when that fetch failed, Next silently substituted a `@font-face` pointing at
`local("Arial")` (in `next dev`) or failed the build outright (in `next build`),
which is why the docs could render entirely in Arial.

| Family | File prefix | Weights | Subsets |
| --- | --- | --- | --- |
| [Geist](https://github.com/vercel/geist-font) | `geist-*` | variable `100 900` | cyrillic-ext, cyrillic, vietnamese, latin-ext, latin |
| [Geist Mono](https://github.com/vercel/geist-font) | `geist-mono-*` | variable `100 900` | cyrillic-ext, cyrillic, symbols2, vietnamese, latin-ext, latin |
| [Outfit](https://github.com/Outfitio/Outfit-Fonts) | `outfit-*` | `600`, `700` | latin-ext, latin |

Outfit's `600` and `700` faces share the same two files, since it is served as a
variable font.

## Do not edit by hand

`../app/fonts.css` and the `.woff2` files are generated together. To change the
font set, edit `FAMILIES` in `../scripts/generate-fonts.mjs` and run, from
`apps/docs`:

```bash
node scripts/generate-fonts.mjs
```

That fetches Google's stylesheet for each family, downloads the `woff2` files
here, and rewrites `../app/fonts.css` with the matching `@font-face` rules
(including `unicode-range`, so subset selection is unchanged). The family stacks
that consume these fonts live in `../app/globals.css`.

## Licensing

Both families are licensed under the **SIL Open Font License 1.1**, which
permits bundling and self-hosting:

- Geist / Geist Mono — `LICENSE-Geist.txt` (Copyright (c) 2023 Vercel, in collaboration with basement.studio)
- Outfit — `LICENSE-Outfit.txt` (Copyright 2021 The Outfit Project Authors)

The license text must remain alongside the font files. If you add a family,
add its license file here too.
