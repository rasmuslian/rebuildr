import {
  BuyProductDeliveryOptionSingleQuery,
  BuyProductDeliveryOptionSingleQueryVariables,
} from "@/gql/graphql";
import { formatMetersToKm } from "@/utils/distanceHandling";
import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { AddressAutoCompleteInput } from "@components/address-auto-complete-input/address-auto-complete-input";
import { Body, Headline, Title } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";
import { Divider } from "@components/dividers/divider";
import { useThemeColor } from "@hooks/useThemeColor";
import { Summary } from "./summary";
import { useSubmitSummary } from "@hooks/buy/use-submit-summary";

const BUY_PRODUCT_DELIVERY_OPTION = gql`
  query BuyProductDeliveryOptionSingle($input: GetTransportationOptionsInput!) {
    getDeliveryOption(input: $input) {
      deliverToLocation {
        lat
        lng
      }
      isWithinRadius
      distanceFromProduct
      deliveryPrice
      postalCode
    }
  }
`;

type Props = {
  productPrice: number;
  productId: string;
  quantity?: number;
};

export const SingleDelivery = ({
  productPrice,
  productId,
  quantity,
}: Props) => {
  const { submitDelivery } = useSubmitSummary({ quantity });
  const colors = useThemeColor();
  const [address, setAddress] = useState("");
  const [deliveryOption, setDeliveryOption] =
    useState<BuyProductDeliveryOptionSingleQuery["getDeliveryOption"]>();

  const [getDeliveryOption, { loading: deliveryOptionLoading }] = useLazyQuery<
    BuyProductDeliveryOptionSingleQuery,
    BuyProductDeliveryOptionSingleQueryVariables
  >(BUY_PRODUCT_DELIVERY_OPTION, {
    onCompleted: (data) => {
      setDeliveryOption(data.getDeliveryOption);
    },
    fetchPolicy: "cache-and-network",
  });

  const onEnterDeliveryAddress = () => {
    if (!address || deliveryOptionLoading) {
      return null;
    }

    getDeliveryOption({
      variables: { input: { productId, address, quantity } },
    });
  };

  const onToPayment = () => {
    if (!deliveryOption) {
      return;
    }
    submitDelivery(
      productId,
      totalPrice,
      deliveryOption.deliverToLocation.lat,
      deliveryOption.deliverToLocation.lng,
      address,
    );
  };

  const deliveryWithinRadius =
    !!deliveryOption && deliveryOption.isWithinRadius;
  const deliveryOutsideRadius =
    !!deliveryOption && !deliveryOption.isWithinRadius;
  const totalPrice =
    productPrice * (quantity ?? 1) + (deliveryOption?.deliveryPrice ?? 0);

  return (
    <View>
      <View style={{ gap: 24 }}>
        <View style={{ gap: 8 }}>
          <Headline size="small">
            Hemtransport: {deliveryOption?.deliveryPrice} kr
          </Headline>
          <Body size="large">
            Fyll i din adress nedan för att se om säljaren kan leverera till
            dig.
          </Body>
        </View>
        <AddressAutoCompleteInput
          heading="Ange din gatuadress"
          changeAddress={setAddress}
          error={deliveryOutsideRadius}
        />
        <Button
          label={deliveryOutsideRadius ? "Kolla igen" : "Kolla min adress"}
          onPress={onEnterDeliveryAddress}
          loading={deliveryOptionLoading}
          disabled={!address}
          type={
            deliveryOption
              ? deliveryOutsideRadius
                ? "filled"
                : "tonal"
              : "filled"
          }
        />
        {deliveryWithinRadius && (
          <View>
            <Divider />
            <Headline size="small" style={{ marginTop: 16, marginBottom: 24 }}>
              Perfekt! Du bor inom säljarens leveransområde.
            </Headline>
            <View
              style={{
                backgroundColor: colors.buttons.tonal.enabled,
                borderRadius: 12,
                padding: 12,
                flexDirection: "row",
                gap: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <Title size="medium">Leveransadress</Title>
                <Body size="medium" style={{ marginTop: 4 }}>
                  {deliveryOption.distanceFromProduct
                    ? formatMetersToKm(deliveryOption.distanceFromProduct)
                    : "0"}{" "}
                  km från säljaren
                </Body>
                <Body size="medium" color="secondary" style={{ marginTop: 8 }}>
                  {address.split(",")[0]}
                </Body>
                <Body size="medium" color="secondary">
                  {`${deliveryOption.postalCode}${address.replace(address.split(",")[0], "").trim()}`}
                </Body>
              </View>
              <Button
                label="Ändra"
                onPress={() => {
                  setDeliveryOption(undefined);
                }}
              />
            </View>
          </View>
        )}
        {deliveryOutsideRadius && (
          <View>
            <Divider />

            <Headline size="small" style={{ marginTop: 16, marginBottom: 8 }}>
              Utanför leveransområde
            </Headline>
            <Body size="medium">
              Tyvärr ligger din adress 8,2 km från säljaren och utanför
              leveransområdet.
            </Body>
            <Body size="medium" style={{ marginTop: 24 }}>
              Du kan ändra adressen ovan eller avbryta köpet.
            </Body>
          </View>
        )}
        {deliveryOption && (
          <Summary
            text={`Du betalar (ink. hemtransport ${deliveryOption.deliveryPrice} kr):`}
            price={totalPrice}
            mainButton={{
              label: totalPrice ? "Fortsätt till Betalning" : "Fortsätt",
              onPress: () => {
                onToPayment();
              },
            }}
            bottomText="Leveransen planeras i chatten mellan dig och säljaren och ska ske inom 7 dagar."
          />
        )}
      </View>
    </View>
  );
};
