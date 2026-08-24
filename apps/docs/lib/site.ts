/**
 * Central site configuration — the single source of truth for every URL the
 * docs app renders. Never hardcode `github.com/...`, `npmjs.com/...`, or the
 * site URL in components; import from here instead.
 *
 * After the first Vercel deployment, set:
 *   NEXT_PUBLIC_SITE_URL=https://<your-project>.vercel.app
 * in the Vercel project settings (Environment Variables). When you later own
 * themekit.dev, change the default below (or the env var) — nothing else.
 */

const GH_ORG = "themekit-dev";
const GH_REPO = "theme-kit";
export const GITHUB_URL = `https://github.com/${GH_ORG}/${GH_REPO}`;
export const GITHUB_SOURCE = `${GITHUB_URL}/blob/main`;
export const GITHUB_SECURITY = `${GITHUB_URL}/security/advisories`;
export const GITHUB_LICENSE = `${GITHUB_URL}/blob/main/LICENSE`;

export const NPM_ORG_URL = "https://www.npmjs.com/org/theme-kit";
export const npmPackageUrl = (pkg: string) =>
  `https://www.npmjs.com/package/${pkg}`;

const ADAPTER_PACKAGES = new Set([
  "shadcn",
  "mui",
  "chakra",
  "antd",
  "bootstrap",
  "daisyui",
  "open-props",
  "unocss",
]);

/** Repository directory for a package (e.g. "@theme-kit/shadcn" → "packages/adapters/shadcn"). */
export function repoPathForPackage(pkg: string): string {
  const name = pkg.replace("@theme-kit/", "");
  if (name === "adapters") return "packages/adapters/shared";
  if (ADAPTER_PACKAGES.has(name)) return `packages/adapters/${name}`;
  return `packages/${name}`;
}

/** GitHub "tree/main" link for a package's source directory. */
export function sourceUrlForPackage(pkg: string): string {
  return `${GITHUB_URL}/tree/main/${repoPathForPackage(pkg)}`;
}

export const CONTACT_EMAIL = "thememkproductions@gmail.com";
export const CONTACT_URL = `mailto:${CONTACT_EMAIL}`;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://theme-kit-docs.vercel.app";

export const SITE_NAME = "Theme Kit";
export const SITE_DESCRIPTION =
  "A powerful, framework-agnostic theming library with theme families, semantic tokens, and a runtime that works everywhere.";

/** Canonical absolute URL for a docs path (e.g. `/get-started`). */
export function docsUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
