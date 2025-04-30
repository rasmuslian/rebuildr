import {
  ShippingPrice,
  ShippingProviderEnum,
  ShippingQueryQuery,
  ShippingQueryQueryVariables,
  UpdateProductInput,
} from "@/gql/graphql";
import { gql, useSuspenseQuery } from "@apollo/client";
import { Radio } from "@components/controls/radio";
import { Body, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

const SHIPPING_QUERY = gql`
  query ShippingQuery($input: GetProductInput!) {
    getAllShippingPrices {
      id
      maxWeight
      price
      provider
    }
    product(input: $input) {
      id
      shippingPrices {
        id
        maxWeight
        price
        provider
      }
    }
  }
`;

type Props = {
  productId: string;
  onUpdate: (input: UpdateProductInput) => void;
};

export const Shipping = ({ productId, onUpdate }: Props) => {
  const { data } = useSuspenseQuery<
    ShippingQueryQuery,
    ShippingQueryQueryVariables
  >(SHIPPING_QUERY, { variables: { input: { id: productId } } });
  const colors = useThemeColor();
  const [provider, setProvider] = useState<ShippingProviderEnum>(
    ShippingProviderEnum.Postnord,
  );

  const onSelectPrice = (id: string) => {
    onUpdate({
      id: productId,
      shippingPriceIds: [id],
    });
  };

  const isSelected = (shippingPrice: ShippingPrice) => {
    return !!data.product.shippingPrices?.find(
      (existingPrice) => existingPrice.id === shippingPrice.id,
    );
  };

  return (
    <View style={{ gap: 24 }}>
      <View>
        <Title size="medium">Välj vikt på paketet</Title>
        <Body size="medium" style={{ marginTop: 4, marginBottom: 16 }}>
          Får din vara plats i en flyttkartong går den att skicka. Men du kan
          också skicka långsmala paket, t.ex. lorem ipsum eller dolor.
        </Body>
        <Body size="medium" isLink>
          Se vår storleksguide
        </Body>
      </View>
      <View style={{ gap: 8 }}>
        {data.getAllShippingPrices
          .filter((shippingPrice) => shippingPrice.provider === provider)
          .map((shippingPrice, i) => (
            <Pressable key={i} onPress={() => onSelectPrice(shippingPrice.id)}>
              <View
                style={[
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    borderRadius: borderRadius.medium,
                  },
                  isSelected(shippingPrice)
                    ? {
                        padding: 15,
                        borderRadius: borderRadius.medium,
                        backgroundColor: colors.background.neutral,
                        borderWidth: 1,
                        borderColor: colors.textField.clicked,
                      }
                    : {
                        padding: 16,
                        borderRadius: borderRadius.medium,
                        backgroundColor: colors.buttons.tonal.enabled,
                      },
                ]}
              >
                <Title size="medium">Max {shippingPrice.maxWeight} kg</Title>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <Body size="medium" color="secondary">
                    {shippingPrice.price} kr
                  </Body>
                  <Radio
                    selected={isSelected(shippingPrice)}
                    onPress={() => {}}
                  />
                </View>
              </View>
            </Pressable>
          ))}
      </View>
    </View>
  );
};
