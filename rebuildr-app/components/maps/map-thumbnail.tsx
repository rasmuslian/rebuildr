import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { borderRadius } from "@constants/sizes";

import { Props } from "./map-thumbnail-web";

export default function MapThumbnail(props: Props) {
  const [Map, setMap] = useState<React.ComponentType<Props> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    (async () => {
      const mod = await import("./map-thumbnail-web");
      setMap(() => mod.default);
    })();
  }, []);

  return (
    <View
      style={[
        { overflow: "hidden", height: 80, borderRadius: borderRadius.medium },
        props.style,
      ]}
    >
      {Map && <Map {...props} />}
    </View>
  );
}
