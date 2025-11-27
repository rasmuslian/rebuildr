import {
  BuySingleShippingOptionQuery,
  BuySingleShippingOptionQueryVariables,
  ShippingProviderEnum,
} from "@/gql/graphql";
import { formatMetersToKm } from "@/utils/distanceHandling";
import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { Form } from "@components/forms/form";
import { Body, Headline, Title } from "@components/typography/text";
import { shippingProviderStrings } from "@constants/shippingProviders";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { View } from "react-native";
import { ServicePointsBottomSheet } from "./service-points-bottom-sheet";
import { Summary } from "./summary";
import { formatPostCode } from "@/utils/formattings";

const BUY_SINGLE_SHIPPING_OPTION = gql`
  query BuySingleShippingOption($input: GetTransportationOptionsInput!) {
    getShippingOptions(input: $input) {
      shippingPrice {
        id
        price
        provider
      }
      servicePoints {
        id
        name
        distance
        streetName
        streetNumber
        postalCode
        city
      }
    }
  }
`;

type Props = {
  shippingProvider: ShippingProviderEnum;
  shippingPrice: number;
  productId: string;
  productPrice: number;
  onContinue: () => void;
  selectServicePoint: (id: string) => void;
};
export const SingleShipping = ({
  shippingProvider,
  shippingPrice,
  productId,
  productPrice,
  onContinue,
  selectServicePoint,
}: Props) => {
  const [postCode, setPostCode] = useState("");
  const [showServicePoints, setShowServicePoints] = useState(false);
  const [servicePoint, setServicePoint] =
    useState<
      BuySingleShippingOptionQuery["getShippingOptions"][0]["servicePoints"][0]
    >();
  const colors = useThemeColor();

  const [getShippingOptions, { data, loading }] = useLazyQuery<
    BuySingleShippingOptionQuery,
    BuySingleShippingOptionQueryVariables
  >(BUY_SINGLE_SHIPPING_OPTION);

  const onEnterPostalCode = () => {
    getShippingOptions({
      variables: {
        input: {
          productId,
          postCode,
        },
      },
      onCompleted: (data) => {
        setServicePoint(data.getShippingOptions[0].servicePoints[0]);
        selectServicePoint(data.getShippingOptions[0].servicePoints[0].id);
      },
    });
  };

  const totalPrice =
    productPrice + (data?.getShippingOptions[0].shippingPrice.price ?? 0);

  return (
    <View>
      <View style={{ gap: 24 }}>
        <View>
          <Headline size="small" style={{ marginBottom: 8 }}>
            Frakt med {shippingProviderStrings[shippingProvider]}:{" "}
            {shippingPrice} kr
          </Headline>
          <Body size="large">
            Fyll i ditt postnummer nedan så visar vi närmaste ombud.
          </Body>
        </View>
        <View style={{ gap: 16 }}>
          <Form
            fields={[
              {
                heading: "Ditt Postnummer",
                type: "text",
                value: formatPostCode(postCode),
                onChange: (t) => setPostCode(t),
                helperText: "Tex. 34333",
              },
            ]}
          />
          {!data && (
            <Button
              label="Hitta ombud"
              onPress={() => {
                onEnterPostalCode();
              }}
              loading={loading}
              disabled={!postCode}
            />
          )}
          {!!data && (
            <Button
              label="Uppdatera"
              onPress={() => {
                onEnterPostalCode();
              }}
              loading={loading}
              type="tonal"
            />
          )}
        </View>
        {data && (
          <>
            <View>
              <Divider />
              <Headline size="small" style={{ marginTop: 16, marginBottom: 8 }}>
                Skickas med {shippingProviderStrings[shippingProvider]}
              </Headline>
              <Body size="medium" color="secondary">
                Ditt paket kommer levereras till ditt närmsta postnord ombud.
              </Body>
            </View>
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
                <Title size="medium">{servicePoint?.name}</Title>
                <Body size="medium" style={{ marginTop: 4 }}>
                  {servicePoint?.distance
                    ? formatMetersToKm(servicePoint.distance)
                    : ""}{" "}
                  km
                </Body>
                <Body size="medium" color="secondary" style={{ marginTop: 8 }}>
                  {servicePoint?.streetName} {servicePoint?.streetNumber},{" "}
                  {servicePoint?.postalCode} {servicePoint?.city}
                </Body>
              </View>
              <Button
                label="Ändra"
                onPress={() => {
                  setShowServicePoints(true);
                }}
              />
            </View>
          </>
        )}
        {servicePoint && (
          <Summary
            text={`Du betalar (ink. frakt ${data?.getShippingOptions[0].shippingPrice.price} kr):`}
            price={totalPrice}
            mainButton={{ label: "Fortsätt", onPress: onContinue }}
            bottomText="Säljaren skickar varan inom 7 dagar."
          />
        )}
      </View>
      <ServicePointsBottomSheet
        show={showServicePoints}
        onDismiss={() => setShowServicePoints(false)}
        servicePoints={data?.getShippingOptions[0]?.servicePoints ?? []}
        onSelect={(servicePoint) => {
          setServicePoint(servicePoint);
          selectServicePoint(servicePoint.id);
        }}
      />
    </View>
  );
};
