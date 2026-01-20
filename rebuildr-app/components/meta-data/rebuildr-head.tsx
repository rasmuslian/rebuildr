import React from "react";
import Head from "expo-router/head";
import { usePathname } from "expo-router";

type Props = {
  title?: string;
  image?: string;
  description?: string;
};

export default function RebuildrHead({
  title = "RebuildR",
  image,
  description = "RebuildR är en digital marknadsplats och en rörelse för återbrukat byggmaterial. Vår utgångspunkt är enkel: bygg nytt av gammalt.",
}: Props) {
  const pathName = usePathname();
  const siteUrl = process.env.EXPO_PUBLIC_SITE_URL;
  const url = siteUrl + pathName;

  const defaultImage = siteUrl + "/images/og-image.png";

  return (
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
      <meta name="keywords" content="Rebuildr, Byggmaterial" />
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image ?? defaultImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:url" content={url} />
      <meta
        name="viewport"
        content="initial-scale=1, width=device-width, height=device-height"
      />

      <link rel="canonical" href={url} />
    </Head>
  );
}
