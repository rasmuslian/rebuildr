/**
 * This file can only be rendered when window is defined.
 */

import React, { useEffect } from "react";
import MapMarker from "@components/maps/map-marker";
import UserLocationMarker from "@components/maps/user-location-marker";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import { useDebounceCallback } from "usehooks-ts";
import { useMapContext } from "@context/map-context";
import { View, Pressable } from "react-native";
import { Check } from "@components/controls/check";
import { Label } from "@components/typography/text";
import { Divider } from "@components/dividers/divider";
import { Icon } from "@icons/icon";

import "leaflet/dist/leaflet.css";

export default function InteractiveMapClient() {
  const { state } = useMapContext();

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
      <EventController />
      <ZoomController />
      <NavigationController />
      <PriceController />
      <ActivePinController />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <UserLocationMarker position={state.center} />

      {state.pins.map((pin) => {
        const key = `${pin.location.lat},${pin.location.lng}`;
        return <MapMarker key={key} pin={pin} />;
      })}
    </MapContainer>
  );
}

const EventController = () => {
  const { state, setState } = useMapContext();
  const map = useMap();

  const boundDebounce = useDebounceCallback(() => {
    map.whenReady(() => {
      const bounds = map.getBounds();
      const northEast = bounds.getNorthEast();
      const southWest = bounds.getSouthWest();
      setState({ bounds: { northEast, southWest } });
    });
  }, 500);

  const zoomDebounce = useDebounceCallback(() => {
    map.whenReady(() => {
      const zoom = map.getZoom();
      if (zoom) {
        setState({ zoom });
      }
    });
  }, 500);

  useMapEvents({
    click: (e) => {
      const target = e.originalEvent.target as HTMLElement;

      if (
        target.closest("#active-pin-controller") ||
        target.closest("#price-controller") ||
        target.closest("#zoom-controller") ||
        target.closest("#navigation-controller")
      ) {
        return;
      }
      setState({ activePin: undefined });
    },
    moveend: () => boundDebounce(),
    zoomend: () => zoomDebounce(),
  });

  useEffect(() => {
    map.whenReady(() => {
      map.setView(state.center, 13);
    });

    boundDebounce();
  }, [state.center]);

  return null;
};

const ZoomController = () => {
  const map = useMap();

  return (
    <View
      nativeID="zoom-controller"
      style={{
        position: "absolute",
        right: 16,
        top: 16,
        backgroundColor: "white",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        zIndex: 1000,
        opacity: 0.8,
      }}
    >
      <Pressable
        onPress={() => map.zoomIn()}
        style={{
          padding: 8,
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon icon="+" size={18} />
      </Pressable>

      <Divider />

      <Pressable
        onPress={() => map.zoomOut()}
        style={{
          padding: 8,
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon icon="-" size={18} />
      </Pressable>
    </View>
  );
};

const PriceController = () => {
  const { state, setState } = useMapContext();

  return (
    <View
      nativeID="price-controller"
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
        <Label size="small">{state.showPrice ? "Göm pris" : "Visa pris"}</Label>
      </View>
    </View>
  );
};

const ActivePinController = () => {
  const { state } = useMapContext();
  const activePin = state.activePin;
  if (!activePin) return null;

  return (
    <View
      nativeID="active-pin-controller"
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
      {activePin.popup}
    </View>
  );
};

const NavigationController = () => {
  const { state } = useMapContext();
  const map = useMap();

  return (
    <View
      nativeID="navigation-controller"
      style={{
        position: "absolute",
        right: 16,
        top: 110,
        backgroundColor: "white",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        zIndex: 1000,
        opacity: 0.8,
      }}
    >
      <Pressable
        onPress={() => {
          map.whenReady(() => {
            map.flyTo(state.center, 13, { animate: true, duration: 0.5 });
          });
        }}
        style={{
          padding: 8,
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon icon="navigation" size={18} />
      </Pressable>
    </View>
  );
};
