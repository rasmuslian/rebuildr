/**
 * This file can only be rendered while window is defined.
 */

import { ReactElement, useMemo } from "react";
import { StyleProp, ViewStyle, View } from "react-native";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { defaultCenter } from "@constants/map";
import { createMarkerIcon } from "@components/maps/create-marker-icon";

import "leaflet/dist/leaflet.css";
import { MapPinTypeEnum } from "@/gql/graphql";
import { getMarkerSvg } from "@/utils/map-pin/get-marker-svg";

export type Props = {
  coords?: LatLngExpression;
  cta?: ReactElement;
  markerType?: MapPinTypeEnum;
  style?: StyleProp<ViewStyle>;
};

export default function MapThumbnailClient({
  coords = defaultCenter,
  cta,
  markerType = MapPinTypeEnum.Product,
}: Props) {
  const markerIcon = useMemo(() => {
    return createMarkerIcon({
      iconSource: getMarkerSvg(markerType, false).uri,
    });
  }, [markerType]);

  return (
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

      {markerType && <Marker position={coords} icon={markerIcon} />}
    </MapContainer>
  );
}
