import { View } from "react-native";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Map } from "@components/maps/map";
import { mapDefaultApproximateRadiusLarge } from "@constants/map";

type Props = {
  open: boolean;
  onDismiss: () => void;
  location: { lat: number; lng: number };
};

export const PickupPositionBottomSheet = ({
  open,
  onDismiss,
  location,
}: Props) => {
  return (
    <BottomSheet
      open={open}
      onDismiss={onDismiss}
      name="map"
      title="Plats för avhämtning"
      screenHeight
    >
      <View>
        <Map
          lat={location.lat}
          lng={location.lng}
          interactive={false}
          radius={mapDefaultApproximateRadiusLarge}
          height={700}
        />
      </View>
    </BottomSheet>
  );
};
