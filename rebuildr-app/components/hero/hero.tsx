import { Animated } from "react-native";
import React from "react";
import { useScreenType } from "@hooks/useScreenType";
import HeroMobile from "./hero.mobile";
import HeroDesktop from "./hero.desktop";

type Props = {
  scrollY: Animated.Value;
  showFor?: "mobile" | "desktop";
  showSearchBar?: boolean;
};

export default function Hero({
  scrollY,
  showFor = "mobile",
  showSearchBar,
}: Props) {
  const { isMobile, isDesktop } = useScreenType();
  if (isMobile && showFor === "mobile") {
    return (
      <HeroMobile
        scrollY={scrollY}
        headline="Sveriges marknadsplats för återbrukat byggmaterial & verktyg"
        searchBar="Vad letar du efter?"
      />
    );
  } else if (isDesktop && showFor === "desktop") {
    return (
      <HeroDesktop
        headline="Sveriges marknadsplats för återbrukat byggmaterial & verktyg"
        searchBar="Vad letar du efter?"
        showSearchBar={showSearchBar}
      />
    );
  } else {
    return null;
  }
}
