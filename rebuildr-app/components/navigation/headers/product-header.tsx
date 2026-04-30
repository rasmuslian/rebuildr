import { Badge } from "@components/badges/badge";
import { Body, Label, Title } from "@components/typography/text";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import {
  ProductConditionEnum,
  ProductStatusEnum,
  QuantityUnitEnum,
} from "@/gql/graphql";
import { borderRadius } from "@constants/sizes";
import { Divider } from "@components/dividers/divider";
import { ComponentProps } from "react";
import DeletedProduct from "@assets/images/deleted-product.png";
import { quantities } from "@constants/quantities";
import { conditions } from "@constants/conditions";
import { formatPrice } from "@/utils/formattings";

type Props = {
  id: string;
  title: string;
  price: number;
  soldByQuantity?: boolean;
  condition?: ProductConditionEnum;
  quantity?: number | null;
  quantityUnit?: QuantityUnitEnum | null;
  statusBadgeProps?: ComponentProps<typeof Badge> | null;
  imageUrl?: string;
  status: ProductStatusEnum;
  disabled?: boolean;
  onPress?: () => void;
};

export const ProductHeader = ({
  id,
  title,
  price,
  soldByQuantity,
  condition,
  quantity,
  quantityUnit: _quantityUnit,
  statusBadgeProps,
  imageUrl,
  status,
  disabled = true,
  onPress,
}: Props) => {
  const quantityUnit = _quantityUnit ?? QuantityUnitEnum.Amount;
  return (
    <Pressable
      disabled={disabled || !onPress}
      onPress={() => {
        if (onPress) {
          onPress();
        }
      }}
    >
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <View
            style={{
              alignItems: "flex-start",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Title size="small" numberOfLines={1}>
              {title}
            </Title>
            {condition && quantity && (
              <Body color="secondary" size="small" numberOfLines={1}>
                {quantity} {quantities[quantityUnit].plural} •{" "}
                {conditions[condition].name}
              </Body>
            )}
            <Label size="large" style={{ marginTop: 2 }}>
              {formatPrice(price)}
              {soldByQuantity ? `/${quantities[quantityUnit].singular}` : ""}
            </Label>
            {statusBadgeProps && (
              <View style={{ marginTop: 8, flex: 1 }}>
                <Badge {...statusBadgeProps} />
              </View>
            )}
          </View>
          <View>
            <Image
              source={{
                uri:
                  status === ProductStatusEnum.Deleted
                    ? DeletedProduct.uri
                    : imageUrl,
              }}
              style={{
                width: 64,
                height: 64,
                borderRadius: borderRadius.small,
              }}
            />
          </View>
        </View>
        <Divider />
      </View>
    </Pressable>
  );
};
