import type { PaletteColor, PaletteColorOptions } from "@mui/material/styles";

declare module "@mui/material/styles/createPalette" {
  interface Palette {
    accent: PaletteColor;
    neutral: PaletteColor;
  }
  interface PaletteOptions {
    accent?: Partial<PaletteColorOptions>;
    neutral?: Partial<PaletteColorOptions>;
  }
}