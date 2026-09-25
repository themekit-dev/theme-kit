## @theme-kit/mantine
Theme Kit Mantine integration.

Provides `MantineThemeProvider` (bridges a Theme Kit runtime to Mantine's
theme) and the `buildMantineTheme` helper.

> Generated from `packages/mantine/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `createMantineTheme(source): { activeClassName?: string; autoContrast?: boolean; black?: string; breakpoints?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; colors?: { blue?: MantineColorsTuple; cyan?: MantineColorsTuple; dark?: MantineColorsTuple; grape?: MantineColorsTuple; gray?: MantineColorsTuple; green?: MantineColorsTuple; indigo?: MantineColorsTuple; lime?: MantineColorsTuple; orange?: MantineColorsTuple; pink?: MantineColorsTuple; red?: MantineColorsTuple; teal?: MantineColorsTuple; violet?: MantineColorsTuple; yellow?: MantineColorsTuple } { [key: string & object]: MantineColorsTuple | undefined }; components?: { [key: string]: { classNames?: any; defaultProps?: any; styles?: any; vars?: any } | undefined }; cursorType?: "default" | "pointer"; defaultGradient?: { deg?: number; from?: string; to?: string }; defaultRadius?: MantineRadius; focusClassName?: string; focusRing?: "auto" | "always" | "never"; fontFamily?: string; fontFamilyMonospace?: string; fontSizes?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; fontSmoothing?: boolean; headings?: { fontFamily?: string; fontWeight?: string; sizes?: { h1?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h2?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h3?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h4?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h5?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h6?: { fontSize?: string; fontWeight?: string; lineHeight?: string } }; textWrap?: "wrap" | "nowrap" | "balance" | "pretty" | "stable" }; lineHeights?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; luminanceThreshold?: number; other?: { [key: string]: any }; primaryColor?: string; primaryShade?: MantineColorShade | { dark?: MantineColorShade | undefined; light?: MantineColorShade | undefined }; radius?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; respectReducedMotion?: boolean; scale?: number; shadows?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; spacing?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: number]: string | undefined } { [key: string & object]: string | undefined }; variantColorResolver?: VariantColorsResolver; white?: string }`
Maps Theme Kit semantic tokens onto a Mantine theme.

```ts
import { createMantineTheme } from "@theme-kit/mantine";
const mantineTheme = createMantineTheme(runtime);
```

**See also:** `MantineThemeProvider`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `source` | `AdapterSource` | — |

**Returns** `{ activeClassName?: string; autoContrast?: boolean; black?: string; breakpoints?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; colors?: { blue?: MantineColorsTuple; cyan?: MantineColorsTuple; dark?: MantineColorsTuple; grape?: MantineColorsTuple; gray?: MantineColorsTuple; green?: MantineColorsTuple; indigo?: MantineColorsTuple; lime?: MantineColorsTuple; orange?: MantineColorsTuple; pink?: MantineColorsTuple; red?: MantineColorsTuple; teal?: MantineColorsTuple; violet?: MantineColorsTuple; yellow?: MantineColorsTuple } { [key: string & object]: MantineColorsTuple | undefined }; components?: { [key: string]: { classNames?: any; defaultProps?: any; styles?: any; vars?: any } | undefined }; cursorType?: "default" | "pointer"; defaultGradient?: { deg?: number; from?: string; to?: string }; defaultRadius?: MantineRadius; focusClassName?: string; focusRing?: "auto" | "always" | "never"; fontFamily?: string; fontFamilyMonospace?: string; fontSizes?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; fontSmoothing?: boolean; headings?: { fontFamily?: string; fontWeight?: string; sizes?: { h1?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h2?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h3?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h4?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h5?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h6?: { fontSize?: string; fontWeight?: string; lineHeight?: string } }; textWrap?: "wrap" | "nowrap" | "balance" | "pretty" | "stable" }; lineHeights?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; luminanceThreshold?: number; other?: { [key: string]: any }; primaryColor?: string; primaryShade?: MantineColorShade | { dark?: MantineColorShade | undefined; light?: MantineColorShade | undefined }; radius?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; respectReducedMotion?: boolean; scale?: number; shadows?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; spacing?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: number]: string | undefined } { [key: string & object]: string | undefined }; variantColorResolver?: VariantColorsResolver; white?: string }`

---


### `MantineThemeProvider<T extends ThemeDefinition<string>>(__namedParameters): Element`
`<MantineThemeProvider runtime={runtime}>` — wraps Mantine's own
`MantineProvider` with a theme derived from Theme Kit's semantic tokens.
The Mantine color scheme is forced to match the active Theme Kit mode so
Mantine's built-in dark styles stay in sync.

The provider owns the derived Mantine theme: it subscribes to the runtime
and rebuilds the theme whenever the active theme changes, so the wrapped
subtree always renders with the current theme selection.

**See also:** `createMantineTheme`

**Returns** `Element`

```ts
import { MantineThemeProvider } from "@theme-kit/mantine";

