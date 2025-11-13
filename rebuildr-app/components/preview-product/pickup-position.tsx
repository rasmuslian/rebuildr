import { Body, Headline } from "@components/typography/text";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { Map } from "@components/maps/map";
import { useState } from "react";
import { PickupPositionBottomSheet } from "./pickup-position-bottom-sheet";
import { useScreenType } from "@hooks/useScreenType";
import { PickupPositionPopupContent } from "./pickup-position-popup-content";
import { usePopupContext } from "@context/popup-context";
import { mapDefaultApproximateRadiusLarge } from "@constants/map";

type Props = {
  address: string;
  location: { lat: number; lng: number };
};

export const PickupPosition = ({ address, location }: Props) => {
  const [showMap, setShowMap] = useState(false);
  const { setVisible, setContent } = usePopupContext();
  const { isMobile } = useScreenType();

  const handleOnPress = () => {
    if (isMobile) {
      setShowMap(true);
    } else {
      setContent(
        <PickupPositionPopupContent address={address} location={location} />,
      );
      setVisible("full");
    }
  };

  return (
    <>
      <View>
        <Headline size="small" style={{ marginBottom: 16 }}>
          Plats för avhämtning
        </Headline>
        <Pressable onPress={handleOnPress}>
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
      </View>
      {isMobile && (
        <PickupPositionBottomSheet
          open={showMap}
          onDismiss={() => setShowMap(false)}
          location={location}
        />
      )}
    </>
  );
};
