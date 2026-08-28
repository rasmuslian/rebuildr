import { ReactNode } from "react";
import { View } from "react-native";

import { InternalAdsDashboardQuery } from "@/gql/graphql";
import { formatCO2, formatNumber, formatPrice } from "@/utils/formattings";
import { Button } from "@components/buttons/button";
import { SelectInput } from "@components/forms/selectInput";
import { Body, Headline, Label, Title } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";

export type InternalDashboardPreset = "MONTH" | "QUARTER" | "YEAR" | "ALL";

type Props = {
  statistics: InternalAdsDashboardQuery["internalAdsDashboard"];
  preset: InternalDashboardPreset;
  selectedPreset: InternalDashboardPreset;
  onPresetChange: (preset: InternalDashboardPreset) => void;
  onDownload: () => void;
  downloading?: boolean;
  downloadError?: string;
};

const PRESET_OPTIONS: { value: InternalDashboardPreset; label: string }[] = [
  { value: "MONTH", label: "Denna månad" },
  { value: "QUARTER", label: "Detta kvartal" },
  { value: "YEAR", label: "Detta år" },
  { value: "ALL", label: "Hela tiden" },
];

const ReceiptMetric = ({
  label,
  value,
  description,
  emphasized = false,
}: {
  label?: string;
  value: string;
  description?: string;
  emphasized?: boolean;
}) => {
  const colors = useThemeColor();

  return (
    <View style={{ flex: 1, gap: 5, minWidth: 0 }}>
      {!!label && (
        <Body size="small" color="secondary">
          {label}
        </Body>
      )}
      <Title
        size="large"
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        numberOfLines={1}
        style={{
          color: colors.logo.vector,
          fontSize: emphasized ? 36 : undefined,
          fontWeight: emphasized ? 600 : undefined,
          lineHeight: emphasized ? 52 : undefined,
        }}
      >
        {value}
      </Title>
      {!!description && (
        <Body size="small" color="secondary">
          {description}
        </Body>
      )}
    </View>
  );
};

const ReceiptCard = ({
  title,
  rangeLabel,
  backgroundColor,
  children,
}: {
  title: string;
  rangeLabel: string;
  backgroundColor: string;
  children: ReactNode;
}) => {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const dividerColor =
    backgroundColor === primitives.primary100
      ? primitives.primary300
      : primitives.secondary500;

  return (
    <View
      style={{
        backgroundColor,
        borderColor: dividerColor,
        borderRadius: borderRadius.medium,
        borderWidth: 1,
        flex: 1,
        gap: 16,
        minWidth: 0,
        padding: 20,
      }}
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Label
          size="large"
          style={{ color: colors.logo.vector, fontSize: 16, lineHeight: 24 }}
        >
          {title}
        </Label>
        <Body size="small" color="secondary">
          {rangeLabel}
        </Body>
      </View>
      {!isDesktop && <Divider color={dividerColor} />}
      {children}
    </View>
  );
};

const Divider = ({ color }: { color: string }) => (
  <View style={{ height: 1, backgroundColor: color }} />
);

