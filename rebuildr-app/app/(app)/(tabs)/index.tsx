import React, { useEffect, useRef, useState } from "react";
import TopBar from "@components/navigation/top-bar/top-bar";
import Hero from "@components/hero/hero";
import Footer from "@components/navigation/footer";
import { View, Animated } from "react-native";
import { TrendingNow } from "@components/trending-now/trending-now";
import { NewArrivals } from "@components/new-arrivals/new-arrivals";
import { ForTheSeason } from "@components/for-the-season/for-the-season";
import { SaleBanner } from "@components/sale-banner/sale-banner";
import { RootCategoriesHorizontal } from "@components/categories/root-categories-horizontal";
import { RecommendedProducts } from "@components/recommended-products/recommended-products";
import { useThemeColor } from "@hooks/useThemeColor";
import { ProductsRecommendationSourceEnum } from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import { NearYou } from "@components/near-you/near-you";
import { useSearchContext } from "@context/search-context";

export default function Landing() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const [showSearchBarTopBar, setShowSearchBarTopBar] = useState(false);
  const { searchState, setSearchState } = useSearchContext();
  const [headlineHeight, setHeadlineHeight] = useState(0);

  useEffect(() => {
    if (headlineHeight === 0) return;

    const listener = scrollY.addListener(({ value }) => {
      const breakpoint = headlineHeight - 48;
      if (value > breakpoint && !showSearchBarTopBar) {
        setShowSearchBarTopBar(true);
      } else if (value <= breakpoint && showSearchBarTopBar) {
        setShowSearchBarTopBar(false);
      }
      if (isDesktop && searchState.dropdownVisible && !showSearchBarTopBar) {
        setSearchState({ dropdownVisible: false });
      }
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [headlineHeight, showSearchBarTopBar, searchState.dropdownVisible]);

  return (
    <View style={{ flex: 1 }}>
      <TopBar showSearchBar={showSearchBarTopBar} animateSearchBar />
      <Hero scrollY={scrollY} showFor="mobile" />

      <Animated.ScrollView
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
          <SaleBanner />
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
  );
}
