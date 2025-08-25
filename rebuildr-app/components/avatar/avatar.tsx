import { Image, ImageProps } from "expo-image";
import PlaceholderProfile from "@assets/images/placeholder-profile.png";
import PlaceholderBusiness from "@assets/images/placeholder-project.png";
import PlaceholderCategory from "@assets/images/category-placeholder.jpeg";
import PlaceholderProject from "@assets/images/placeholder-project.png";
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

  const getImageUrl = () => {
    if (imageUrl) return imageUrl;

    switch (placeholder) {
      case "SYSTEM":
        return LogoIcon.uri;
      case "CATEGORY":
        return PlaceholderCategory.uri;
      case "PROJECT":
        return PlaceholderProject.uri;
      case UserType.Personal:
        return PlaceholderProfile.uri;
      case UserType.Business:
        return PlaceholderBusiness.uri;
      default:
        return PlaceholderProfile.uri;
    }
  };

  return (
    <Image
      source={getImageUrl()}
      {...imageProps}
      style={[
        { width: radius, height: radius },
        { borderRadius: 38 },
        imageProps.style,
      ]}
    />
  );
};
