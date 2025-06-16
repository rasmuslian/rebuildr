import { useReactiveVar } from "@apollo/client";
import { Pressable, View, StyleSheet, useWindowDimensions } from "react-native";
import { Image } from "expo-image";

import { isLoggedInVar } from "@/apollo/config";
import { borderRadius } from "@constants/sizes";
import { Label } from "@components/typography/text";
import { Icon } from "@icons/icon";
import PlaceholderProduct from "@assets/images/placeholder-product.png";
import { router } from "expo-router";
import { ComponentProps } from "react";
import { AdDescription } from "./ad-description";

type Props = {
  id: string;
  imageUri?: string;
  heart?: boolean;
  onHeartPress?: () => void;
  overlayText?: string;
  disabled?: boolean;
  liked?: boolean;
} & ComponentProps<typeof AdDescription>;

export const AdGrid = ({
  id,
  imageUri,
  heart,
  onHeartPress,
  overlayText,
  disabled,
  liked,
  ...adDescriptionProps
}: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const showHeart = heart && isLoggedIn;

  return (
    <Pressable
      style={[{ gap: 8, opacity: disabled ? 0.5 : 1, width: "100%" }]}
      onPress={() => {
        router.navigate({
          pathname: "/product",
          params: { productId: id },
        });
      }}
      disabled={disabled}
    >
      <Image
        source={imageUri ?? PlaceholderProduct.uri}
        cachePolicy="memory-disk"
        style={{ aspectRatio: 1, borderRadius: borderRadius.medium }}
      >
        {!!overlayText && (
          <View
            style={
              !!overlayText && {
                ...StyleSheet.absoluteFillObject,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#00000080",
                borderRadius: borderRadius.medium,
              }
            }
          >
            <Label size="large" style={{ color: "white" }}>
              {overlayText}
            </Label>
          </View>
        )}
      </Image>
      {showHeart && (
        <Pressable
          style={({ pressed }) => ({
            position: "absolute",
            top: 8,
            right: 8,
            opacity: pressed ? 0.7 : 1,
          })}
          pointerEvents="box-only"
          onPress={onHeartPress}
        >
          <Icon
            strokeColor="primaryLight"
            color={liked ? "link" : undefined}
            opacity={liked ? undefined : "99"}
            icon="heartFilled"
          />
        </Pressable>
      )}
      <AdDescription {...adDescriptionProps} />
    </Pressable>
  );
};
