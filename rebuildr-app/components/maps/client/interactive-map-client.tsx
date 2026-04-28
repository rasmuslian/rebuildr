/**
 * This file can only be rendered while window is defined.
 */

import React, { useEffect, useState } from "react";
import MapMarker from "@components/maps/map-marker";
import UserLocationMarker from "@components/maps/user-location-marker";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import { useDebounceCallback } from "usehooks-ts";
import { useMapContext } from "@context/map-context";
import { View, Pressable } from "react-native";
import { Check } from "@components/controls/check";
import { Label, Body } from "@components/typography/text";
import { Divider } from "@components/dividers/divider";
import { Icon } from "@icons/icon";
import { useThemeColor } from "@hooks/useThemeColor";
import { getMarkerSvg } from "@/utils/map-pin/get-marker-svg";
import { Image } from "expo-image";

import "leaflet/dist/leaflet.css";
import { MapPinTypeEnum } from "@/gql/graphql";

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
      <MapInformationController />
      <ActivePinController />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <UserLocationMarker position={state.userLocation} />
      {state.mapPinGroups.map((mapPinGroup) => {
        const key = `${mapPinGroup.location.lat},${mapPinGroup.location.lng}`;
        return <MapMarker key={key} mapPinGroup={mapPinGroup} />;
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
        target.closest("#map-information-controller") ||
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

type MapIconInfoProps = {
  type: MapPinTypeEnum;
  title: string;
  description: string;
};

const MapIconInfo = ({ type, title, description }: MapIconInfoProps) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
    <Image
      source={getMarkerSvg(type, false).uri}
      style={{ width: 30, height: 30 }}
    />

    <View style={{ gap: 5, width: 190 }}>
      <Label size="medium">{title}</Label>
      <Body size="small" color="secondary">
        {description}
      </Body>
    </View>
  </View>
);

const MapInformationController = () => {
  const { state, setState } = useMapContext();
  const [isOpen, setIsOpen] = useState(false);
  const colors = useThemeColor();

  return (
    <View
      nativeID="map-information-controller"
      style={{
        position: "absolute",
        left: 16,
        top: 16,
        zIndex: 1000,
        gap: 10,
      }}
    >
      <View
        style={{
          alignSelf: "flex-start",
          backgroundColor: "white",
          borderRadius: 12,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 10,
          opacity: 0.8,
        }}
      >
        <Pressable
          onPress={() => setIsOpen(!isOpen)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Label size="small">Kartinfo</Label>
          <Icon icon={isOpen ? "chevronUp" : "chevronDown"} size={14} />
        </Pressable>
      </View>

      {isOpen && (
        <View
          style={{
            width: 263,
            backgroundColor: "white",
            borderRadius: 12,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 10,
          }}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 16,
              gap: 16,
            }}
          >
            <Label size="medium" color="secondary">
              Kartikon visar
            </Label>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                width: 107,
                backgroundColor: colors.buttons.outlinedFill.focused,
                padding: 8,
                borderRadius: 12,
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

          <Divider />

          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 16,
              gap: 16,
            }}
          >
            <Label size="medium" color="secondary">
              Förklaring kartikon
            </Label>

            <MapIconInfo
              type={MapPinTypeEnum.Product}
              title="Annons"
              description="Enskild vara till försäljning"
            />
            <MapIconInfo
              type={MapPinTypeEnum.Project}
              title="Projekt"
              description="Projektförsäljning av varor"
            />
            <MapIconInfo
              type={MapPinTypeEnum.Hub}
              title="Företagsförsäljning"
              description="Försäljning från företag"
            />
            <MapIconInfo
              type={MapPinTypeEnum.Featured}
              title="RebuildR Hub"
              description="Inlämning och försäljning från lager"
            />
          </View>
        </View>
      )}
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
        width: 163,
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
