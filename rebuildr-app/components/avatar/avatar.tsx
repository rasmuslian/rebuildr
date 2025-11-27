import { Image, ImageProps } from "expo-image";
import PlaceholderProfile from "@assets/images/placeholder-profile.png";
import PlaceholderCategory from "@assets/images/category-placeholder.jpeg";
import LogoIcon from "@assets/images/logo-icon.png";
import { UserType } from "@/gql/graphql";

type Props = {
  imageUrl?: string;
  size?: "small" | "medium" | number;
  placeholder?: UserType | "SYSTEM" | "CATEGORY" | "PROJECT";
} & ImageProps;

export const Avatar = ({
  imageUrl,
  size = "small",
  placeholder = UserType.Personal,
  ...imageProps
}: Props) => {
  let radius: number;
  if (size === "small") {
    radius = 40;
  } else if (size === "medium") {
    radius = 64;
  } else {
    radius = size;
  }

  let placeholderImage;

  switch (placeholder) {
    case "SYSTEM":
      placeholderImage = LogoIcon.uri;
      break;
    case "CATEGORY":
      placeholderImage = PlaceholderCategory.uri;
      break;
    case "PROJECT":
    case UserType.Personal:
    case UserType.Business:
      placeholderImage = PlaceholderProfile.uri;
      break;
    default:
      placeholderImage = PlaceholderProfile.uri;
      break;
  }
  return (
    <Image
      source={imageUrl}
      placeholder={placeholderImage}
      {...imageProps}
      style={[
        { width: radius, height: radius },
        { borderRadius: radius },
        imageProps.style,
      ]}
    />
  );
};
