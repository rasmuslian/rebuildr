/**
 * schema.org JSON-LD builders. Kept framework-agnostic (plain objects) so they
 * can be passed to RebuildrHead's `jsonLd` prop and rendered server-side.
 */

import { SITE_URL } from "./site-url";

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: "RebuildR",
  url: SITE_URL,
  logo: `${SITE_URL}/images/og-image.png`,
  description:
    "RebuildR är en digital marknadsplats och en rörelse för återbrukat byggmaterial.",
  sameAs: [
    "https://www.instagram.com/rebuildr.se",
    "https://www.linkedin.com/company/rebuildrnordics",
    "https://rebuildr.substack.com/archive",
  ],
};

export const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "RebuildR",
  inLanguage: "sv-SE",
  publisher: { "@id": ORGANIZATION_ID },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?query={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export function articleSchema(args: {
  title: string;
  description: string;
  slug: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.title,
    description: args.description,
    image: args.image ?? `${SITE_URL}/images/og-image.png`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/article/${args.slug}`,
    },
    inLanguage: "sv-SE",
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    ...(args.datePublished ? { datePublished: args.datePublished } : {}),
    ...(args.dateModified ? { dateModified: args.dateModified } : {}),
  };
}
