import { ReactElement, useEffect } from "react";
import { StyleProp, ViewStyle, View } from "react-native";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { borderRadius } from "@constants/sizes";

type Props = {
  style?: StyleProp<ViewStyle>;
  cta?: ReactElement;
  coords?: LatLngExpression;
};

export default function MapThumbnail({ style, cta, coords }: Props) {
  return (
    <View
      style={[
        { overflow: "hidden", height: 80, borderRadius: borderRadius.medium },
        style,
      ]}
    >
      <MapContainer
        center={[62.0, 15.0]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
      >
        <Controller coords={coords} />

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
      </MapContainer>
    </View>
  );
}

type ControllerProps = {
  coords?: LatLngExpression;
};

const Controller = ({ coords }: ControllerProps) => {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 13, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [coords]);

  return null;
};
