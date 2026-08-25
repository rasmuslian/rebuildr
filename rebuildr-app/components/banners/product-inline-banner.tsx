import { gql, useQuery } from "@apollo/client";
import { Image } from "expo-image";
import React, { PropsWithChildren, createContext, useContext } from "react";
import { View, useWindowDimensions } from "react-native";

import { ProductInlineBannersQuery } from "@/gql/graphql";
import {
  BannerLogo,
  BannerWrapper,
  getBannerForegroundColor,
  getBannerImageSource,
} from "@components/banners/banners";
import { Icon } from "@components/icons/icon";
import { Headline, Label } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";

const MOBILE_PRODUCT_CARD_CONTENT_HEIGHT = 70;

const PRODUCT_INLINE_BANNERS = gql`
  query ProductInlineBanners {
    banners(placement: PRODUCT_INLINE) {
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

type InlineBannerContextValue = {
  banner?: ProductInlineBannersQuery["banners"][number];
};

const InlineBannerContext = createContext<InlineBannerContextValue | null>(
  null,
);

export function ProductInlineBannerProvider({ children }: PropsWithChildren) {
  const { data } = useQuery<ProductInlineBannersQuery>(PRODUCT_INLINE_BANNERS);

  return (
    <InlineBannerContext.Provider value={{ banner: data?.banners[0] }}>
      {children}
    </InlineBannerContext.Provider>
  );
}

export function ProductInlineBannerSlot() {
  const context = useContext(InlineBannerContext);
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const { width: screenWidth } = useWindowDimensions();
  if (!context?.banner) return null;

  const { banner } = context;
  const imageSource = getBannerImageSource(banner);
  const foregroundColor = getBannerForegroundColor(banner.foregroundColor);
  const mobileProductCardHeight =
    (screenWidth - 32) * 0.4 + MOBILE_PRODUCT_CARD_CONTENT_HEIGHT;

  return (
    <BannerWrapper banner={banner}>
      <View
        style={{
          aspectRatio: isDesktop ? 0.78 : undefined,
          minHeight: isDesktop ? undefined : mobileProductCardHeight,
          borderRadius: borderRadius.medium,
          overflow: "hidden",
          backgroundColor: colors.logo.vector,
          padding: isDesktop ? 20 : 16,
        }}
      >
        {imageSource && (
          <Image
            source={imageSource}
            contentFit="cover"
            style={{ position: "absolute", inset: 0 }}
          />
        )}
        <View style={{ flex: 1 }}>
          {banner.logo?.url && (
            <BannerLogo url={banner.logo.url} width={isDesktop ? 136 : 112} />
          )}
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Headline
              size="small"
              style={[
                { color: foregroundColor },
                !isDesktop && { fontSize: 16, lineHeight: 22 },
              ]}
            >
              {banner.title}
            </Headline>
          </View>
          {!!banner.ctaText && !!(banner.url || banner.action) && (
            <View
              style={{
                alignSelf: "flex-end",
                alignItems: "center",
                flexDirection: "row",
                gap: isDesktop ? 10 : 8,
                marginTop: "auto",
                maxWidth: "100%",
              }}
            >
              <Label
                size={isDesktop ? "large" : "medium"}
                numberOfLines={2}
                style={{
                  color: foregroundColor,
                  flexShrink: 1,
                  textAlign: "right",
                }}
              >
                {banner.ctaText}
              </Label>
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: primitives.accent500,
                  borderRadius: isDesktop ? 16 : 14,
                  height: isDesktop ? 32 : 28,
                  justifyContent: "center",
                  width: isDesktop ? 32 : 28,
                }}
              >
                <Icon
                  icon="arrowRight"
                  customColor={colors.background.secondary}
                  size={isDesktop ? 18 : 16}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </BannerWrapper>
  );
}
