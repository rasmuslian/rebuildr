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
  radius?: number; //in meters
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
      zoomSnap={0.1}
      zoomDelta={1}
      wheelPxPerZoomLevel={1}
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
      <InnerMap
        lat={lat}
        lng={lng}
        onMoveEnd={onMoveEnd}
        radius={radius}
        interactive={interactive}
      />
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

const InnerMap = ({ lat, lng, onMoveEnd, radius, interactive }: MapProps) => {
  const map = useMap();
  useMapEvents(
    onMoveEnd
      ? {
          dragend: (e) => {
            const center = e?.target.getCenter();
            if (center.lat !== lat || center.lng !== lng) {
              onMoveEnd(center.lat, center.lng);
            }
          },
        }
      : {},
  );

  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng]);

  useEffect(() => {
    if (!radius) {
      return;
    }
    const center = map.getCenter();
    const latRad = center.lat * (Math.PI / 180);

    //approximate meters per pixel. Copied from chatGPT and stack overflow.
    const metresPerPixelZoom = (zoom: number) =>
      (156543.03392 * Math.abs(Math.cos(latRad))) / Math.pow(2, zoom);

    const targetMetersPerPixel = radius / 62;

    let zoom = 0;
    for (let z = 20; z >= 0; z -= 0.1) {
      // Check zoom levels 0-20
      if (metresPerPixelZoom(z) <= targetMetersPerPixel) {
        zoom = z;
      }
    }
    map.setZoom(zoom);
  }, [radius]);

  useEffect(() => {
    if (interactive === true) {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
    }
    if (interactive === false) {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
    }
  }, [interactive]);

  return null;
};
