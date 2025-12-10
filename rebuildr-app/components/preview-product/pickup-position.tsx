import { Body, Headline, Label } from "@components/typography/text";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { Map } from "@components/maps/map";
import { useState } from "react";
import { PickupPositionBottomSheet } from "./pickup-position-bottom-sheet";
import { useScreenType } from "@hooks/useScreenType";
import { PickupPositionPopupContent } from "./pickup-position-popup-content";
import { mapDefaultApproximateRadiusLarge } from "@constants/map";
import { Popup } from "@components/popup/popup";
import { formatMetersToKm } from "@/utils/distanceHandling";

type Props = {
  address: string;
  location: { lat: number; lng: number };
  distanceFromLocation?: number | null;
};

export const PickupPosition = ({
  address,
  location,
  distanceFromLocation,
}: Props) => {
  const [showMap, setShowMap] = useState(false);
  const { isMobile } = useScreenType();

  return (
    <>
      <View>
        <Headline size="small" style={{ marginBottom: 16 }}>
          Plats för avhämtning
        </Headline>
        <Pressable onPress={() => setShowMap(true)}>
          <Map
            lat={location.lat}
            lng={location.lng}
            interactive={false}
            radius={mapDefaultApproximateRadiusLarge}
            zoom={10}
          />
        </Pressable>
        <Body size="medium" style={{ marginTop: 16, marginBottom: 12 }}>
          {address}
        </Body>
        <Body size="small" color="secondary">
          Ungefärligt område. Adress visas först när ett köp har genomförts.
        </Body>
        {!!distanceFromLocation && (
          <Body size="medium" style={{ marginTop: 16 }}>
            Avstånd från nuvarande plats:{" "}
            <Label size="large">
              {formatMetersToKm(distanceFromLocation)} km
            </Label>
          </Body>
        )}
      </View>
      {isMobile ? (
        <PickupPositionBottomSheet
          open={showMap}
          onDismiss={() => setShowMap(false)}
          location={location}
        />
      ) : (
        <Popup open={showMap} onClose={() => setShowMap(false)} type="full">
          <PickupPositionPopupContent address={address} location={location} />
        </Popup>
      )}
    </>
  );
};
