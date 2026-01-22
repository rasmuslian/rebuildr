import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { MapProps } from "./client/map-client";

export default function Map(props: MapProps) {
  const [Map, setMap] = useState<React.ComponentType<MapProps> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    (async () => {
      const mod = await import("./client/map-client");
      setMap(() => mod.default);
    })();
  }, []);

  if (!Map) return <View />;

  return <Map {...props} />;
}