export const InternalStatisticsSection = ({
  statistics,
  preset,
  selectedPreset,
  onPresetChange,
  onDownload,
  downloading,
  downloadError,
}: Props) => {
  const { isDesktop } = useScreenType();
  const colors = useThemeColor();
  const rangeLabel =
    PRESET_OPTIONS.find((option) => option.value === preset)?.label ?? "";
  const money = (value: number) => formatPrice(value / 100);
  const co2 = (value: number) => `${formatCO2(value)} kg CO₂e`;
  const availableWeight =
    statistics.current.availableWeight >= 1000
      ? `${formatCO2(statistics.current.availableWeight / 1000)} ton`
      : `${formatCO2(statistics.current.availableWeight)} kg`;
  const kpis = [
    {
      value: formatNumber(statistics.current.totalAds),
      label: "annonser på lager",
    },
    { value: availableWeight, label: "material tillgängligt" },
    {
      value: formatNumber(statistics.current.activeProjects),
      label: "aktiva projekt",
    },
    {
      value: formatNumber(statistics.current.externallyPublishedAds),
      label: "publicerade externt",
    },
    {
      value: formatNumber(statistics.current.reservedArticles),
      label: "reserverade artiklar",
    },
  ];

  return (
    <View style={{ gap: 20 }}>
      <View
        style={{
          alignItems: isDesktop ? "center" : "stretch",
          flexDirection: isDesktop ? "row" : "column",
          justifyContent: "space-between",
          gap: 12,
          position: "relative",
          zIndex: 1000,
          elevation: 30,
        }}
      >
        <Headline size="small" heading={2}>
          Ert återbruk i siffror
        </Headline>
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            position: "relative",
            zIndex: 1000,
          }}
        >
          <View style={{ flex: isDesktop ? undefined : 1, width: 150 }}>
            <SelectInput
              value={selectedPreset}
              options={PRESET_OPTIONS}
              onSelect={onPresetChange}
              valueLabelSize="large"
            />
          </View>
          <Button
            label="Ladda ner underlag"
            icon={isDesktop ? "download" : undefined}
            type="outlined"
            loading={downloading}
            accessibilityLabel="Ladda ner underlag"
            onPress={onDownload}
          />
        </View>
      </View>

      {!!downloadError && (
        <Body size="small" color="error">
          {downloadError}
        </Body>
      )}

      <View
        style={{
          flexDirection: isDesktop ? "row" : "column",
          gap: 16,
        }}
      >
        <ReceiptCard
          title="Klimatkvitto"
          rangeLabel={rangeLabel}
          backgroundColor={primitives.primary100}
        >
          <ReceiptMetric
            label="Realiserad klimatnytta"
            value={co2(statistics.climate.realizedCo2)}
            emphasized
          />
          <View
            style={{ flexDirection: isDesktop ? "row" : "column", gap: 18 }}
          >
            <ReceiptMetric
              value={co2(statistics.climate.internalReuseCo2)}
              description="Internt återbruk – när ni är både säljare och köpare"
            />
            <ReceiptMetric
              value={co2(statistics.climate.externalSalesCo2)}
              description="Sålt via Rebuildr.se – er del som säljare"
            />
          </View>
          <Divider color={primitives.primary300} />
          <View
            style={{ flexDirection: isDesktop ? "row" : "column", gap: 18 }}
          >
            <ReceiptMetric
              label="Möjlig besparing i Återbanken just nu"
              value={co2(statistics.climate.potentialCo2Savings)}
            />
            <ReceiptMetric
              label="Motsvarar ungefär"
              value={`${formatNumber(statistics.climate.petrolCarKilometers)} km med bensinbil`}
            />
          </View>
        </ReceiptCard>

        <ReceiptCard
          title="Ekonomiska kvittot"
          rangeLabel={rangeLabel}
          backgroundColor={primitives.secondary200}
        >
          <ReceiptMetric
            label="Realiserat värde"
            value={money(statistics.economic.realizedValue)}
            emphasized
          />
          <View
            style={{ flexDirection: isDesktop ? "row" : "column", gap: 18 }}
          >
            <ReceiptMetric
              value={money(statistics.economic.internalReuseValue)}
              description="Internt återbruk till Återbankens pris – inköp ni slapp göra"
            />
            <ReceiptMetric
              value={money(statistics.economic.externalSalesNetValue)}
              description="Sålt via Rebuildr.se – netto efter provision"
            />
          </View>
          <Divider color={primitives.secondary500} />
          <View
            style={{ flexDirection: isDesktop ? "row" : "column", gap: 18 }}
          >
            <ReceiptMetric
              label="Värde i Återbanken just nu"
              value={money(statistics.economic.currentInventoryValue)}
            />
            <ReceiptMetric
              label="Undvikna avfallskostnader"
              value={`≈ ${money(statistics.economic.avoidedDisposalCost)}`}
            />
          </View>
        </ReceiptCard>
      </View>

      <View
        style={{
          backgroundColor: primitives.neutrals200,
          borderRadius: borderRadius.medium,
          flexDirection: isDesktop ? "row" : "column",
          padding: isDesktop ? 20 : 16,
        }}
      >
        <View
          style={{
            alignItems: isDesktop ? "center" : undefined,
            borderBottomColor: primitives.neutrals300,
            borderBottomWidth: isDesktop ? 0 : 1,
            justifyContent: isDesktop ? "center" : undefined,
            paddingBottom: isDesktop ? 0 : 12,
            paddingRight: isDesktop ? 24 : 0,
          }}
        >
          <Label
            size="large"
            style={{ color: colors.logo.vector, fontSize: 16, lineHeight: 24 }}
          >
            I Återbanken just nu
          </Label>
        </View>
        {kpis.map((kpi, index) => (
          <View
            key={kpi.label}
            style={{
              borderLeftColor: primitives.neutrals300,
              borderLeftWidth: isDesktop ? 1 : 0,
              flex: 1,
              gap: 2,
              paddingHorizontal: isDesktop ? 16 : 0,
              paddingTop: isDesktop ? 0 : index === 0 ? 14 : 10,
            }}
          >
            <Title size="large" style={{ color: colors.logo.vector }}>
              {kpi.value}
            </Title>
            <Body size="small" color="secondary">
              {kpi.label}
            </Body>
          </View>
        ))}
      </View>
    </View>
  );
};
