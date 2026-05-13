import { formatCO2 } from "@/utils/formattings";
import { Divider } from "@components/dividers/divider";
import { ExplainCO2CalculationSheet } from "@components/explanation-information-sheets/explain-co2-calculation-bottom-sheet";
import { Body, Headline, Label, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { View } from "react-native";

type Props = {
  totalCO2Savings: number;
  totalCO2SavingsBuyer: number;
  totalCO2SavingsSeller: number;
  numberOfSoldProducts: number;
  numberOfCompletedPurchases: number;
};

export const CO2Summary = ({
  totalCO2Savings,
  totalCO2SavingsBuyer,
  totalCO2SavingsSeller,
  numberOfSoldProducts,
  numberOfCompletedPurchases,
}: Props) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();

  const cardStyle = {
    borderRadius: borderRadius.medium,
    padding: 16,
    borderWidth: 1,
  };

  const renderCard = (role: "seller" | "buyer") => {
    const isSeller = role === "seller";

    const totalTradesString = isSeller
      ? `${numberOfSoldProducts} ${numberOfSoldProducts === 1 ? "försäljning" : "försäljningar"}`
      : `${numberOfCompletedPurchases} ${numberOfCompletedPurchases === 1 ? "köp" : "köp"}`;
    return (
      <View
        style={[
          cardStyle,
          {
            flex: 1,
            backgroundColor: isSeller
              ? colors.logo.background
              : colors.background.primary,
            borderColor: isSeller
              ? colors.dividers.secondary
              : colors.dividers.primary,
            gap: 6,
          },
        ]}
      >
        <Label size="medium" color="secondary">
          {isSeller ? "Som säljare" : "Som köpare"}
        </Label>
        <Title size="medium" style={{ color: colors.logo.vector }}>
          {formatCO2(isSeller ? totalCO2SavingsSeller : totalCO2SavingsBuyer)}{" "}
          kg CO₂e
        </Title>
        <Label size="small" color="secondary">
          {isSeller ? "Undvik deponi" : "Undvik nyproduktion"}
        </Label>

        <Divider style={{ marginVertical: 2 }} />
        <Label size="medium" color="secondary">
          {totalTradesString}
        </Label>
      </View>
    );
  };

  return (
    <View
      style={[{ gap: 16 }, isDesktop && { maxWidth: 720, alignSelf: "center" }]}
    >
      <View
        style={[
          cardStyle,
          {
            backgroundColor: colors.logo.background,
            borderColor: colors.dividers.secondary,
          },
        ]}
      >
        <Label size="large" color="secondary">
          Din totala klimatinsats
        </Label>
        <Headline
          size="large"
          style={{ color: colors.logo.vector, marginTop: 6, marginBottom: 8 }}
        >
          {formatCO2(totalCO2Savings)} kg CO₂e
        </Headline>
        <Label size="medium" color="secondary">
          Från dina köp och försäljningar på RebuildR
        </Label>
      </View>

      <View style={{ flexDirection: "row", gap: 16 }}>
        {renderCard("seller")}
        {renderCard("buyer")}
      </View>

      <Body size="small" onPress={() => setShowExplanation(true)}>
        Så här räknar vi
      </Body>

      <ExplainCO2CalculationSheet
        show={showExplanation}
        onDismiss={() => setShowExplanation(false)}
      />
    </View>
  );
};
