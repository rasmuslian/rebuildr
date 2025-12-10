import React from "react";
import InteractiveMap from "@components/maps/interactive-map";
import { SearchBar } from "@components/search/search-bar";
import { useDebounceCallback } from "usehooks-ts";
import { router } from "expo-router";
import { useWindowDimensions, View } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import { horizontalPadding } from "@constants/sizes";
import { useFilterProduct } from "@hooks/useFilterProduct";

export default function Map() {
  const colors = useThemeColor();
  const { height: screenHeight } = useWindowDimensions();
  const searchBarHeight = 57;
  const mapHeight = screenHeight - searchBarHeight;
  const filterContext = useFilterProduct();

  const onChange = useDebounceCallback((text: string) => {
    filterContext.resetAndSetSearchString(text);
  }, 500);

  return (
    <View style={{ flexGrow: 1, backgroundColor: colors.background.neutral }}>
      <SearchBar
        onPressArrow={() => router.navigate("/search/products")}
        placeholder="Vad letar du efter?"
        onChange={onChange}
        style={{
          borderBottomWidth: 0,
          paddingHorizontal: horizontalPadding.mobile,
        }}
      />

      <InteractiveMap style={{ height: mapHeight }} />
    </View>
  );
}
