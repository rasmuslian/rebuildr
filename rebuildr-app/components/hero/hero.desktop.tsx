import { View, ImageBackground } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import { Headline } from "@components/typography/text";
import React from "react";
import { Search } from "@components/search/search";
import { MAX_CONTENT_WIDTH } from "@constants/layout";

type Props = {
  headline: string;
  searchBar: string;
  showSearchBar?: boolean;
};

export default function HeroDesktop({
  headline,
  searchBar,
  showSearchBar,
}: Props) {
  const colors = useThemeColor();

  return (
    <View
      style={{
        width: "100%",
        overflow: "hidden",
      }}
    >
      <ImageBackground
        source={require("@assets/images/main-background.png")}
        resizeMode="cover"
        style={{
          backgroundColor: colors.logo.vector,
          width: "100%",
          paddingVertical: 48,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* The band bleeds to the window edges; only its contents align with
            the feed column below. */}
        <View
          style={{
            width: "100%",
            maxWidth: MAX_CONTENT_WIDTH,
            alignSelf: "center",
            paddingHorizontal: 75,
          }}
        >
          <Headline
            size="medium"
            heading={1}
            style={{
              color: colors.logo.background,
              paddingBottom: 24,
            }}
          >
            {headline}
          </Headline>

          <Search
            style={{ width: 633 }}
            placeholder={searchBar}
            visible={showSearchBar}
            searchOnSubmit
          />
        </View>
      </ImageBackground>
    </View>
  );
}
