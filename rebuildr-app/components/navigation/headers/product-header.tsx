import { Badge } from "@components/badges/badge";
import { Body, Label, Title } from "@components/typography/text";
import { View } from "react-native";
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

type Props = {
  title: string;
  price: number;
  condition?: ProductConditionEnum;
  quantity?: number | null;
  quantityUnit?: QuantityUnitEnum | null;
  statusBadgeProps?: ComponentProps<typeof Badge> | null;
  imageUrl?: string;
  status: ProductStatusEnum;
};

export const ProductHeader = ({
  title,
  price,
  condition,
  quantity,
  quantityUnit: _quantityUnit,
  statusBadgeProps,
  imageUrl,
  status,
}: Props) => {
  const quantityUnit = _quantityUnit ?? QuantityUnitEnum.Amount;
  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", gap: 16 }}>
        <View
          style={{
            alignItems: "flex-start",
            flex: 1,
          }}
        >
          <Title size="small" numberOfLines={1}>
            {title}
          </Title>
          {condition && quantity && (
            <Body color="secondary" size="small" numberOfLines={1}>
              {quantity} {quantities[quantityUnit].short} •{" "}
              {conditions[condition].name}
            </Body>
          )}
          <Label size="large" style={{ marginTop: 2 }}>
            {price} kr
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
  );
};
