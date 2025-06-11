import { Image, ImageProps } from "expo-image";
import PlaceholderProfile from "@assets/images/placeholder-profile.png";
import PlaceholderBusiness from "@assets/images/placeholder-project.png";
import { UserType } from "@/gql/graphql";

type Props = {
  imageUrl?: string;
  size?: "small" | "medium" | number;
  userType?: UserType;
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

  return (
    <Image
      source={
        imageUrl ??
        (userType === UserType.Personal
          ? PlaceholderProfile.uri
          : PlaceholderBusiness.uri)
      }
      {...imageProps}
      style={[
        { width: radius, height: radius },
        { borderRadius: 38 },
        imageProps.style,
      ]}
    />
  );
};
