import React from "react";
import InteractiveMap from "@components/maps/interactive-map";
import { SearchBar } from "@components/search/search-bar";
import { useDebounceCallback } from "usehooks-ts";
import { router } from "expo-router";
import { useWindowDimensions, View } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import { horizontalPadding } from "@constants/sizes";
import { useFilterProduct } from "@hooks/useFilterProduct";
import RebuildrHead from "@components/meta-data/rebuildr-head";

export default function Map() {
  const colors = useThemeColor();
  const { height: screenHeight } = useWindowDimensions();
  const searchBarHeight = 57;
  const mapHeight = screenHeight - searchBarHeight;
  const { filterBuilder, toProductsQueryInput } = useFilterProduct();

  const onChange = useDebounceCallback((text: string) => {
    filterBuilder.reset().setSearchString(text).apply();
  }, 500);

  return (
    <>
      <RebuildrHead title="Karta" />

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

        <InteractiveMap
          style={{ height: mapHeight }}
          productsInput={toProductsQueryInput()}
        />
      </View>
    </>
  );
}
