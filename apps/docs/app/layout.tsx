import { cache } from "react";
import type { ReactNode } from "react";

import { type Metadata } from "next";

import { ThemeProvider, ThemeScrollbar } from "@theme-kit/next";

import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { SiteToolbar } from "../components/site-toolbar";
import { SearchProvider } from "../components/search-dialog";
import { SkipToContent } from "../components/ui/skip-to-content";
import ScrollToTop from "../components/ui/scroll-to-top";
import { buildSearchIndex } from "../lib/search";
import { SIDEBAR_PRE_PAINT_SCRIPT } from "../lib/sidebar-scroll";

import {
  themes,
  scrollbarConfig,
  scheduleConfig,
  transitionConfig,
} from "./theme/theme-config";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "../lib/site";

import "./globals.css";
import "./fonts.css";

const FONT_PRELOADS = [
  "/fonts/geist-latin.woff2",
  "/fonts/geist-mono-latin.woff2",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

const getSearchEntries = cache(buildSearchIndex);

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      lang="en"
      themes={themes}
      defaultTheme="theme-kit-default-light"
      transition={transitionConfig}
      scrollbar
      scheduled={scheduleConfig}
    >
      {FONT_PRELOADS.map((href) => (
        <link
          key={href}
          rel="preload"
          href={href}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      ))}

      <ThemeScrollbar {...scrollbarConfig} />

      <SearchProvider entries={getSearchEntries()}>
        <SkipToContent targetId="main" />
        <SiteHeader />

        <main
          id="main"
          tabIndex={-1}
          className="flex-1 pt-(--site-header-height) scroll-mt-(--site-header-height) outline-none"
        >
          {children}
          <ScrollToTop />
        </main>

        <SiteFooter />
      </SearchProvider>

      <SiteToolbar />

      {/* Pre-paint positioning for the docs rail. */}
      <script dangerouslySetInnerHTML={{ __html: SIDEBAR_PRE_PAINT_SCRIPT }} />
    </ThemeProvider>
  );
}
