import React from "react";
import Head from "expo-router/head";
import { usePathname } from "expo-router";

type Props = {
  title?: string;
  image?: string;
  description?: string;

  isProductPage?: boolean;
};

export default function RebuildrHead({
  title = "En digital marknadsplats för återbrukat byggmaterial",
  image,
  description = "RebuildR är en digital marknadsplats och en rörelse för återbrukat byggmaterial.",
  isProductPage = false,
}: Props) {
  const pathName = usePathname();
  const siteUrl = process.env.EXPO_PUBLIC_SITE_URL;
  const url = siteUrl + pathName;

  const defaultImage = siteUrl + "/images/og-image.png";

  // Structured data for google
  const googleProductData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    image,
    description,
  };

  return (
    <Head>
      <title key={url}>{`RebuildR - ${title}`}</title>

      {isProductPage && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(googleProductData),
          }}
        />
      )}

      <meta name="description" content={description} />
      <meta name="keywords" content="Rebuildr, Byggmaterial" />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image ?? defaultImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:url" content={url} />

      <link rel="canonical" href={url} />
    </Head>
  );
}
