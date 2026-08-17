import React, { useState, useEffect } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { MapProvider } from "@context/map-context";
import { ProductsInput, ProjectsInput } from "@/gql/graphql";

type Props = {
  style?: StyleProp<ViewStyle>;
  initialCenter?: { lat: number; lng: number };
  productsInput?: ProductsInput;
  projectsInput?: ProjectsInput;
};

/**
 * The map canvas alone — lazily loads the web-only leaflet client and assumes a
 * MapProvider already exists in an ancestor. Use this when the surrounding UI
 * needs to share the map state (bounds, search area, selection); otherwise use
 * the default InteractiveMap which brings its own provider.
 */
export function MapCanvas({ style }: { style?: StyleProp<ViewStyle> }) {
  const [Map, setMap] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    (async () => {
      const mod = await import("./client/interactive-map-client");
      setMap(() => mod.default);
    })();
  }, []);

  return (
    <View style={[{ overflow: "hidden", height: 624 }, style]}>
      {Map && <Map />}
    </View>
  );
}

export default function InteractiveMap({
  style,
  initialCenter,
  productsInput,
  projectsInput,
}: Props) {
  return (
    <MapProvider
      initialCenter={initialCenter}
      productsInput={productsInput}
      projectsInput={projectsInput}
    >
      <MapCanvas style={style} />
    </MapProvider>
  );
}
