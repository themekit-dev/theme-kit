import { ImageResponse } from "next/og";

/**
 * Shared Open Graph card renderer.
 *
 * Every `opengraph-image.tsx` in the app delegates here so the cards stay
 * visually identical and only the copy differs. Colors are the docs site's own
 * dark theme tokens (`--theme-color-background` / `--theme-color-primary`), so a
 * shared card looks like the site rather than a generic template.
 *
 * `ImageResponse` renders at build time for static routes and on demand for
 * dynamic ones; it needs no font file because Next ships a default.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";
export const OG_ALT =
  "Theme Kit — framework-agnostic theming with semantic tokens";

const BG = "#0b0d1a";
const FG = "#eceeff";
const MUTED = "#9094aa";
const PRIMARY = "#7c6ff0";

export function renderOgCard({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string | undefined;
}): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          // A soft brand wash in the corner, matching the site's accent hue.
          backgroundImage: `radial-gradient(900px 420px at 88% -10%, rgba(124,111,240,0.35), transparent), radial-gradient(700px 380px at 0% 110%, rgba(124,111,240,0.18), transparent)`,
          padding: "72px 80px",
          color: FG,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 6,
              background: PRIMARY,
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 28,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: MUTED,
              display: "flex",
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: title.length > 34 ? 72 : 86,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -2,
              display: "flex",
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                fontSize: 32,
                lineHeight: 1.4,
                color: MUTED,
                maxWidth: 900,
                display: "flex",
              }}
            >
              {description}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 26,
            color: MUTED,
          }}
        >
          <div style={{ display: "flex" }}>Theme Kit</div>
          <div style={{ display: "flex", color: PRIMARY }}>themekit.dev</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
