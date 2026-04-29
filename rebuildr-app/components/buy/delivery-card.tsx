import {
  BuyProductDeliveryOptionCardQuery,
  BuyProductDeliveryOptionCardQueryVariables,
} from "@/gql/graphql";
import { formatMetersToKm } from "@/utils/distanceHandling";
import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { AddressAutoCompleteInput } from "@components/address-auto-complete-input/address-auto-complete-input";
import { ToggleCard } from "@components/toggle-card/toggle-card";
import { Body, Title } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";

const BUY_PRODUCT_DELIVERY_OPTION = gql`
  query BuyProductDeliveryOptionCard($input: GetTransportationOptionsInput!) {
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
  price: number;
  quantity?: number;
  productId: string;
  methodSelected?: boolean;
  toggleMethod: () => void;
  updateDeliveryOption: (
    data?: BuyProductDeliveryOptionCardQuery["getDeliveryOption"] & {
      address: string;
    },
  ) => void;
  deliveryOption?: BuyProductDeliveryOptionCardQuery["getDeliveryOption"];
};

export const DeliveryCard = ({
  price,
  quantity,
  toggleMethod,
  methodSelected,
  productId,
  updateDeliveryOption,
  deliveryOption,
}: Props) => {
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");

  const [getDeliveryOption, { loading: deliveryOptionLoading }] = useLazyQuery<
    BuyProductDeliveryOptionCardQuery,
    BuyProductDeliveryOptionCardQueryVariables
  >(BUY_PRODUCT_DELIVERY_OPTION, {
    onCompleted: (data) => {
      setAddressError("");
      if (data.getDeliveryOption) {
        if (!data.getDeliveryOption.postalCode) {
          setAddressError("Inkludera även ditt postnummer");
          return;
        }
        updateDeliveryOption({ ...data.getDeliveryOption, address });
      }
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

  const deliveryWithinRadius =
    !!deliveryOption && deliveryOption.isWithinRadius;
  const deliveryOutsideRadius =
    !!deliveryOption && !deliveryOption.isWithinRadius;

  return (
    <ToggleCard
      title="Hemtransport"
      valueString={`${price} kr`}
      enabled={methodSelected}
      onPress={() => {
        toggleMethod();
      }}
      headerDivider
      error={!!deliveryOption && !deliveryOption.isWithinRadius}
    >
      <View style={{ gap: 24 }}>
        {!deliveryOption && (
          <>
            <View style={{ marginBottom: 8 }}>
              <Title size="medium">
                Säljaren levererar direkt hem till dig
              </Title>
              <Body size="medium" style={{ marginTop: 4 }}>
                För att se om säljaren kan leverera till dig behöver vi din
                gatuadress.
              </Body>
            </View>
            <View style={{ gap: 16 }}>
              <AddressAutoCompleteInput
                heading="Ange din gatuadress"
                changeAddress={setAddress}
                error={addressError}
              />
              <Button
                label="Kolla min adress"
                onPress={onEnterDeliveryAddress}
                loading={deliveryOptionLoading}
                disabled={!address}
              />
            </View>
          </>
        )}
        {deliveryWithinRadius && (
          <>
            <View>
              <Title size="medium">
                Säljaren levererar direkt hem till dig
              </Title>
              <Body size="medium" style={{ marginTop: 4 }}>
                Perfekt! Du bor inom leveransområdet.
              </Body>
            </View>
            <View
              style={{
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
                type="tonal"
                onPress={() => {
                  updateDeliveryOption(undefined);
                }}
              />
            </View>
          </>
        )}
        {deliveryOutsideRadius && (
          <>
            <View>
              <Title size="medium">
                Säljaren levererar direkt hem till dig
              </Title>
              <Body size="medium" style={{ marginTop: 4 }} color="error">
                Tyvärr ligger din adress{" "}
                {deliveryOption.distanceFromProduct
                  ? formatMetersToKm(deliveryOption.distanceFromProduct)
                  : ""}{" "}
                km från säljaren och utanför leveransområdet.
              </Body>
            </View>
            <Body size="medium">
              Du kan ändra adressen nedan eller välja ett annat leveranssätt.
            </Body>
            <View style={{ gap: 16 }}>
              <AddressAutoCompleteInput
                heading="Ange din gatuadress"
                changeAddress={setAddress}
              />
              <Button
                label="Kolla igen"
                onPress={onEnterDeliveryAddress}
                loading={deliveryOptionLoading}
                disabled={!address}
              />
            </View>
          </>
        )}
      </View>
    </ToggleCard>
  );
};
