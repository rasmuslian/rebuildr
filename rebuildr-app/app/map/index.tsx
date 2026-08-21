import React from "react";
import { MapCanvas } from "@components/maps/interactive-map";
import { SearchBar } from "@components/search/search-bar";
import { useDebounceCallback } from "usehooks-ts";
import { router } from "expo-router";
import { useWindowDimensions, View } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import { horizontalPadding } from "@constants/sizes";
import { useFilterProduct } from "@hooks/useFilterProduct";
import RebuildrHead from "@components/meta-data/rebuildr-head";
import { MapProvider, useMapContext } from "@context/map-context";
import { Button } from "@components/buttons/button";
import { pendingMapSearchAreaVar } from "@/apollo/state";

/**
 * Applies the visible map area to the results list. The list lives on another
 * route, so the area is handed over through a reactive var.
 */
const ShowAdsInAreaButton = () => {
  const { state } = useMapContext();

  const adsInView = state.mapPinGroups.reduce(
    (total, group) => total + group.productIds.length,
    0,
  );

  if (!state.bounds || !adsInView) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        bottom: 24,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <Button
        label={`Visa ${adsInView} ${adsInView === 1 ? "annons" : "annonser"}`}
        onPress={() => {
          pendingMapSearchAreaVar(state.bounds);
          router.navigate("/search/products");
        }}
      />
    </View>
  );
};

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

        <MapProvider productsInput={toProductsQueryInput()}>
          <View style={{ height: mapHeight }}>
            <MapCanvas style={{ height: "100%" }} />
            <ShowAdsInAreaButton />
          </View>
        </MapProvider>
      </View>
    </>
  );
}
