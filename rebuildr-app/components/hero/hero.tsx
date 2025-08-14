import { View, ImageBackground, Animated } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import { Headline } from "@components/typography/text";
import { SearchBar } from "@components/search/search-bar";
import { useDebounceCallback } from "usehooks-ts";
import React, { useState } from "react";

type Props = {
  scrollY: Animated.Value;
};

export default function Hero({ scrollY }: Props) {
  const colors = useThemeColor();
  const [headlineHeight, setHeadlineHeight] = useState(0);

  const onChangeText = useDebounceCallback((value) => {
    // TODO: Call api endpoint.
    console.log("value :>> ", value);
  }, 400);

  return (
    <ImageBackground
      source={require("@assets/images/main-background.png")}
      resizeMode="cover"
      style={{
        backgroundColor: colors.logo.vector,
        width: "100%",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          paddingVertical: 24,
          paddingHorizontal: 16,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Animated.View
          style={{
            opacity: scrollY.interpolate({
              inputRange: [0, headlineHeight],
              outputRange: [1, 0],
              extrapolate: "clamp",
            }),
            height: scrollY.interpolate({
              inputRange: [0, headlineHeight],
              outputRange: [headlineHeight, 0],
              extrapolate: "clamp",
            }),
            overflow: "hidden",
          }}
        >
          <Headline
            onLayout={(e) => setHeadlineHeight(e.nativeEvent.layout.height)}
            size="small"
            style={{
              color: colors.logo.background,
              paddingBottom: 12,
            }}
          >
            Sveriges marknadsplats för återbrukat byggmaterial
          </Headline>
        </Animated.View>

        <SearchBar
          style={{ borderBottomWidth: 0 }}
          placeholder="Vad letar du efter? "
          onChange={onChangeText}
        />
      </View>
    </ImageBackground>
  );
}