<MantineThemeProvider runtime={runtime}>
  <App />
</MantineThemeProvider>
```

---


### `useMantineTheme<T extends ThemeDefinition<string>>(runtime): { activeClassName?: string; autoContrast?: boolean; black?: string; breakpoints?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; colors?: { blue?: MantineColorsTuple; cyan?: MantineColorsTuple; dark?: MantineColorsTuple; grape?: MantineColorsTuple; gray?: MantineColorsTuple; green?: MantineColorsTuple; indigo?: MantineColorsTuple; lime?: MantineColorsTuple; orange?: MantineColorsTuple; pink?: MantineColorsTuple; red?: MantineColorsTuple; teal?: MantineColorsTuple; violet?: MantineColorsTuple; yellow?: MantineColorsTuple } { [key: string & object]: MantineColorsTuple | undefined }; components?: { [key: string]: { classNames?: any; defaultProps?: any; styles?: any; vars?: any } | undefined }; cursorType?: "default" | "pointer"; defaultGradient?: { deg?: number; from?: string; to?: string }; defaultRadius?: MantineRadius; focusClassName?: string; focusRing?: "auto" | "always" | "never"; fontFamily?: string; fontFamilyMonospace?: string; fontSizes?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; fontSmoothing?: boolean; headings?: { fontFamily?: string; fontWeight?: string; sizes?: { h1?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h2?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h3?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h4?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h5?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h6?: { fontSize?: string; fontWeight?: string; lineHeight?: string } }; textWrap?: "wrap" | "nowrap" | "balance" | "pretty" | "stable" }; lineHeights?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; luminanceThreshold?: number; other?: { [key: string]: any }; primaryColor?: string; primaryShade?: MantineColorShade | { dark?: MantineColorShade | undefined; light?: MantineColorShade | undefined }; radius?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; respectReducedMotion?: boolean; scale?: number; shadows?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; spacing?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: number]: string | undefined } { [key: string & object]: string | undefined }; variantColorResolver?: VariantColorsResolver; white?: string }`
Subscribes to a Theme Kit runtime and returns a Mantine theme that is rebuilt
automatically whenever the active theme changes.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `runtime` | `ThemeRuntime<T>` | — |

**Returns** `{ activeClassName?: string; autoContrast?: boolean; black?: string; breakpoints?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; colors?: { blue?: MantineColorsTuple; cyan?: MantineColorsTuple; dark?: MantineColorsTuple; grape?: MantineColorsTuple; gray?: MantineColorsTuple; green?: MantineColorsTuple; indigo?: MantineColorsTuple; lime?: MantineColorsTuple; orange?: MantineColorsTuple; pink?: MantineColorsTuple; red?: MantineColorsTuple; teal?: MantineColorsTuple; violet?: MantineColorsTuple; yellow?: MantineColorsTuple } { [key: string & object]: MantineColorsTuple | undefined }; components?: { [key: string]: { classNames?: any; defaultProps?: any; styles?: any; vars?: any } | undefined }; cursorType?: "default" | "pointer"; defaultGradient?: { deg?: number; from?: string; to?: string }; defaultRadius?: MantineRadius; focusClassName?: string; focusRing?: "auto" | "always" | "never"; fontFamily?: string; fontFamilyMonospace?: string; fontSizes?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; fontSmoothing?: boolean; headings?: { fontFamily?: string; fontWeight?: string; sizes?: { h1?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h2?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h3?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h4?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h5?: { fontSize?: string; fontWeight?: string; lineHeight?: string }; h6?: { fontSize?: string; fontWeight?: string; lineHeight?: string } }; textWrap?: "wrap" | "nowrap" | "balance" | "pretty" | "stable" }; lineHeights?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; luminanceThreshold?: number; other?: { [key: string]: any }; primaryColor?: string; primaryShade?: MantineColorShade | { dark?: MantineColorShade | undefined; light?: MantineColorShade | undefined }; radius?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; respectReducedMotion?: boolean; scale?: number; shadows?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: string & object]: string | undefined }; spacing?: { lg?: string; md?: string; sm?: string; xl?: string; xs?: string } { [key: number]: string | undefined } { [key: string & object]: string | undefined }; variantColorResolver?: VariantColorsResolver; white?: string }`

---

## Interfaces

### `MantineThemeProviderProps<T extends ThemeDefinition>`
Props for MantineThemeProvider.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `children` | `ReactNode` | The React subtree rendered inside Mantine's `MantineProvider`. |
| `runtime` | `ThemeRuntime<T>` | The Theme Kit runtime whose active theme drives the Mantine theme. |

---

## Related docs

- [Mantine](/libraries/mantine) — the adapter integration
