import React, { useState, useEffect } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { MapProvider } from "@context/map-context";
import { ProductsInput, ProjectsInput } from "@/gql/graphql";

type Props = {
  style?: StyleProp<ViewStyle>;
  initialCenter?: { lat: number; lng: number };
  productsInput?: ProductsInput;
  projectsInput?: ProjectsInput;
  searchScope?: "public" | "internal";
};

export default function InteractiveMap({
  style,
  initialCenter,
  productsInput,
  projectsInput,
  searchScope,
}: Props) {
  const [Map, setMap] = useState<React.ComponentType<Props> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    (async () => {
      const mod = await import("./client/interactive-map-client");
      setMap(() => mod.default);
    })();
  }, []);

  return (
    <View style={[{ overflow: "hidden", height: 624 }, style]}>
      {Map && (
        <MapProvider
          initialCenter={initialCenter}
          productsInput={productsInput}
          projectsInput={projectsInput}
          searchScope={searchScope}
        >
          <Map />
        </MapProvider>
      )}
    </View>
  );
}
