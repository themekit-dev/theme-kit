/**
 * Cookie contract shared between the server resolver, the client persistence
 * adapter and the blocking bootstrap script. Same names as `@theme-kit/next`:
 *
 *   theme-name       → exact resolved theme
 *   theme-family     → selected family
 *   theme-mode       → selected mode (light | dark | system)
 *   theme-fingerprint→ theme-config fingerprint (stale cookies are rejected)
 */
export const themeKitCookieNames = {
  name: "theme-name",
  family: "theme-family",
  mode: "theme-mode",
  fingerprint: "theme-fingerprint",
} as const;

export type ThemeKitCookieName =
  (typeof themeKitCookieNames)[keyof typeof themeKitCookieNames];

export interface ParsedCookies {
  [name: string]: string | undefined;
}

/** Minimal RFC 6265 header parser — enough for the four theme cookies. */
export function parseCookieHeader(header: string): ParsedCookies {
  const cookies: ParsedCookies = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (!name) continue;
    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
  }
  return cookies;
}

/** Serialize a cookie value for `document.cookie` / `Set-Cookie`. */
export function encodeCookieValue(value: string): string {
  return encodeURIComponent(value);
}