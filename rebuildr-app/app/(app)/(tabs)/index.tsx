import React, { useCallback, useEffect, useRef, useState } from "react";
import TopBar from "@components/navigation/top-bar/top-bar";
import Hero from "@components/hero/hero";
import Footer from "@components/navigation/footer";
import { View, Animated, ScrollView, ViewStyle } from "react-native";
import { useScrollToTop } from "@react-navigation/native";
import Head from "expo-router/head";
import { TrendingNow } from "@components/trending-now/trending-now";
import { NewArrivals } from "@components/new-arrivals/new-arrivals";
import { ForTheSeason } from "@components/for-the-season/for-the-season";
import { RootCategoriesHorizontal } from "@components/categories/root-categories-horizontal";
import { RecommendedProducts } from "@components/recommended-products/recommended-products";
import { useThemeColor } from "@hooks/useThemeColor";
import { ProductsRecommendationSourceEnum } from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import { NearYou } from "@components/near-you/near-you";
import { useSearchContext } from "@context/search-context";
import RebuildrHead from "@components/meta-data/rebuildr-head";
import { Banners } from "@components/banners/banners";
import { useFocusEffect } from "expo-router";
import { organizationSchema, webSiteSchema } from "@/lib/structured-data";
import {
  isWeb,
  MAX_CONTENT_WIDTH,
  screenGrowStyle,
  WEB_STICKY,
} from "@constants/layout";
import { OnboardingHomeStrip } from "@components/onboarding/onboarding-home-strip";

export default function Landing() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const [showSearchBarTopBar, setShowSearchBarTopBar] = useState(false);
  const previousShowSearchBarTopBar = useRef(showSearchBarTopBar);
  const { searchState, setSearchState } = useSearchContext();
  const [headlineHeight, setHeadlineHeight] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (typeof document === "undefined") return;
      document.body.style.backgroundColor = colors.logo.vector;
      return () => {
        document.body.style.backgroundColor = "";
      };
    }, []),
  );

  // Web scrolls the document, so drive the animated value from window scroll
  // instead of an inner ScrollView's onScroll.
  useEffect(() => {
    if (!isWeb || typeof window === "undefined") return;
    const onScroll = () => scrollY.setValue(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (headlineHeight === 0) return;

    const listener = scrollY.addListener(({ value }) => {
      const breakpoint = headlineHeight - 48;
      if (value > breakpoint && !showSearchBarTopBar) {
        setShowSearchBarTopBar(true);
      } else if (value <= breakpoint && showSearchBarTopBar) {
        setShowSearchBarTopBar(false);
      }
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [headlineHeight, showSearchBarTopBar]);

  useEffect(() => {
    if (!isDesktop) return;

    if (previousShowSearchBarTopBar.current === showSearchBarTopBar) return;

    previousShowSearchBarTopBar.current = showSearchBarTopBar;

    if (searchState.dropdownVisible) {
      setSearchState({ dropdownVisible: false });
    }
  }, [
    isDesktop,
    searchState.dropdownVisible,
    setSearchState,
    showSearchBarTopBar,
  ]);

  const heroDesktop = (
    <View
      onLayout={(event) => setHeadlineHeight(event.nativeEvent.layout.height)}
    >
      <Hero
        scrollY={scrollY}
        showFor="desktop"
        showSearchBar={!showSearchBarTopBar}
      />
    </View>
  );

  // Cap and center the feed on wide screens so it doesn't sprawl edge to edge.
  const contentWidthCap: ViewStyle | undefined = isDesktop
    ? { maxWidth: MAX_CONTENT_WIDTH, alignSelf: "center", width: "100%" }
    : undefined;

  const content = (
    <View
      style={[
        {
          backgroundColor: colors.background.neutral,
          flexGrow: 1,
          paddingHorizontal: isDesktop ? 75 : 16,
          paddingBottom: 32,
          paddingTop: isDesktop ? 44 : 16,
        },
        contentWidthCap,
      ]}
    >
      <OnboardingHomeStrip />
      <RootCategoriesHorizontal />
      <NewArrivals />
      <NearYou />
      <ForTheSeason />
      <Banners />
      <TrendingNow />
      <RecommendedProducts
        title="Du kanske också gillar"
        source={ProductsRecommendationSourceEnum.Likes}
      />

      <RecommendedProducts
        title="Nytt från din senaste sökning"
        source={ProductsRecommendationSourceEnum.SearchHistory}
      />
    </View>
  );

  return (
    <>
      <RebuildrHead jsonLd={[organizationSchema, webSiteSchema]} />
      <Head>
        <meta name="theme-color" content={colors.logo.vector} />
      </Head>

      {isWeb ? (
        // Hero, feed and footer are all capped and centred, so the page
        // background is what shows beside them on wide screens.
        <View
          style={[
            screenGrowStyle,
            { backgroundColor: colors.background.neutral },
          ]}
        >
          <View
            style={{
              position: WEB_STICKY,
              top: 0,
              zIndex: 100,
              backgroundColor: colors.logo.vector,
            }}
          >
            <TopBar showSearchBar={showSearchBarTopBar} animateSearchBar />
            <Hero scrollY={scrollY} showFor="mobile" />
          </View>
          {heroDesktop}
          {content}
          <Footer />
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.logo.vector }}>
          <TopBar showSearchBar={showSearchBarTopBar} animateSearchBar />
          <Hero scrollY={scrollY} showFor="mobile" />

          <Animated.ScrollView
            ref={scrollRef}
            scrollEventThrottle={8}
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
          >
            {heroDesktop}
            {content}
            <Footer />
          </Animated.ScrollView>
        </View>
      )}
    </>
  );
}
