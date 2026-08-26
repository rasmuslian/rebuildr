import { gql, useQuery } from "@apollo/client";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  View,
  useWindowDimensions,
} from "react-native";

import { EndBannersQuery } from "@/gql/graphql";
import {
  BannerLogo,
  BannerWrapper,
  getBannerForegroundColor,
  getBannerImageSource,
} from "@components/banners/banners";
import { Button } from "@components/buttons/button";
import { CarouselArrows } from "@components/carousel/carousel-arrows";
import { CarouselDots } from "@components/carousel/carousel-dots";
import { Display, Headline } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";

const END_BANNERS = gql`
  query EndBanners {
    banners(placement: END) {
      id
      title
      ctaText
      url
      action
      presetBackground
      foregroundColor
      backgroundImage {
        id
        url
      }
      logo {
        id
        url
      }
    }
  }
`;

const AUTOPLAY_INTERVAL_MS = 6000;

const prefersReducedMotion = () =>
  Platform.OS === "web" &&
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function EndBanners() {
  const { width } = useWindowDimensions();
  const { data } = useQuery<EndBannersQuery>(END_BANNERS);
  const { isDesktop } = useScreenType();
  const listRef = useRef<FlatList<EndBannersQuery["banners"][number]>>(null);
  const hasInteractedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);

  const banners = data?.banners ?? [];
  const bannerCount = banners.length;
  const hasArrows = isDesktop && bannerCount > 1;
  const itemWidth = containerWidth > 0 ? containerWidth : width * 0.918;
  const gap = isDesktop ? 8 : 4;
  const step = itemWidth + gap;

  const goToIndex = (
    index: number,
    { animated = true, isUser = true } = {},
  ) => {
    if (isUser) hasInteractedRef.current = true;
    const clamped = Math.max(0, Math.min(index, bannerCount - 1));
    setActiveIndex(clamped);
    listRef.current?.scrollToOffset({
      offset: clamped * step,
      animated,
    });
  };

  const goToRelative = (delta: -1 | 1, isUser = true) => {
    const next = (activeIndex + delta + bannerCount) % bannerCount;
    const wraps = Math.abs(next - activeIndex) > 1;
    goToIndex(next, { animated: !wraps, isUser });
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (bannerCount < 1) return;
    const index = Math.round(event.nativeEvent.contentOffset.x / step);
    setActiveIndex(Math.max(0, Math.min(index, bannerCount - 1)));
  };

  useEffect(() => {
    if (bannerCount <= 1 || hovered || hasInteractedRef.current) return;
    if (prefersReducedMotion()) return;
    const timer = setTimeout(() => {
      goToRelative(1, false);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [activeIndex, bannerCount, hovered]);

  useEffect(() => {
    listRef.current?.scrollToOffset({
      offset: activeIndex * step,
      animated: false,
    });
  }, [step]);

  useEffect(() => {
    setBannerHeight(0);
  }, [bannerCount, isDesktop, itemWidth]);

  if (!bannerCount) return null;

  return (
    <View style={{ paddingTop: 32 }}>
      <View
        onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <FlatList
          ref={listRef}
          data={banners}
          initialNumToRender={bannerCount}
          removeClippedSubviews={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              onLayout={(event) =>
                setBannerHeight((currentHeight) =>
                  Math.max(currentHeight, event.nativeEvent.layout.height),
                )
              }
              style={{ width: itemWidth }}
            >
              <EndBanner
                banner={item}
                height={bannerHeight}
                insetForArrows={hasArrows}
              />
            </View>
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => {
            hasInteractedRef.current = true;
          }}
        />
        <CarouselDots
          count={bannerCount}
          activeIndex={activeIndex}
          onDotPress={(index) => goToIndex(index)}
        />
        <CarouselArrows
          canScrollLeft={bannerCount > 1}
          canScrollRight={bannerCount > 1}
          onPrev={() => goToRelative(-1)}
          onNext={() => goToRelative(1)}
        />
      </View>
    </View>
  );
}

type EndBannerProps = {
  banner: EndBannersQuery["banners"][number];
  height?: number;
  insetForArrows: boolean;
};

const EndBanner = ({ banner, height, insetForArrows }: EndBannerProps) => {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const imageSource = getBannerImageSource(banner);
  const foregroundColor = getBannerForegroundColor(banner.foregroundColor);
  const hasCta = !!(banner.url || banner.action);
  const ctaText = banner.ctaText?.trim() || "Läs mer";
  const BannerTitle = isDesktop ? Display : Headline;

  return (
    <BannerWrapper banner={banner}>
      <View
        style={{
          width: "100%",
          minHeight: Math.max(height ?? 0, isDesktop ? 300 : 260),
          borderRadius: borderRadius.medium,
          backgroundColor: colors.logo.vector,
          justifyContent: "center",
        }}
      >
        {imageSource && (
          <Image
            source={imageSource}
            contentFit="cover"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: borderRadius.medium,
            }}
          />
        )}
        <View
          style={{
            paddingVertical: isDesktop ? 48 : 32,
            paddingHorizontal: insetForArrows ? 72 : isDesktop ? 48 : 24,
            gap: isDesktop ? 24 : 20,
            maxWidth: 800,
          }}
        >
          {banner.logo?.url && (
            <BannerLogo url={banner.logo.url} width={isDesktop ? 192 : 176} />
          )}
          <BannerTitle
            size={isDesktop ? "medium" : "small"}
            style={{ color: foregroundColor }}
          >
            {banner.title}
          </BannerTitle>
          {hasCta && (
            <Button
              label={ctaText}
              theme="dark"
              type="outlined"
              foregroundColor={foregroundColor}
              style={{ alignSelf: "flex-start", paddingHorizontal: 16 }}
            />
          )}
        </View>
      </View>
    </BannerWrapper>
  );
};
