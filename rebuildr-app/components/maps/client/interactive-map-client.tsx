/**
 * This file can only be rendered while window is defined.
 */

import React, { useEffect, useState } from "react";
import MapMarker from "@components/maps/map-marker";
import UserLocationMarker from "@components/maps/user-location-marker";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import { useDebounceCallback } from "usehooks-ts";
import { useMapContext } from "@context/map-context";
import { View, Pressable, useWindowDimensions } from "react-native";
import { Check } from "@components/controls/check";
import { Label, Body } from "@components/typography/text";
import { Divider } from "@components/dividers/divider";
import { Icon } from "@icons/icon";
import { useThemeColor } from "@hooks/useThemeColor";
import { useScreenType } from "@hooks/useScreenType";
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
      maxZoom={17}
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
      setState({ activePin: undefined, selectedProductId: undefined });
    },
    moveend: () => boundDebounce(),
    zoomend: () => zoomDebounce(),
  });

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    map.whenReady(() => {
      map.setView(state.center, 13);
    });

    boundDebounce();
  }, [state.center]);

  // When auto-search is on, keep the applied search area in sync with the
  // viewport so the results list follows every pan/zoom.
  useEffect(() => {
    if (state.searchOnMove && state.bounds) {
      setState({ searchArea: state.bounds });
    }
  }, [state.bounds, state.searchOnMove]);

  // Zoom out on request (e.g. the empty-results state). Reset after consuming
  // so it can't re-fire if the map remounts.
  useEffect(() => {
    if (state.zoomOutSignal > 0) {
      map.whenReady(() => {
        map.setZoom(map.getZoom() - 2, { animate: false });
      });
      setState({ zoomOutSignal: 0 });
    }
  }, [state.zoomOutSignal]);

  // Frame a requested region (e.g. the user + their nearest hit on "Nära mig").
  // animate:false is deliberate — Leaflet's zoom-animation path can throw
  // "_leaflet_pos of undefined" on large jumps while markers re-render. Clear
  // after consuming so a remount doesn't yank the viewport back to it.
  useEffect(() => {
    if (!state.fitBounds) return;
    const { northEast, southWest } = state.fitBounds;
    map.whenReady(() => {
      map.fitBounds(
        [
          [northEast.lat, northEast.lng],
          [southWest.lat, southWest.lng],
        ],
        { padding: [60, 60], maxZoom: 14, animate: false },
      );
    });
    setState({ fitBounds: undefined });
  }, [state.fitBounds]);

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
              type={MapPinTypeEnum.Project}
              title="Projekt"
              description="Projektförsäljning av varor"
            />
            <MapIconInfo
              type={MapPinTypeEnum.Product}
              title="Annons"
              description="Enskild vara till försäljning"
            />
            {state.searchScope === "public" && (
              <>
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
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const POPUP_COMPACT_WIDTH = 163;
const POPUP_ROOMY_WIDTH = 288;
// Keep the compact size on laptops (it felt right there) and only grow toward
// the roomy size on large monitors. Tune the breakpoints if your screens differ.
const POPUP_GROW_START = 1500;
const POPUP_GROW_END = 1920;

const ActivePinController = () => {
  const { state } = useMapContext();
  const { isDesktop } = useScreenType();
  const { width: windowWidth } = useWindowDimensions();
  const activePin = state.activePin;
  if (!activePin) return null;

  const growth = Math.max(
    0,
    Math.min(
      1,
      (windowWidth - POPUP_GROW_START) / (POPUP_GROW_END - POPUP_GROW_START),
    ),
  );
  const width = isDesktop
    ? Math.round(
        POPUP_COMPACT_WIDTH +
          growth * (POPUP_ROOMY_WIDTH - POPUP_COMPACT_WIDTH),
      )
    : POPUP_COMPACT_WIDTH;
  const roomy = width >= 240;

  return (
    <View
      nativeID="active-pin-controller"
      style={{
        position: "absolute",
        right: 16,
        bottom: 16,
        width,
        backgroundColor: "white",
        paddingHorizontal: roomy ? 12 : 8,
        paddingVertical: roomy ? 12 : 10,
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
