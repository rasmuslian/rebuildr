import { BuyProductTransportationOptionsQuery } from "@/gql/graphql";
import { formatMetersToKm } from "@/utils/distanceHandling";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Button } from "@components/buttons/button";
import { Body, Display, Title } from "@components/typography/text";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useRef } from "react";
import { View } from "react-native";

type Props = {
  show: boolean;
  onDismiss: () => void;
  servicePoints: BuyProductTransportationOptionsQuery["getShippingOptions"][number]["servicePoints"];
  onSelect: (
    servicePoint: BuyProductTransportationOptionsQuery["getShippingOptions"][number]["servicePoints"][number],
  ) => void;
};
export const ServicePointsBottomSheet = ({
  show,
  onDismiss,
  servicePoints,
  onSelect,
}: Props) => {
  const ref = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (show) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [show]);

  return (
    <BottomSheet
      ref={ref}
      name="Ombud"
      title="Välj ett ombud"
      onDismiss={onDismiss}
    >
      <View style={{ gap: 24 }}>
        <Display size="small">Välj ett ombud nära dig</Display>
        <View style={{ gap: 16 }}>
          {servicePoints.map((servicePoint, i) => (
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
                <Body size="medium" color="secondary" style={{ marginTop: 8 }}>
                  {servicePoint?.streetName} {servicePoint?.streetNumber},{" "}
                </Body>
                <Body size="medium" color="secondary">
                  {servicePoint?.postalCode} {servicePoint?.city}
                </Body>
              </View>
              <Button
                label="Välj"
                onPress={() => {
                  onSelect(servicePoint);
                  onDismiss();
                }}
              />
            </View>
          ))}
        </View>
      </View>
    </BottomSheet>
  );
};
