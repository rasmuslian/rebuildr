import { Body, Headline } from "@components/typography/text";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { Map } from "@components/maps/map";
import { useState } from "react";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";

type Props = {
  address: string;
  location: { lat: number; lng: number };
};

export const PickupPosition = ({ address, location }: Props) => {
  const [showMap, setShowMap] = useState(false);

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
            radius={5000}
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
      <BottomSheet
        open={showMap}
        onDismiss={() => setShowMap(false)}
        name="map"
        title="Plats för avhämtning"
        screenHeight
      >
        <View>
          <Map
            lat={location.lat}
            lng={location.lng}
            interactive={false}
            radius={5000}
            height={700}
          />
        </View>
      </BottomSheet>
    </>
  );
};
