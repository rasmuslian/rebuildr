import { View, ImageBackground, Animated } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import { Headline } from "@components/typography/text";
import { SearchBar } from "@components/search/search-bar";
import React, { useState } from "react";
import { router } from "expo-router";

type Props = {
  scrollY: Animated.Value;
  headline: string;
  searchBar: string;
};

export default function HeroMobile({ scrollY, headline, searchBar }: Props) {
  const colors = useThemeColor();
  const [headlineHeight, setHeadlineHeight] = useState(0);

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
            {headline}
          </Headline>
        </Animated.View>

        <SearchBar
          style={{ borderBottomWidth: 0 }}
          placeholder={searchBar}
          onFocus={() => router.navigate("/(app)/(tabs)/search")}
        />
      </View>
    </ImageBackground>
  );
}
