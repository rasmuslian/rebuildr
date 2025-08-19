import {
  BuyProductDeliveryOptionQuery,
  BuyProductDeliveryOptionQueryVariables,
} from "@/gql/graphql";
import { formatMetersToKm } from "@/utils/distanceHandling";
import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { AddressAutoCompleteInput } from "@components/address-auto-complete-input/address-auto-complete-input";
import { ToggleCard } from "@components/toggle-card/toggle-card";
import { Body, Headline, Title } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";
import { Divider } from "@components/dividers/divider";
import { useThemeColor } from "@hooks/useThemeColor";

const BUY_PRODUCT_DELIVERY_OPTION = gql`
  query BuyProductDeliveryOption($input: GetTransportationOptionsInput!) {
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
  productId: string;
  methodSelected?: boolean;
  toggleMethod: () => void;
  updateDeliveryOption: (
    data?: BuyProductDeliveryOptionQuery["getDeliveryOption"],
  ) => void;
  deliveryOption?: BuyProductDeliveryOptionQuery["getDeliveryOption"];
  isSingleTransportationMethod: boolean;
};

type DeliveryCardProps = {
  methodSelected?: boolean;
  toggleMethod: () => void;
} & Props;

type DeliveryProps = {} & Props;

export const DeliveryCard = ({
  price,
  toggleMethod,
  methodSelected,
  productId,
  updateDeliveryOption,
  deliveryOption,
  isSingleTransportationMethod,
}: Props) => {
  const colors = useThemeColor();
  const [address, setAddress] = useState("");

  const [getDeliveryOption, { loading: deliveryOptionLoading }] = useLazyQuery<
    BuyProductDeliveryOptionQuery,
    BuyProductDeliveryOptionQueryVariables
  >(BUY_PRODUCT_DELIVERY_OPTION, {
    onCompleted: (data) => {
      updateDeliveryOption(data.getDeliveryOption);
    },
    fetchPolicy: "cache-and-network",
  });

  const onEnterDeliveryAddress = () => {
    if (!address || deliveryOptionLoading) {
      return null;
    }

    getDeliveryOption({
      variables: { input: { productId, address } },
    });
  };

  const deliveryWithinRadius =
    !!deliveryOption && deliveryOption.isWithinRadius;
  const deliveryOutsideRadius =
    !!deliveryOption && !deliveryOption.isWithinRadius;

  if (isSingleTransportationMethod) {
    return (
      <View>
        <View style={{ gap: 24 }}>
          <View style={{ gap: 8 }}>
            <Headline size="small">Hemtransport: {price} kr</Headline>
            <Body size="large">
              Fyll i din adress nedan för att se om säljaren kan leverera till
              dig.
            </Body>
          </View>
          <AddressAutoCompleteInput
            heading="Ange din gatuadress"
            changeAddress={setAddress}
            errorText={deliveryOutsideRadius ? "" : undefined}
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
              <Headline
                size="small"
                style={{ marginTop: 16, marginBottom: 24 }}
              >
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
                  <Body
                    size="medium"
                    color="secondary"
                    style={{ marginTop: 8 }}
                  >
                    {address}
                  </Body>
                  <Body size="medium" color="secondary">
                    {deliveryOption.postalCode}
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
        </View>
      </View>
    );
  }

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
        {!!deliveryOption && deliveryOption.isWithinRadius && (
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
                  {address}
                </Body>
                <Body size="medium" color="secondary">
                  {deliveryOption.postalCode}
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
        {!!deliveryOption && !deliveryOption.isWithinRadius && (
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
