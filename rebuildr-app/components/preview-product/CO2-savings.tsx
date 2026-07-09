import { Body, Headline, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { View } from "react-native";
import co2Svg from "@assets/svgs/co2.svg";
import { Image } from "expo-image";
import { formatCO2 } from "@/utils/formattings";
import { ExplainCO2WhyTwoNumbersSheet } from "@components/explanation-information-sheets/explain-co2-why-two-numbers-sheet";

type Props = {
  co2SavingSeller?: number | null;
};

export const CO2Savings = ({ co2SavingSeller }: Props) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const colors = useThemeColor();
  return (
    <View style={{ gap: 16 }}>
      <Headline size="small">CO₂ besparing</Headline>

      <View
        style={{
          backgroundColor: colors.background.primary,
          borderRadius: borderRadius.medium,
          paddingVertical: 24,
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        <Image source={{ uri: co2Svg.uri }} style={{ height: 36, width: 52 }} />
        <Headline size="large">
          {co2SavingSeller ? formatCO2(co2SavingSeller) : "X"} kg CO₂ sparat
        </Headline>
        {!co2SavingSeller && (
          <Label size="medium" color="error">
            Säljaren behöver ange vikt för att CO₂ besparing skall visas
          </Label>
        )}
        <Body size="small">
          Cirka 90–99% lägre än en ny vara. Siffran visar nyproduktionens
          utsläpp (A1–A3, Boverkets klimatdatabas) som du undviker genom att
          köpa återbrukat.
        </Body>
        <Body size="small" onPress={() => setShowExplanation(true)}>
          Läs mer hur vi räknar
        </Body>
      </View>
      <ExplainCO2WhyTwoNumbersSheet
        show={showExplanation}
        onDismiss={() => setShowExplanation(false)}
      />
    </View>
  );
};
