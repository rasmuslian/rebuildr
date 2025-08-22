import { Image, ImageProps } from "expo-image";
import PlaceholderProfile from "@assets/images/placeholder-profile.png";
import PlaceholderBusiness from "@assets/images/placeholder-project.png";
import PlaceholderCategory from "@assets/images/category-placeholder.jpeg";
import LogoIcon from "@assets/images/logo-icon.png";
import { UserType } from "@/gql/graphql";

type Props = {
  imageUrl?: string;
  size?: "small" | "medium" | number;
  userType?: UserType | "SYSTEM" | "CATEGORY";
} & ImageProps;

export const Avatar = ({
  imageUrl,
  size = "small",
  userType = UserType.Personal,
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
    if (imageUrl) {
      return imageUrl;
    }
    switch (userType) {
      case "SYSTEM":
        return LogoIcon.uri;
      case "CATEGORY":
        return PlaceholderCategory.uri;
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
