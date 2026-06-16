/**
 * Canonical production base URL, used for canonical/og/sitemap/JSON-LD links.
 * Falls back to the known production domain so URLs are never broken
 * ("undefined/...") if EXPO_PUBLIC_SITE_URL is missing from the build env.
 * Trailing slash stripped to avoid "//" in URLs.
 */
export const SITE_URL = (
  process.env.EXPO_PUBLIC_SITE_URL || "https://rebuildr.se"
).replace(/\/$/, "");
