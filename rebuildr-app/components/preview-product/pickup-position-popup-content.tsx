import { View } from "react-native";
import { Map } from "@components/maps/map";
import { Body, Headline } from "@components/typography/text";
import { mapDefaultApproximateRadiusLarge } from "@constants/map";

type Props = {
  address: string;
  location: { lat: number; lng: number };
};

export const PickupPositionPopupContent = ({ address, location }: Props) => {
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
        <Map
          lat={location.lat}
          lng={location.lng}
          interactive={false}
          radius={mapDefaultApproximateRadiusLarge}
          height={700}
        />
      </View>
    </View>
  );
};
