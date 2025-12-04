import React, { useEffect } from "react";
import MapMarker from "@components/maps/map-marker";
import UserLocationMarker from "@components/maps/user-location-marker";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useDebounceCallback } from "usehooks-ts";
import { useMapContext } from "@context/map-context";
import { Bounds } from "@context/map-context";
import { MapProvider } from "@context/map-context";
import { StyleProp, View, ViewStyle } from "react-native";
import { Check } from "@components/controls/check";
import { Label } from "@components/typography/text";
import { LatLngExpression, Map as MapType } from "leaflet";

type Props = {
  style?: StyleProp<ViewStyle>;
};

export default function InteractiveMap({ style }: Props) {
  return (
    <View style={[{ overflow: "hidden", height: 624 }, style]}>
      <MapProvider>
        <Map />
      </MapProvider>
    </View>
  );
}

const Map = () => {
  const { state, setState } = useMapContext();

  return (
    <MapContainer
      center={state.center}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      attributionControl={false}
      doubleClickZoom={false}
      maxZoom={16}
      minZoom={5}
    >
      <Controller />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <UserLocationMarker position={state.center} />

      <View
        nativeID="show-price"
        style={{
          position: "absolute",
          left: 16,
          top: 16,
          width: 107,
          backgroundColor: "white",
          paddingHorizontal: 8,
          paddingVertical: 10,
          borderRadius: 12,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 10,
          zIndex: 1000,
          opacity: 0.8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Check
            selected={state.showPrice}
            onPress={() => setState({ showPrice: !state.showPrice })}
          />
          <Label size="small">
            {state.showPrice ? "Göm pris" : "Visa pris"}
          </Label>
        </View>
      </View>

      {state.pins.map((pin) => {
        const key = `${pin.location.lat},${pin.location.lng}`;
        return <MapMarker key={key} pin={pin} />;
      })}

      {state.activePin?.popup && (
        <View
          nativeID="active-pin-popup"
          style={{
            position: "absolute",
            right: 16,
            bottom: 16,
            width: 149,
            backgroundColor: "white",
            paddingHorizontal: 8,
            paddingVertical: 10,
            borderRadius: 18,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 10,
            zIndex: 1000,
          }}
        >
          {state.activePin.popup}
        </View>
      )}
    </MapContainer>
  );
};

const Controller = () => {
  const { state, setState } = useMapContext();
  const map = useMap();

  const boundDebounce = useDebounceCallback((bounds: Bounds) => {
    setState({ bounds });
  }, 500);

  const zoomDebounce = useDebounceCallback((zoom: number) => {
    setState({ zoom });
  }, 500);

  const flyToDebounce = useDebounceCallback(
    (center: LatLngExpression, mapInstance: MapType) => {
      mapInstance.whenReady(() => {
        mapInstance.flyTo(center, 13, {
          animate: true,
          duration: 0.5,
        });
      });
    },
    500,
  );

  useEffect(() => {
    flyToDebounce(state.center, map);
  }, [state.center, map]);

  useMapEvents({
    click: (e) => {
      const target = e.originalEvent.target as HTMLElement;

      if (
        target.closest("#active-pin-popup") ||
        target.closest("#show-price")
      ) {
        return;
      }
      setState({ activePin: undefined });
    },
    moveend: (e) => {
      const bounds = e.target.getBounds();
      const northEast = bounds.getNorthEast();
      const southWest = bounds.getSouthWest();

      boundDebounce({
        northEast: { lat: northEast.lat, lng: northEast.lng },
        southWest: { lat: southWest.lat, lng: southWest.lng },
      });
    },
    zoomend: (e) => {
      const zoom = e.target.getZoom();
      zoomDebounce(zoom);
    },
  });

  return null;
};
