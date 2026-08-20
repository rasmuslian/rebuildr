import { Pressable, View, Image } from "react-native";
import { borderRadius } from "@constants/sizes";
import { Icon } from "@icons/icon";
import PlaceholderProduct from "@assets/images/placeholder-product.png";
import DeletedProduct from "@assets/images/deleted-product.png";
import { router } from "expo-router";
import { ComponentProps } from "react";
import { AdDescription } from "./ad-description";
import { ProductStatusEnum } from "@/gql/graphql";
import { useUser } from "@hooks/useUser";
import { ProductImageOverlay } from "@components/product/product-image-overlay";
import { Label } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { UPCOMING_LABEL } from "@/utils/availability";
import { meterToKilometer } from "@/utils/conversions";
import { trackEvent } from "@/utils/analytics";
import { GTMTagEnum } from "@constants/google-tag-manager";

const ImageBadge = ({ text }: { text: string }) => (
  <View
    style={{
      paddingVertical: 2,
      paddingHorizontal: 8,
      borderRadius: borderRadius.full,
      backgroundColor: primitives.primary700,
    }}
  >
    <Label size="medium" color="primaryLight">
      {text}
    </Label>
  </View>
);

type Props = {
  id: string;
  imageUri?: string;
  heart?: boolean;
  onHeartPress?: () => void;
  overlayText?: string;
  imageBadgeText?: string;
  disabled?: boolean;
  liked?: boolean;
  status?: ProductStatusEnum;
  distance?: number | null;
  onPress?: () => void;
  upcoming?: boolean;
} & ComponentProps<typeof AdDescription>;

export const AdGrid = ({
  id,
  imageUri,
  heart,
  onHeartPress,
  overlayText: _overlayText,
  imageBadgeText,
  disabled,
  liked,
  status,
  distance,
  onPress,
  upcoming,
  title,
  price,
  ...adDescriptionProps
}: Props) => {
  const { isLoggedIn } = useUser();
  const showHeart = heart && isLoggedIn;

  const overlayText = _overlayText
    ? _overlayText
    : status === ProductStatusEnum.Sold
      ? "Såld"
      : status === ProductStatusEnum.Deleted
        ? "Borttagen"
        : undefined;

  return (
    <Pressable
      style={[{ gap: 8, opacity: disabled ? 0.5 : 1, width: "100%" }]}
      onPress={() => {
        trackEvent(GTMTagEnum.SELECT_ITEM, {
          item_id: id,
          item_name: title,
          price,
        });
        if (onPress) {
          onPress();
          return;
        }
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
          accessibilityLabel={
            title
              ? `${title} – återbrukat byggmaterial på RebuildR`
              : "Produktbild på återbrukat byggmaterial"
          }
          style={{ aspectRatio: 1, borderRadius: borderRadius.medium }}
        />
        {!!overlayText && <ProductImageOverlay text={overlayText} />}
        {(upcoming || imageBadgeText) && (
          <View
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              gap: 4,
            }}
          >
            {upcoming && !overlayText && <ImageBadge text={UPCOMING_LABEL} />}
            {!!imageBadgeText && <ImageBadge text={imageBadgeText} />}
          </View>
        )}
      </View>
      {distance && (
        <View
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            paddingVertical: 2,
            paddingHorizontal: 6,
            borderRadius: borderRadius.xSmall,
            backgroundColor: "#00000099",
          }}
        >
          <Label size="medium" color="primaryLight">
            {meterToKilometer(distance)} km
          </Label>
        </View>
      )}
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
      <AdDescription title={title} price={price} {...adDescriptionProps} />
    </Pressable>
  );
};
