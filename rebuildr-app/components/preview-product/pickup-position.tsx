import { Body, Headline } from "@components/typography/text";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { Map } from "@components/maps/map";
import { useRef } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";

type Props = {
  address: string;
  location: { lat: number; lng: number };
};

export const PickupPosition = ({ address, location }: Props) => {
  const mapRef = useRef<BottomSheetModal>(null);

  return (
    <>
      <View>
        <Headline size="small" style={{ marginBottom: 16 }}>
          Plats för avhämtning
        </Headline>
        <Pressable onPress={() => mapRef.current?.present()}>
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
        ref={mapRef}
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
