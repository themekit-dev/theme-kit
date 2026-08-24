import { cache } from "react";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Outfit } from "next/font/google";

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
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, docsUrl } from "../lib/site";

import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: "variable",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: "variable",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-outfit",
});

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
  alternates: {
    canonical: docsUrl("/"),
  },
};

const getSearchEntries = cache(buildSearchIndex);

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      lang="en"
      themes={themes}
      defaultTheme="theme-kit-default-light"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable}`}
      transition={transitionConfig}
      scrollbar
      scheduled={scheduleConfig}
    >
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

      {/* pre-paint restore for the docs sidebar */}
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: SIDEBAR_PRE_PAINT_SCRIPT }}
      />
    </ThemeProvider>
  );
}
