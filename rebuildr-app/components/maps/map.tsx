import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { MapProps } from "./map-web";

export default function Map(props: MapProps) {
  const [Map, setMap] = useState<React.ComponentType<MapProps> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    (async () => {
      const mod = await import("./map-web");
      setMap(() => mod.default);
    })();
  }, []);

  if (!Map) return <View />;

  return <Map {...props} />;
}
