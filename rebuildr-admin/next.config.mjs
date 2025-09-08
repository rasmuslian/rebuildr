// @ts-check
import withPlaiceholder from "@plaiceholder/next";

/**
 * @type {import('next').NextConfig}
 */

const config = withPlaiceholder({
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rebuildr-staging.ams3.cdn.digitaloceanspaces.com",
      },
    ],
  },
});

export default config;
