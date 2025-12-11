import { ReactElement, useMemo } from "react";
import { StyleProp, ViewStyle, View } from "react-native";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { borderRadius } from "@constants/sizes";
import { defaultCenter } from "@constants/map";
import { createMarkerIcon } from "./create-marker-icon";

type Props = {
  coords?: LatLngExpression;
  cta?: ReactElement;
  markerType?: "product" | "project";
  style?: StyleProp<ViewStyle>;
};

export default function MapThumbnail({
  coords = defaultCenter,
  cta,
  markerType,
  style,
}: Props) {
  const iconSource =
    markerType === "project"
      ? "/icons/project-marker-dark.svg"
      : "/icons/product-marker-dark.svg";

  const markerIcon = useMemo(() => {
    return createMarkerIcon({ iconSource });
  }, [markerType]);

  return (
    <View
      style={[
        { overflow: "hidden", height: 80, borderRadius: borderRadius.medium },
        style,
      ]}
    >
      <MapContainer
        center={coords}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {cta && (
          <View
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 999,
            }}
          >
            {cta}
          </View>
        )}

        {markerType && <Marker position={coords} icon={markerIcon}></Marker>}
      </MapContainer>
    </View>
  );
}
