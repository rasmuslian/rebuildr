import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import MapThumbnail from "@components/maps/map-thumbnail";

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
      <MapThumbnail
        coords={[location.lat, location.lng]}
        style={{ height: 700 }}
      />
    </BottomSheet>
  );
};
