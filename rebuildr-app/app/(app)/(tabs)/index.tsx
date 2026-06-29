import React, { useCallback, useEffect, useRef, useState } from "react";
import TopBar from "@components/navigation/top-bar/top-bar";
import Hero from "@components/hero/hero";
import Footer from "@components/navigation/footer";
import { View, Animated, ScrollView } from "react-native";
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

  return (
    <>
      <RebuildrHead jsonLd={[organizationSchema, webSiteSchema]} />
      <Head>
        <meta name="theme-color" content={colors.logo.vector} />
      </Head>

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
          <View
            onLayout={(event) =>
              setHeadlineHeight(event.nativeEvent.layout.height)
            }
          >
            <Hero
              scrollY={scrollY}
              showFor="desktop"
              showSearchBar={!showSearchBarTopBar}
            />
          </View>
          <View
            style={{
              backgroundColor: colors.background.neutral,
              flexGrow: 1,
              paddingHorizontal: isDesktop ? 75 : 16,
              paddingBottom: 32,
              paddingTop: isDesktop ? 44 : 16,
            }}
          >
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

          <Footer />
        </Animated.ScrollView>
      </View>
    </>
  );
}
