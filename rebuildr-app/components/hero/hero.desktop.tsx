import { View, ImageBackground, Animated } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import { Headline } from "@components/typography/text";
import { SearchBar } from "@components/search/search-bar";
import React from "react";
import { router } from "expo-router";

type Props = {
  scrollY: Animated.Value;
  headline: string;
  searchBar: string;
};

export default function HeroDesktop({ scrollY, headline, searchBar }: Props) {
  const colors = useThemeColor();

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
          paddingVertical: 48,
          paddingHorizontal: 75,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Headline
          size="medium"
          style={{
            color: colors.logo.background,
            paddingBottom: 24,
          }}
        >
          {headline}
        </Headline>

        <SearchBar
          style={{ borderBottomWidth: 0, width: 633, paddingVertical: 0 }}
          placeholder={searchBar}
          onFocus={() => router.navigate("/(app)/(tabs)/search")}
        />
      </View>
    </ImageBackground>
  );
}
