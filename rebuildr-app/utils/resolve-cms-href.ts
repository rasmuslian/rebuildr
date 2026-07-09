import { Href } from "expo-router";

const OWN_HOSTNAME = "rebuildr.se";

/**
 * CMS-entered links (footer entries, banners) are free-text and inconsistently
 * formatted — sometimes missing a protocol, sometimes an absolute rebuildr.se
 * URL that should navigate internally instead of forcing a full page load.
 * This normalizes both cases into a proper expo-router Href.
 */
export const resolveCmsHref = (url?: string | null): Href => {
  if (!url || url.startsWith("/")) {
    return url as Href;
  }

  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;

  try {
    const parsed = new URL(withProtocol);
    if (parsed.hostname.replace(/^www\./, "") === OWN_HOSTNAME) {
      return (parsed.pathname + parsed.search + parsed.hash) as Href;
    }
    return withProtocol as Href;
  } catch {
    return withProtocol as Href;
  }
};
