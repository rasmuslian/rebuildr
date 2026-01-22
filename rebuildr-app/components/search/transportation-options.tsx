import { Button } from "@components/buttons/button";
import { Slider } from "@components/slider/slider";
import { ToggleCard } from "@components/toggle-card/toggle-card";
import { Body, Label } from "@components/typography/text";
import { defaultCenter, defaultRadius } from "@constants/map";
import { useScreenType } from "@hooks/useScreenType";
import { useEffect, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import Map from "@components/maps/map";
import { useLocationAddress } from "@hooks/useLocationAddress";
import { ProductsInput, SearchProductsQuery } from "@/gql/graphql";
import { formatMetersToKm } from "@/utils/distanceHandling";
import { meterToKilometer } from "@/utils/conversions";
import { Check } from "@components/controls/check";

export type TransportationFilterOptions = Pick<
  ProductsInput,
  "distance" | "location" | "pickup" | "shipping" | "delivery"
>;

type Props = {
  data?: SearchProductsQuery;
  loading?: boolean;
  setTransportationLabel: (label: string) => void;
  onApply: (transportationInput: TransportationFilterOptions) => void;
};

export const TransportationOptions = ({
  data,
  loading,
  setTransportationLabel,
  onApply,
}: Props) => {
  const [pickup, setPickup] = useState(true);
  const [pickupDistance, setPickupDistance] = useState(defaultRadius);
  const [isMyLocation, setIsMyLocation] = useState(false);
  const [shipping, setShipping] = useState(true);
  const [delivery, setDelivery] = useState(true);
  const { isDesktop } = useScreenType();
  const { width: screenWidth } = useWindowDimensions();

  const { location, setMyLocation, setMapLocation } = useLocationAddress({
    location: data?.me?.location ?? {
      lat: defaultCenter[0],
      lng: defaultCenter[1],
    },
  });

  const onToggleMyLocation = () => {
    setIsMyLocation(!isMyLocation);
    if (!isMyLocation) {
      setMyLocation();
    }
  };
  const onMapMove = (lat: number, lng: number) => {
    setIsMyLocation(false);
    setMapLocation(lat, lng);
  };
  const onTogglePickup = () => {
    if (!pickup) {
      setPickup(true);
      return;
    }
    if (!delivery && !shipping) {
      return null;
    }
    setPickup(false);
  };
  const onToggleShipping = () => {
    if (!shipping) {
      setShipping(true);
      return;
    }
    if (!delivery && !pickup) {
      return null;
    }
    setShipping(false);
  };
  const onToggleDelivery = () => {
    if (!delivery) {
      setDelivery(true);
      return;
    }
    if (!pickup && !shipping) {
      return null;
    }
    setDelivery(false);
  };

  useEffect(() => {
    let label = "Inga leveranssätt";
    if (delivery) {
      label = "Hemtransport";
    }
    if (shipping) {
      label = "Fraktleverans";
    }
    if (pickup) {
      label = `Hämta själv • ${formatMetersToKm(pickupDistance)} km`;
    }
    if (
      (pickup && delivery) ||
      (pickup && shipping) ||
      (delivery && shipping)
    ) {
      label = "Flera leveranssätt";
    }
    if (pickup && delivery && shipping) {
      label = "Alla leveranssätt";
    }
    setTransportationLabel(label);
  }, [pickup, delivery, shipping]);

  const onApplyTranportationOptions = async () => {
    onApply({
      distance: pickup ? pickupDistance : undefined,
      location: pickup ? { lat: location[0], lng: location[1] } : undefined,
      pickup,
      shipping,
      delivery,
    });
  };

  return (
    <View style={{ gap: 16, marginTop: isDesktop ? 24 : 0 }}>
      {/**Pickup */}
      <ToggleCard
        title="Hämta själv hos säljaren"
        description="Du hämtar varan själv genom att kontakta säljaren för att bestämma tid och plats."
        enabled={!!pickup}
        offColor="disabled"
        onPress={onTogglePickup}
      >
        {pickup && (
          <View style={{ gap: 24 }}>
            <View style={{ gap: 12 }}>
              <Label size="medium">Välj max avstånd från dig</Label>
              <View
                style={[
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  },
                ]}
              >
                <Slider
                  type="continuous"
                  sliderProps={{
                    min: 1000,
                    max: 80000,
                    value: pickupDistance,
                    onChange: (v) => setPickupDistance(v),
                    width: isDesktop ? 290 : screenWidth * (3 / 5),
                  }}
                />
                <Body size="medium">{meterToKilometer(pickupDistance)} km</Body>
              </View>
            </View>
            <View style={{ gap: 12 }}>
              <Map
                lat={location[0]}
                lng={location[1]}
                zoomDisabled
                zoom={10}
                radius={pickupDistance}
                onMoveEnd={onMapMove}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 16,
                alignItems: "center",
              }}
            >
              <Check selected={isMyLocation} onPress={onToggleMyLocation} />
              <Body size="medium">Använd min plats</Body>
            </View>
          </View>
        )}
      </ToggleCard>

      {/**Shipping */}
      <ToggleCard
        title="Fraktleverans"
        description="Säljaren skickar varan till dig med ett transportbolag."
        enabled={shipping}
        onPress={onToggleShipping}
        offColor="disabled"
      />

      {/**Delivery */}
      <ToggleCard
        title="Hemtransport"
        description="Säljaren erbjuder hemleverans till dig."
        enabled={delivery}
        onPress={onToggleDelivery}
        offColor="disabled"
      />

      <Button
        label="Spara"
        onPress={() => onApplyTranportationOptions()}
        loading={loading}
      />
    </View>
  );
};
