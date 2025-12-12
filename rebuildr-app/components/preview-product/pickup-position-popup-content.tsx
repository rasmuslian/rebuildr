import { View } from "react-native";
import { Body, Headline } from "@components/typography/text";
import MapThumbnail from "@components/maps/map-thumbnail";

type Props = {
  address: string;
  location: { lat: number; lng: number };
  markerType: "product" | "project";
};

export const PickupPositionPopupContent = ({
  address,
  location,
  markerType,
}: Props) => {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View style={{ padding: 24, width: "70%" }}>
        <Headline size="small" style={{ marginBottom: 16 }}>
          Plats för avhämtning
        </Headline>
        <Body size="medium" color="primaryDark" style={{ marginBottom: 16 }}>
          {address}
        </Body>
        <Body size="small" color="secondary" style={{ marginBottom: 24 }}>
          Ungefärligt område. Adress visas först när ett köp har genomförts.
        </Body>
        <MapThumbnail
          coords={[location.lat, location.lng]}
          markerType={markerType}
          style={{ height: 700 }}
        />
      </View>
    </View>
  );
};
