import {
  ProductConditionEnum,
  QuantityUnitEnum,
  UserType,
} from "@/gql/graphql";
import { ProductConditionToText } from "@/utils/enumToText";
import { Body, Label, Title } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { defaultApproximateLocation } from "@constants/map";
import { quantities } from "@constants/quantities";
import { borderRadius } from "@constants/sizes";
import { Icon } from "@icons/icon";
import { View } from "react-native";

type Props = {
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

export const AdDescription = ({
  title,
  quantity = 0,
  quantityUnit: _quantityUnit,
  condition,
  account,
  price,
}: Props) => {
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
