import React, { useState, useEffect } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { MapProvider } from "@context/map-context";

type Props = {
  style?: StyleProp<ViewStyle>;
};

export default function InteractiveMap({ style }: Props) {
  const [Map, setMap] = useState<React.ComponentType<Props> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    (async () => {
      const mod = await import("./interactive-map-web");
      setMap(() => mod.default);
    })();
  }, []);

  return (
    <View style={[{ overflow: "hidden", height: 624 }, style]}>
      {Map && (
        <MapProvider>
          <Map />
        </MapProvider>
      )}
    </View>
  );
}
