import {
  View,
  TouchableOpacity,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Image, ImageLoadEventData, ImageSource } from "expo-image";
import { useThemeColor } from "@hooks/useThemeColor";
import { primitives } from "@constants/colors";
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
  BannerForegroundColor,
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
      logo {
        id
        url
      }
      presetBackground
      foregroundColor
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
  const [bannerHeight, setBannerHeight] = useState(0);

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

  useEffect(() => {
    setBannerHeight(0);
  }, [bannerCount, isDesktop, itemWidth]);

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
              style={{ width: itemWidth, borderRadius: borderRadius.medium }}
            >
              <Banner
                banner={item}
                height={bannerHeight}
                insetForArrows={hasArrows}
                onLogoLoad={() => setBannerHeight(0)}
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
  height?: number;
  insetForArrows?: boolean;
  onLogoLoad?: () => void;
};

const presetBackgroundImages: Partial<
  Record<BannerPresetBackground, ImageSource>
> = {
  [BannerPresetBackground.Rebuildr]: require("@assets/images/main-background.png"),
  [BannerPresetBackground.Wood]: require("@assets/images/banner-wood.webp"),
  [BannerPresetBackground.Metallic]: require("@assets/images/banner-metallic.webp"),
};

export const getBannerForegroundColor = (
  foregroundColor: BannerForegroundColor,
) => {
  switch (foregroundColor) {
    case BannerForegroundColor.LogoBackground:
      return primitives.secondary200;
    case BannerForegroundColor.LogoVector:
      return primitives.primary800;
    case BannerForegroundColor.White:
      return primitives.neutrals100;
    case BannerForegroundColor.Charcoal:
      return primitives.neutrals900;
  }
};

export const getBannerImageSource = (
  banner: BannerProps["banner"],
): ImageSource | null => {
  if (banner.backgroundImage?.url) {
    return { uri: banner.backgroundImage.url };
  }
  return presetBackgroundImages[banner.presetBackground] ?? null;
};

type BannerLogoProps = {
  url: string;
  width: number;
  roundUpHeight?: boolean;
  onLoad?: () => void;
};

export const BannerLogo = ({
  url,
  width,
  roundUpHeight = false,
  onLoad,
}: BannerLogoProps) => {
  const [aspectRatio, setAspectRatio] = useState(2);

  return (
    <Image
      source={{ uri: url }}
      contentFit="contain"
      onLoad={(event: ImageLoadEventData) => {
        const { width: imageWidth, height: imageHeight } = event.source;
        if (imageWidth && imageHeight) {
          setAspectRatio(imageWidth / imageHeight);
        }
        onLoad?.();
      }}
      style={
        roundUpHeight
          ? { width, height: Math.ceil(width / aspectRatio) }
          : { width, aspectRatio }
      }
    />
  );
};

const Banner = ({
  banner,
  height,
  insetForArrows,
  onLogoLoad,
}: BannerProps) => {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const BannerPrompt = isDesktop ? Headline : Title;
  const BannerTitle = isDesktop ? Display : Headline;
  const horizontalPadding = insetForArrows ? 72 : isDesktop ? 32 : 24;
  const imageSource = getBannerImageSource(banner);
  const foregroundColor = getBannerForegroundColor(banner.foregroundColor);

  return (
    <BannerWrapper banner={banner}>
      <View
        style={{
          backgroundColor: imageSource ? "transparent" : colors.logo.vector,
          width: "100%",
          minHeight: height || undefined,
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
              borderRadius: borderRadius.medium,
            }}
          />
        )}
        <View
          style={{
            paddingVertical: isDesktop ? 32 : 24,
            paddingHorizontal: horizontalPadding,
            flexDirection: "column",
            gap: isDesktop ? 16 : 12,
          }}
        >
          {banner.logo?.url && (
            <View style={{ alignItems: "flex-end" }}>
              <BannerLogo
                url={banner.logo.url}
                width={isDesktop ? 144 : 128}
                roundUpHeight={isDesktop}
                onLoad={onLogoLoad}
              />
            </View>
          )}
          {!!banner.label && (
            <BannerPrompt
              size={isDesktop ? "medium" : "small"}
              style={{ color: foregroundColor }}
            >
              {banner.label}
            </BannerPrompt>
          )}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: isDesktop ? 16 : 12,
            }}
          >
            <BannerTitle
              size={isDesktop ? "medium" : "small"}
              color="primaryLight"
              style={{ color: foregroundColor }}
            >
              {banner.title}
            </BannerTitle>
            {(banner.url || banner.action) && (
              <Icon icon="chevronRight" customColor={foregroundColor} />
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

export const BannerWrapper = ({ banner, children }: BannerWrapperProps) => {
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
