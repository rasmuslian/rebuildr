import { borderRadius } from "@constants/sizes";
import {
  MapContainer,
  MapContainerProps,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { View } from "react-native";
import { Image } from "expo-image";
import mapPin from "@assets/images/map-pin.png";
import mapEllipse from "@assets/images/map-ellipse.png";
import { useEffect } from "react";

type MapProps = {
  lat: number;
  lng: number;
  interactive?: boolean;
  onMoveEnd?: (lat: number, lng: number) => void;
  radius?: number;
};

export const Map = ({
  lat,
  lng,
  interactive = true,
  onMoveEnd,
  radius,
  ...props
}: MapProps & MapContainerProps) => {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={props.zoom ?? 14}
      style={{
        height: 185,
        width: "100%",
        borderRadius: borderRadius.medium,
      }}
      scrollWheelZoom={interactive}
      dragging={interactive}
      zoomControl={false}
    >
      <TileLayer
        minZoom={0}
        maxZoom={20}
        // attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.{ext}"
        ext="png"
      />
      <InnerMap lat={lat} lng={lng} onMoveEnd={onMoveEnd} />
      {radius ? (
        <View
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 999,
          }}
        >
          <Image
            source={{ uri: mapEllipse.uri }}
            alt="centered ellipse"
            style={{ width: 124, height: 124 }}
          />
        </View>
      ) : (
        <View
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -100%)",
            zIndex: 999,
          }}
        >
          <Image
            source={{ uri: mapPin.uri }}
            alt="center pin"
            style={{ width: 40, height: 40 }}
          />
        </View>
      )}
    </MapContainer>
  );
};

const InnerMap = ({ lat, lng, onMoveEnd }: MapProps) => {
  const map = useMap();
  useMapEvents({
    moveend: onMoveEnd
      ? (e) => {
          const center = e?.target.getCenter();
          onMoveEnd(center.lat, center.lng);
        }
      : undefined,
  });

  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng]);

  return null;
};
