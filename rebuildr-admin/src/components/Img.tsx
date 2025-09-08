import React from "react";
import Image, { ImageProps } from "next/image";
import { getImage } from "@/lib/get-image";

type ImgProps = {
  src: string;
  alt: string;
} & ImageProps;

const Img = async ({ src, alt, ...props }: ImgProps) => {
  const response = await getImage(src);

  if (!response) {
    return <Image src={"/empty.svg"} alt={alt || ""} {...props} />;
  }

  const { img, base64 } = response;
  return (
    <Image
      {...img}
      alt={alt || ""}
      placeholder="blur"
      blurDataURL={base64}
      {...props}
    />
  );
};

export default Img;
