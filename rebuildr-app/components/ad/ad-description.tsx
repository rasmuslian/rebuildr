import {
  ProductConditionEnum,
  QuantityUnitEnum,
  UserType,
} from "@/gql/graphql";
import { Body, Label, Title } from "@components/typography/text";
import { conditions } from "@constants/conditions";
import { defaultApproximateLocation } from "@constants/map";
import { quantities } from "@constants/quantities";
import { Icon } from "@icons/icon";
import { View } from "react-native";
import { CompanyBadge } from "@components/badges/company-badge";
import { formatPrice, formatRating } from "@/utils/formattings";

type Props = {
  title: string;
  quantity?: number | null;
  quantityUnit?: QuantityUnitEnum | null;
  condition: ProductConditionEnum;
  account?: {
    rating?: number | null;
    type?: UserType;
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
        <Body color="secondary" size="small" numberOfLines={1}>
          {quantity} {quantities[quantityUnit].short} •{" "}
          {conditions[condition].name}
        </Body>
      </View>

      {account && (
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            {typeof account.rating === "number" ? (
              <>
                <Icon icon="star" size={10} />
                <Label size="medium">{formatRating(account.rating)}</Label>
              </>
            ) : (
              <View style={{ height: 4 }} />
            )}
            {account.type === UserType.Business && <CompanyBadge />}
          </View>
          <Body size="small" color="secondary">
            {account.location ?? defaultApproximateLocation}
          </Body>
        </View>
      )}
      <Label size="large">{formatPrice(price)}</Label>
    </View>
  );
};
