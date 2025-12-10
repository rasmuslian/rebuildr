import { BuyProductTransportationOptionsQuery } from "@/gql/graphql";
import { formatMetersToKm } from "@/utils/distanceHandling";
import { Button } from "@components/buttons/button";
import { ToggleCard } from "@components/toggle-card/toggle-card";
import { Body, Headline, Title } from "@components/typography/text";
import { shippingProviderStrings } from "@constants/shippingProviders";
import { useState } from "react";
import { View } from "react-native";
import { ServicePointsBottomSheet } from "./service-points-bottom-sheet";
import { useScreenType } from "@hooks/useScreenType";

type Props = {
  enabled: boolean;
  toggleMethod: () => void;
  shippingOption: BuyProductTransportationOptionsQuery["getShippingOptions"][number];
  selectServicePoint: (servicePointId: string) => void;
};
export const ShippingCard = ({
  enabled,
  shippingOption,
  toggleMethod,
  selectServicePoint,
}: Props) => {
  const [showServicePoints, setShowServicePoints] = useState(false);
  const [servicePoint, setServicePoint] = useState<
    BuyProductTransportationOptionsQuery["getShippingOptions"][0]["servicePoints"][0]
  >(shippingOption.servicePoints[0]);

  const { isMobile } = useScreenType();

  return (
    <ToggleCard
      title={`Frakt med ${shippingProviderStrings[shippingOption.shippingPrice.provider]}`}
      valueString={`${shippingOption.shippingPrice.price} kr`}
      enabled={enabled}
      onPress={() => {
        toggleMethod();
      }}
      headerDivider
    >
      <View style={{ gap: 16 }}>
        <View>
          <Title size="medium">
            Skickas med{" "}
            {shippingProviderStrings[shippingOption.shippingPrice.provider]}
          </Title>
          <Body size="medium" style={{ marginTop: 4 }}>
            Ditt paket kommer levereras till ditt närmsta{" "}
            {shippingProviderStrings[
              shippingOption.shippingPrice.provider
            ].toLowerCase()}
            ombud.
          </Body>
        </View>
        {(isMobile || !showServicePoints) && (
          <View style={{ flexDirection: "row", gap: 16, marginTop: 16 }}>
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
              type="tonal"
              onPress={() => {
                setShowServicePoints(true);
              }}
            />
          </View>
        )}
        {showServicePoints && !isMobile && (
          <View style={{ gap: 16, marginTop: 16 }}>
            <Headline size="small">Välj ett ombud nära dig</Headline>
            <View style={{ gap: 16 }}>
              {shippingOption?.servicePoints.map((servicePoint, i) => (
                <View
                  key={i}
                  style={{ flexDirection: "row", gap: 16, marginTop: 16 }}
                >
                  <View style={{ flex: 1 }}>
                    <Title size="medium">{servicePoint?.name}</Title>
                    <Body size="medium" style={{ marginTop: 4 }}>
                      {servicePoint?.distance
                        ? formatMetersToKm(servicePoint.distance)
                        : ""}{" "}
                      km
                    </Body>
                    <Body
                      size="medium"
                      color="secondary"
                      style={{ marginTop: 8 }}
                    >
                      {servicePoint?.streetName} {servicePoint?.streetNumber}
                      ,{" "}
                    </Body>
                    <Body size="medium" color="secondary">
                      {servicePoint?.postalCode} {servicePoint?.city}
                    </Body>
                  </View>
                  <Button
                    label="Välj"
                    onPress={() => {
                      setServicePoint(servicePoint);
                      selectServicePoint(servicePoint.id);
                      setShowServicePoints(false);
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
      {isMobile && (
        <ServicePointsBottomSheet
          show={showServicePoints}
          onDismiss={() => setShowServicePoints(false)}
          servicePoints={shippingOption?.servicePoints ?? []}
          onSelect={(servicePoint) => {
            setServicePoint(servicePoint);
            selectServicePoint(servicePoint.id);
          }}
        />
      )}
    </ToggleCard>
  );
};
