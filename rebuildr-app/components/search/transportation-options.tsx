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
import { formatDistance } from "@/utils/formattings";
import { Check } from "@components/controls/check";

export type TransportationFilterOptions = Pick<
  ProductsInput,
  "distance" | "location" | "pickup" | "shipping" | "delivery"
>;

export type PersistedTransportationFilterOptions =
  TransportationFilterOptions & {
    useMyLocation: boolean;
  };

export const defaultTransportationFilterOptions: PersistedTransportationFilterOptions =
  {
    distance: defaultRadius,
    location: undefined,
    pickup: true,
    shipping: true,
    delivery: true,
    useMyLocation: false,
  };

export const getTransportationLabel = (
  options: Pick<
    PersistedTransportationFilterOptions,
    "pickup" | "shipping" | "delivery" | "distance"
  >,
) => {
  let label = "Inga leveranssätt";

  if (options.delivery) {
    label = "Hemtransport";
  }
  if (options.shipping) {
    label = "Fraktleverans";
  }
  if (options.pickup) {
    label = `Hämta själv • ${formatMetersToKm(options.distance)} km`;
  }
  if (
    (options.pickup && options.delivery) ||
    (options.pickup && options.shipping) ||
    (options.delivery && options.shipping)
  ) {
    label = "Flera leveranssätt";
  }
  if (options.pickup && options.delivery && options.shipping) {
    label = "Alla leveranssätt";
  }

  return label;
};

type Props = {
  data?: SearchProductsQuery;
  loading?: boolean;
  setTransportationLabel: (label: string) => void;
  initialOptions?: PersistedTransportationFilterOptions;
  onApply: (transportationInput: PersistedTransportationFilterOptions) => void;
};

export const TransportationOptions = ({
  data,
  loading,
  setTransportationLabel,
  initialOptions = defaultTransportationFilterOptions,
  onApply,
}: Props) => {
  const [pickup, setPickup] = useState(initialOptions.pickup);
  const [pickupDistance, setPickupDistance] = useState(
    initialOptions.distance ?? defaultRadius,
  );
  const [isMyLocation, setIsMyLocation] = useState(
    initialOptions.useMyLocation,
  );
  const [shipping, setShipping] = useState(initialOptions.shipping);
  const [delivery, setDelivery] = useState(initialOptions.delivery);
  const { isDesktop } = useScreenType();
  const { width: screenWidth } = useWindowDimensions();

  const { location, setMyLocation, setMapLocation } = useLocationAddress({
    location: initialOptions.location ??
      data?.me?.location ?? {
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
    setTransportationLabel(
      getTransportationLabel({
        pickup,
        shipping,
        delivery,
        distance: pickupDistance,
      }),
    );
  }, [pickup, delivery, shipping, pickupDistance, setTransportationLabel]);

  const onApplyTranportationOptions = async () => {
    onApply({
      distance: pickup ? pickupDistance : undefined,
      location: pickup ? { lat: location[0], lng: location[1] } : undefined,
      pickup,
      shipping,
      delivery,
      useMyLocation: isMyLocation,
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
                    max: 1500000,
                    value: pickupDistance,
                    onChange: (v) => setPickupDistance(v),
                    width: isDesktop ? 290 : screenWidth * (3 / 5),
                  }}
                />
                <Body size="medium">{formatDistance(pickupDistance)} km</Body>
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
