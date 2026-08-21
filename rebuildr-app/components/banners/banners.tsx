import {
  View,
  TouchableOpacity,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Image, ImageSource } from "expo-image";
import { useThemeColor } from "@hooks/useThemeColor";
import { borderRadius } from "@constants/sizes";
import { Title, Headline, Display } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { LoginModalContext } from "@context/loginModalContext";
import {
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useUser } from "@hooks/useUser";
import { useSellProductContext } from "@context/sell-product-context";
import { useScreenType } from "@hooks/useScreenType";
import { gql, useQuery } from "@apollo/client";
import {
  BannerActionEnum,
  BannerPresetBackground,
  BannersQuery,
} from "@/gql/graphql";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Link } from "expo-router";
import { resolveCmsHref } from "@/utils/resolve-cms-href";
import { CarouselArrows } from "@components/carousel/carousel-arrows";
import { CarouselDots } from "@components/carousel/carousel-dots";

const BANNERS = gql`
  query Banners {
    banners {
      id
      label
      title
      presetBackground
      backgroundImage {
        id
        url
      }
      url
      action
    }
  }
`;

const AUTOPLAY_INTERVAL_MS = 6000;

const prefersReducedMotion = () =>
  Platform.OS === "web" &&
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function Banners() {
  const { width } = useWindowDimensions();
  const { data, loading } = useQuery<BannersQuery>(BANNERS);
  const { isDesktop } = useScreenType();

  const listRef = useRef<FlatList<BannersQuery["banners"][number]>>(null);
  const hasInteractedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const bannerCount = data?.banners.length ?? 0;
  const hasArrows = isDesktop && bannerCount > 1;
  // One banner fills the row exactly, so every paging offset lands on the
  // container edge instead of overflowing it.
  const itemWidth = containerWidth > 0 ? containerWidth : width * 0.918;
  const gap = isDesktop ? 8 : 4;
  const step = itemWidth + gap;

  const goToIndex = (
    index: number,
    { animated = true, isUser = true } = {},
  ) => {
    if (isUser) {
      hasInteractedRef.current = true;
    }
    const clamped = Math.max(0, Math.min(index, bannerCount - 1));
    setActiveIndex(clamped);
    listRef.current?.scrollToOffset({
      offset: clamped * step,
      animated,
    });
  };

  // Wrapping around the ends would otherwise sweep past every banner in
  // between, so the wrap itself jumps instead of animating.
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

  // Item width follows the container width, so a resize desyncs the raw scroll
  // offset from the active index unless it is re-applied.
  useEffect(() => {
    listRef.current?.scrollToOffset({
      offset: activeIndex * step,
      animated: false,
    });
  }, [step]);

  if (!data || loading) {
    return <LoadingSpinner />;
  }

  if (!data.banners.length) {
    return null;
  }

  return (
    <View
      style={{
        paddingVertical: 32,
      }}
    >
      <View
        onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <FlatList
          ref={listRef}
          data={data.banners}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{ width: itemWidth, borderRadius: borderRadius.medium }}
            >
              <Banner banner={item} insetForArrows={hasArrows} />
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
          count={data.banners.length}
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

type BannerProps = {
  banner: BannersQuery["banners"][number];
  insetForArrows?: boolean;
};

const presetBackgroundImages: Partial<
  Record<BannerPresetBackground, ImageSource>
> = {
  [BannerPresetBackground.Rebuildr]: require("@assets/images/main-background.png"),
  [BannerPresetBackground.Wood]: require("@assets/images/banner-wood.webp"),
  [BannerPresetBackground.Metallic]: require("@assets/images/banner-metallic.webp"),
};

const getBannerImageSource = (
  banner: BannerProps["banner"],
): ImageSource | null => {
  if (banner.backgroundImage?.url) {
    return { uri: banner.backgroundImage.url };
  }
  return presetBackgroundImages[banner.presetBackground] ?? null;
};

const Banner = ({ banner, insetForArrows }: BannerProps) => {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const BannerPrompt = isDesktop ? Headline : Title;
  const BannerTitle = isDesktop ? Display : Headline;
  const imageSource = getBannerImageSource(banner);

  return (
    <BannerWrapper banner={banner}>
      <View
        style={{
          backgroundColor: colors.logo.vector,
          width: "100%",
          aspectRatio: isDesktop ? undefined : 3,
          overflow: "hidden",
          borderRadius: borderRadius.medium,
        }}
      >
        {imageSource && (
          <Image
            source={imageSource}
            contentFit="cover"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}
        <View
          style={{
            paddingVertical: 32,
            paddingHorizontal: insetForArrows ? 72 : 24,
            flexDirection: "column",
            gap: 12,
          }}
        >
          <BannerPrompt
            size={isDesktop ? "medium" : "small"}
            style={{ color: colors.logo.background }}
          >
            {banner.label}
          </BannerPrompt>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <BannerTitle
              size={isDesktop ? "medium" : "small"}
              color="primaryLight"
              style={{ color: colors.logo.background }}
            >
              {banner.title}
            </BannerTitle>
            {(banner.url || banner.action) && (
              <Icon icon="chevronRight" customColor={colors.logo.background} />
            )}
          </View>
        </View>
      </View>
    </BannerWrapper>
  );
};

type BannerWrapperProps = {
  banner: BannersQuery["banners"][number];
} & PropsWithChildren;

const BannerWrapper = ({ banner, children }: BannerWrapperProps) => {
  const { setVisible: setLoginVisible } = useContext(LoginModalContext);
  const { setVisible: setSellProductVisible } = useSellProductContext();
  const { isLoggedIn } = useUser();

  const onPressAction = (action: BannerActionEnum) => {
    switch (action) {
      case BannerActionEnum.Sell:
        if (isLoggedIn) {
          setSellProductVisible(true);
        } else {
          setLoginVisible(true);
        }
    }
  };

  if (banner.action) {
    return (
      <TouchableOpacity
        onPress={() => onPressAction(banner.action as BannerActionEnum)}
      >
        {children}
      </TouchableOpacity>
    );
  }
  if (banner.url) {
    return <Link href={resolveCmsHref(banner.url)}>{children}</Link>;
  }
  return <View>{children}</View>;
};
