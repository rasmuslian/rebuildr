import React, { useRef } from "react";
import TopBar from "@components/navigation/top-bar";
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

export default function Landing() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const colors = useThemeColor();

  return (
    <View style={{ flex: 1 }}>
      <TopBar />
      <Hero scrollY={scrollY} />

      <Animated.ScrollView
        scrollEventThrottle={8}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
        <View
          style={{
            backgroundColor: colors.background.neutral,
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingBottom: 32,
            paddingTop: 24,
          }}
        >
          <RootCategoriesHorizontal />
          <NewArrivals />
          <ForTheSeason />
          <SaleBanner />
          <RecommendedProducts
            title="Du kanske också gillar"
            source={ProductsRecommendationSourceEnum.Likes}
          />

          <RecommendedProducts
            title="Nytt från din senaste sökning"
            source={ProductsRecommendationSourceEnum.SearchHistory}
          />

          <TrendingNow />
        </View>

        <Footer />
      </Animated.ScrollView>
    </View>
  );
}
