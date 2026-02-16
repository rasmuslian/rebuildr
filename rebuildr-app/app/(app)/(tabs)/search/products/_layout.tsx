import React from "react";
import { Slot, router } from "expo-router";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { useScreenType } from "@hooks/useScreenType";
import { SearchBar } from "@components/search/search-bar";
import TopBar from "@components/navigation/top-bar/top-bar";

export default function ProductsLayout() {
  const { isDesktop } = useScreenType();

  if (isDesktop) {
    return (
      <ScreenLayout
        style={{ marginTop: 24 }}
        desktopFooter
        headerComponent={<TopBar showFor={["desktop"]} theme="light" />}
      >
        <Slot />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      style={{ marginTop: 24 }}
      headerComponent={
        <SearchBar
          onPressArrow={() => {
            router.canGoBack() ? router.back() : router.navigate("/");
          }}
          placeholder="Vad letar du efter?"
          searchOnSubmit
        />
      }
    >
      <Slot />
    </ScreenLayout>
  );
}
