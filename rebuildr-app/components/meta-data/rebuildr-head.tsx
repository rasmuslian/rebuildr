import React from "react";
import Head from "expo-router/head";

type Props = {
  title?: string;
  image?: string;
  description?: string;
};

export default function RebuildrHead({
  title = "RebuildR",
  image = "/images/og-image.png",
  description = "RebuildR är en digital marknadsplats och en rörelse för återbrukat byggmaterial. Vår utgångspunkt är enkel: bygg nytt av gammalt.",
}: Props) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
    </Head>
  );
}
