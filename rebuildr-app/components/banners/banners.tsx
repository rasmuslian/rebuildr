import {
  View,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { Image, ImageSource } from "expo-image";
import { useThemeColor } from "@hooks/useThemeColor";
import { borderRadius } from "@constants/sizes";
import { Title, Headline, Display } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { LoginModalContext } from "@context/loginModalContext";
import { PropsWithChildren, useContext } from "react";
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

export function Banners() {
  const { width } = useWindowDimensions();
  const { data, loading } = useQuery<BannersQuery>(BANNERS);
  const { isDesktop } = useScreenType();

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
      <FlatList
        data={data.banners}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{ width: width * 0.918, borderRadius: borderRadius.medium }}
          >
            <Banner banner={item} />
          </View>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: isDesktop ? 8 : 4 }}
      />
    </View>
  );
}

type BannerProps = {
  banner: BannersQuery["banners"][number];
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

const Banner = ({ banner }: BannerProps) => {
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
            paddingHorizontal: 24,
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
              size="medium"
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
