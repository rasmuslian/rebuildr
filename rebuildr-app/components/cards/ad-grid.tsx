import { useReactiveVar } from "@apollo/client";
import { Pressable, View, StyleSheet, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import {
  ProductConditionEnum,
  QuantityUnitEnum,
  UserType,
} from "@/gql/graphql";
import { isLoggedInVar } from "@/apollo/config";
import { borderRadius } from "@constants/sizes";
import { Body, Label, Title } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { ProductConditionToText } from "@/utils/enumToText";
import { primitives } from "@constants/colors";
import PlaceholderProduct from "@assets/images/placeholder-product.png";
import { quantities } from "@constants/quantities";
import { router } from "expo-router";
import { defaultApproximateLocation } from "@constants/map";

type AdDescriptionProps = {
  title: string;
  quantity?: number | null;
  quantityUnit?: QuantityUnitEnum | null;
  condition: ProductConditionEnum;
  account?: {
    rating?: number | null;
    type: UserType;
    location?: string | null;
  };
  price?: number;
};

type Props = {
  id: string;
  imageUri?: string;
  heart?: boolean;
  onHeartPress?: () => void;
  width?: number;
  height?: number;
  overlayText?: string;
  disabled?: boolean;
  liked?: boolean;
} & AdDescriptionProps;

export const AdGrid = ({
  id,
  imageUri,
  heart,
  onHeartPress,
  width: _width,
  overlayText,
  disabled,
  liked,
  ...adDescriptionProps
}: Props) => {
  const { width: screenWidth } = useWindowDimensions();
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const showHeart = heart && isLoggedIn;

  const width = _width ?? (screenWidth - 48) / 2;
  return (
    <Pressable
      style={[{ gap: 8, opacity: disabled ? 0.5 : 1 }]}
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
        style={{ width, aspectRatio: 1, borderRadius: borderRadius.medium }}
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
      <AdDescription
        {...adDescriptionProps}
        // title={title}
        // quantity={quantity}
        // quantityUnit={quantityUnit}
        // condition={condition}
        // account={account}
        // price={price}
      />
    </Pressable>
  );
};

export const AdDescription = ({
  title,
  quantity = 0,
  quantityUnit: _quantityUnit,
  condition,
  account,
  price,
}: AdDescriptionProps) => {
  const quantityUnit = _quantityUnit ?? QuantityUnitEnum.Amount;
  return (
    <View style={{ gap: 8, flex: 1, justifyContent: "space-between" }}>
      <View style={{ gap: 2, paddingRight: 12 }}>
        <Title size="small" numberOfLines={1}>
          {title}
        </Title>
        <View style={{ flexDirection: "row", gap: 2 }}>
          <Body color="secondary" size="small">
            {quantity} {quantities[quantityUnit].short}
          </Body>
          <Body color="secondary" size="small">
            •
          </Body>
          <Body color="secondary" size="small">
            {ProductConditionToText[condition]}
          </Body>
        </View>
      </View>

      {account && (
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            <Icon icon="star" size={10} />
            <Label>{account.rating ?? 3}</Label>
            {account.type === UserType.Business && (
              <View
                style={{
                  borderRadius: borderRadius.xSmall,
                  backgroundColor: primitives.accent200,
                  paddingHorizontal: 4,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Label size="small">Företag</Label>
              </View>
            )}
          </View>
          <Body size="small" color="secondary">
            {account.location ?? defaultApproximateLocation}
          </Body>
        </View>
      )}

      <Label size="large">{price} kr</Label>
    </View>
  );
};
