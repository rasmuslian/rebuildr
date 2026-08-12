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
          width: "100%",
          maxWidth: MAX_CONTENT_WIDTH,
          alignSelf: "center",
          paddingVertical: 48,
          paddingHorizontal: 75,
          display: "flex",
          flexDirection: "column",
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
  );
}
