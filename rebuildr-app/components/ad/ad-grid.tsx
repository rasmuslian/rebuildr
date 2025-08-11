import { Pressable, View, StyleSheet } from "react-native";
import { Image } from "expo-image";

import { borderRadius } from "@constants/sizes";
import { Label } from "@components/typography/text";
import { Icon } from "@icons/icon";
import PlaceholderProduct from "@assets/images/placeholder-product.png";
import DeletedProduct from "@assets/images/deleted-product.png";
import { router } from "expo-router";
import { ComponentProps } from "react";
import { AdDescription } from "./ad-description";
import { ProductStatusEnum } from "@/gql/graphql";
import { useUser } from "@hooks/useUser";

type Props = {
  id: string;
  imageUri?: string;
  heart?: boolean;
  onHeartPress?: () => void;
  overlayText?: string;
  disabled?: boolean;
  liked?: boolean;
  status?: ProductStatusEnum;
} & ComponentProps<typeof AdDescription>;

export const AdGrid = ({
  id,
  imageUri,
  heart,
  onHeartPress,
  overlayText: _overlayText,
  disabled,
  liked,
  status,
  ...adDescriptionProps
}: Props) => {
  const { isLoggedIn } = useUser();
  const showHeart = heart && isLoggedIn;

  const overlayText = _overlayText
    ? _overlayText
    : status === ProductStatusEnum.Sold
      ? "Såld"
      : undefined;

  return (
    <Pressable
      style={[{ gap: 8, opacity: disabled ? 0.5 : 1, width: "100%" }]}
      onPress={() => {
        router.navigate({
          pathname: "/product/[productId]",
          params: { productId: id },
        });
      }}
      disabled={disabled}
    >
      <View>
        <Image
          source={
            status === ProductStatusEnum.Deleted
              ? DeletedProduct.uri
              : (imageUri ?? PlaceholderProduct.uri)
          }
          cachePolicy="memory-disk"
          style={{ aspectRatio: 1, borderRadius: borderRadius.medium }}
        />
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
      </View>
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
