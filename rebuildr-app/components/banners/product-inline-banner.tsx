import { gql, useQuery } from "@apollo/client";
import { Image } from "expo-image";
import React, { PropsWithChildren, createContext, useContext } from "react";
import { View } from "react-native";

import { ProductInlineBannersQuery } from "@/gql/graphql";
import {
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
  if (!context?.banner) return null;

  const { banner } = context;
  const imageSource = getBannerImageSource(banner);
  const foregroundColor = getBannerForegroundColor(banner.foregroundColor);

  return (
    <BannerWrapper banner={banner}>
      <View
        style={{
          aspectRatio: isDesktop ? 0.78 : undefined,
          minHeight: isDesktop ? undefined : 184,
          borderRadius: borderRadius.medium,
          overflow: "hidden",
          backgroundColor: colors.logo.vector,
          padding: isDesktop ? 16 : 12,
        }}
      >
        {imageSource && (
          <Image
            source={imageSource}
            contentFit="cover"
            style={{ position: "absolute", inset: 0 }}
          />
        )}
        <View style={{ flex: 1, gap: isDesktop ? 12 : 8 }}>
          {banner.logo?.url && (
            <Image
              source={{ uri: banner.logo.url }}
              contentFit="contain"
              style={{
                width: isDesktop ? 72 : 56,
                height: isDesktop ? 44 : 32,
              }}
            />
          )}
          <Headline
            size="small"
            style={[
              { color: foregroundColor },
              !isDesktop && { fontSize: 16, lineHeight: 22 },
            ]}
          >
            {banner.title}
          </Headline>
          {!!banner.ctaText && !!(banner.url || banner.action) && (
            <View
              style={{
                alignSelf: "flex-end",
                alignItems: "center",
                flexDirection: "row",
                gap: isDesktop ? 8 : 6,
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
