import { useReactiveVar } from "@apollo/client";
import { Pressable, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { ProductConditionEnum } from "@/gql/graphql";
import { isLoggedInVar } from "@/apollo/config";
import { borderRadius } from "@constants/sizes";
import { Body, Label, Title } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { ProductConditionToText } from "@/utils/enumToText";
import { primitives } from "@constants/colors";

type Props = {
  imageUri: string;
  heart?: boolean;
  onHeartPress?: () => void;
  onPress: () => void;
  width?: number;
  height?: number;
  overlayText?: string;
  price?: number;
  disabled?: boolean;
  liked?: boolean;
  amount: number;
  condition: ProductConditionEnum;
  title: string;
  rating: number;
  isBusiness: boolean;
  location: string;
};

export const AdGrid = ({
  imageUri,
  heart,
  onHeartPress,
  onPress,
  width = 167,
  height = 167,
  overlayText,
  price,
  disabled,
  liked,
  amount,
  condition,
  title,
  rating,
  isBusiness,
  location,
}: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const showHeart = heart && isLoggedIn;
  return (
    <Pressable
      style={[{ width, gap: 8, opacity: disabled ? 0.5 : 1 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Image
        source={imageUri}
        cachePolicy="memory-disk"
        style={{ width, height, borderRadius: borderRadius.medium }}
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
      <View style={{ gap: 8 }}>
        <View style={{ gap: 2, paddingRight: 12 }}>
          <Title size="small" numberOfLines={1}>
            {title}
          </Title>
          <View style={{ flexDirection: "row", gap: 2 }}>
            <Body color="secondary" size="small">
              {amount} st
            </Body>
            <Body color="secondary" size="small">
              •
            </Body>
            <Body color="secondary" size="small">
              {ProductConditionToText[condition]}
            </Body>
          </View>
        </View>

        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            <Icon icon="star" size={10} />
            <Label>{rating}</Label>
            {isBusiness && (
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
            {location}
          </Body>
        </View>

        <Label size="large">{price} kr</Label>
      </View>
    </Pressable>
  );
};
