import {
  BuyProductDeliveryOptionSingleQuery,
  BuyProductDeliveryOptionSingleQueryVariables,
  SingleDeliveryCreateFreePurchaseMutation,
  SingleDeliveryCreateFreePurchaseMutationVariables,
  TransportationEnum,
} from "@/gql/graphql";
import { formatMetersToKm } from "@/utils/distanceHandling";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { AddressAutoCompleteInput } from "@components/address-auto-complete-input/address-auto-complete-input";
import { Body, Headline, Title } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";
import { Divider } from "@components/dividers/divider";
import { useThemeColor } from "@hooks/useThemeColor";
import { Summary } from "./summary";
import { router } from "expo-router";

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

const SINGLE_DELIVERY_CREATE_FREE_PURCHASE = gql`
  mutation SingleDeliveryCreateFreePurchase($input: PurchaseProductInput!) {
    purchaseProduct(input: $input) {
      purchase {
        id
        status
      }
    }
  }
`;

type Props = {
  price: number;
  productId: string;
};

export const SingleDelivery = ({ price, productId }: Props) => {
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
  const [purchaseProduct] = useMutation<
    SingleDeliveryCreateFreePurchaseMutation,
    SingleDeliveryCreateFreePurchaseMutationVariables
  >(SINGLE_DELIVERY_CREATE_FREE_PURCHASE);

  const onEnterDeliveryAddress = () => {
    if (!address || deliveryOptionLoading) {
      return null;
    }

    getDeliveryOption({
      variables: { input: { productId, address } },
    });
  };

  const onToPayment = () => {
    if (!deliveryOption) {
      return;
    }
    //If the whole purchase is free, create the purchase and move on directly to success screen, skipping payment screen
    if (totalPrice === 0) {
      purchaseProduct({
        variables: {
          input: {
            productId,
            transportationMethod: TransportationEnum.Delivery,
          },
        },
        onCompleted: (data) => {
          router.navigate({
            pathname: "/buy/[productId]/success",
            params: { productId, purchaseId: data.purchaseProduct.purchase.id },
          });
        },
      });
      return;
    }

    router.navigate({
      pathname: "/buy/[productId]/payment",
      params: {
        productId,
        transportationMethod: "delivery",
        deliverToLocation: `${deliveryOption.deliverToLocation.lat},${deliveryOption.deliverToLocation.lng}`,
        deliverToAddress: address,
      },
    });
  };

  const deliveryWithinRadius =
    !!deliveryOption && deliveryOption.isWithinRadius;
  const deliveryOutsideRadius =
    !!deliveryOption && !deliveryOption.isWithinRadius;
  const totalPrice = price + (deliveryOption?.deliveryPrice ?? 0);

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
                  {address}
                </Body>
                <Body size="medium" color="secondary">
                  {deliveryOption.postalCode}
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
              label: "Fortsätt till Betalning",
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
