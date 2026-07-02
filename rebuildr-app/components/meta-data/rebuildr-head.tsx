import React from "react";
import Head from "expo-router/head";
import { usePathname } from "expo-router";
import { Platform } from "react-native";
import { SITE_URL } from "@/lib/site-url";

type Props = {
  title?: string;
  image?: string;
  description?: string;

  isProductPage?: boolean;
  /** Open Graph type — "website" (default) or "article" for article pages. */
  ogType?: "website" | "article";
  /**
   * Extra JSON-LD structured data (schema.org) to inject. Pass a single object
   * or an array; each is rendered as its own <script type="application/ld+json">.
   */
  jsonLd?: object | object[];
  /** Emit <meta name="robots" content="noindex"> (e.g. 404 / thin pages). */
  noindex?: boolean;
};

export default function RebuildrHead({
  title = "En digital marknadsplats för återbrukat byggmaterial",
  image,
  description = "RebuildR är en digital marknadsplats och en rörelse för återbrukat byggmaterial.",
  isProductPage = false,
  ogType = "website",
  jsonLd,
  noindex = false,
}: Props) {
  const pathName = usePathname();
  const siteUrl = SITE_URL;
  const url = siteUrl + pathName;

  const defaultImage = siteUrl + "/images/og-image.png";

  const extraJsonLd = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  // Structured data for google
  const googleProductData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    image,
    description,
  };

  const allJsonLd = [
    ...(isProductPage ? [googleProductData] : []),
    ...extraJsonLd,
  ];

  return (
    <>
      <Head>
        <title key={url}>{`RebuildR - ${title}`}</title>

        <meta name="description" content={description} />
        <meta name="keywords" content="Rebuildr, Byggmaterial" />
        {noindex && <meta name="robots" content="noindex" />}

        <meta property="og:type" content={ogType} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image ?? defaultImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:url" content={url} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image ?? defaultImage} />

        <link rel="canonical" href={url} />
      </Head>

      {/* JSON-LD is rendered in the body as a web-only DOM <script>, because
          expo-router/head (react-helmet) does not emit <script> tags into the
          static HTML — only title/meta/link. JSON-LD is valid anywhere in the
          document, so Google/AI crawlers still read it. Guarded to web so React
          Native (iOS/Android) never tries to render an unsupported element. */}
      {Platform.OS === "web" &&
        allJsonLd.map((block, i) => (
          <script
            key={`jsonld-${i}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
          />
        ))}
    </>
  );
}
