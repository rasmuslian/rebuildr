import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

import { InternalAdsHomeQuery } from "@/gql/graphql";
import { formatCO2, formatNumber, formatPrice } from "@/utils/formattings";
import { Body, Headline, Title } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";

type Props = {
  statistics: InternalAdsHomeQuery["internalAdsStatistics"];
};

type StatisticsCardProps = {
  accessibilityLabel: string;
  backgroundColor: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const StatisticsCard = ({
  accessibilityLabel,
  backgroundColor,
  children,
  style,
}: StatisticsCardProps) => {
  const colors = useThemeColor();

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          backgroundColor,
          borderColor: colors.dividers.neutral,
          borderRadius: borderRadius.medium,
          borderWidth: 1,
          gap: 12,
          minWidth: 0,
          padding: 24,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export const InternalStatisticsSection = ({ statistics }: Props) => {
  const { isDesktop } = useScreenType();
  const co2Saved = `${formatCO2(statistics.co2Saved)} kg CO₂e`;
  const potentialCo2Savings = `${formatCO2(
    statistics.potentialCo2Savings,
  )} kg CO₂e`;
  const estimatedMarketValue = formatPrice(
    statistics.estimatedMarketValue / 100,
  );
  const totalAds = formatNumber(statistics.totalAds);
  const externallyPublishedAds = formatNumber(
    statistics.externallyPublishedAds,
  );

  const valueProps = {
    adjustsFontSizeToFit: true,
    minimumFontScale: 0.65,
    numberOfLines: 1,
  } as const;

  return (
    <View style={{ gap: 16 }}>
      <Headline size="small" heading={2}>
        Återbanken i siffror
      </Headline>

      <View
        style={{
          flexDirection: isDesktop ? "row" : "column",
          gap: 16,
        }}
      >
        <StatisticsCard
          accessibilityLabel={`Sparad koldioxid ${co2Saved}. Möjlig ytterligare koldioxidbesparing ${potentialCo2Savings}.`}
          backgroundColor={primitives.primary100}
          style={isDesktop ? { flex: 1 } : undefined}
        >
          <Title size="large" heading={3}>
            Klimatnytta
          </Title>
          <View
            style={{
              flex: isDesktop ? 1 : undefined,
              justifyContent: isDesktop ? "flex-end" : undefined,
              gap: 24,
            }}
          >
            <View style={{ gap: 4 }}>
              <Body size="small" color="secondary">
                Sparad CO₂
              </Body>
              <Headline
                size="large"
                {...valueProps}
                style={{ lineHeight: isDesktop ? 46 : 42 }}
              >
                {co2Saved}
              </Headline>
            </View>
            <View style={{ gap: 4 }}>
              <Body size="small" color="secondary">
                Möjlig ytterligare CO₂-besparing
              </Body>
              <Headline size="small" {...valueProps}>
                {potentialCo2Savings}
              </Headline>
            </View>
          </View>
        </StatisticsCard>

        <View style={{ flex: isDesktop ? 1 : undefined, gap: 16 }}>
          <StatisticsCard
            accessibilityLabel={`Uppskattat marknadsvärde ${estimatedMarketValue}.`}
            backgroundColor={primitives.secondary200}
            style={isDesktop ? { flex: 1 } : undefined}
          >
            <Title size="medium" heading={3}>
              Uppskattat marknadsvärde
            </Title>
            <Headline size="large" {...valueProps}>
              {estimatedMarketValue}
            </Headline>
            <Body size="small" color="secondary">
              Värdet av varorna som finns i Återbanken.
            </Body>
          </StatisticsCard>

          <View style={{ flexDirection: "row", gap: 16 }}>
            <StatisticsCard
              accessibilityLabel={`Antal annonser ${totalAds}.`}
              backgroundColor={primitives.neutrals100}
              style={{ flex: 1 }}
            >
              <Title size="small" heading={3}>
                Antal annonser
              </Title>
              <Headline size="large" {...valueProps}>
                {totalAds}
              </Headline>
            </StatisticsCard>
            <StatisticsCard
              accessibilityLabel={`Publicerade externt ${externallyPublishedAds}.`}
              backgroundColor={primitives.accent100}
              style={{ flex: 1 }}
            >
              <Title size="small" heading={3}>
                Publicerade externt
              </Title>
              <Headline size="large" {...valueProps}>
                {externallyPublishedAds}
              </Headline>
            </StatisticsCard>
          </View>
        </View>
      </View>
    </View>
  );
};
