import React, { useState, useEffect } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { MapProvider } from "@context/map-context";
import { ProductsInput } from "@/gql/graphql";

type Props = {
  style?: StyleProp<ViewStyle>;
  initialCenter?: { lat: number; lng: number };
  productsInput?: ProductsInput;
};

export default function InteractiveMap({
  style,
  initialCenter,
  productsInput,
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
        >
          <Map />
        </MapProvider>
      )}
    </View>
  );
}
