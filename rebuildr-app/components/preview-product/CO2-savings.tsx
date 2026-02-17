import { Body, Headline, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { View } from "react-native";
import co2Svg from "@assets/svgs/co2.svg";
import { Image } from "expo-image";
import { ExplainCO2CalculationSheet } from "@components/explanation-information-sheets/explain-co2-calculation-bottom-sheet";
import { formatMeasurement } from "@/utils/formattings";

type Props = {
  co2Saving?: number | null;
};

export const CO2Savings = ({ co2Saving }: Props) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const colors = useThemeColor();
  return (
    <View style={{ gap: 16 }}>
      <Headline size="small">CO2 besparing</Headline>

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
          {co2Saving ? formatMeasurement(co2Saving) : "X"} kg CO2 sparat
        </Headline>
        {!co2Saving && (
          <Label size="medium" color="error">
            Säljaren behöver ange vikt för att CO2 besparing skall visas
          </Label>
        )}
        <Body size="small">
          Cirka 90–99% lägre än en ny vara. Vi jämför klimat-påverkan för en ny
          vara med de små utsläpp som uppstår vid återbruk, främst transport och
          hantering. Skillnaden är din klimat-besparing.
        </Body>
        <Body size="small" onPress={() => setShowExplanation(true)}>
          Läs mer hur vi räknar
        </Body>
      </View>
      <ExplainCO2CalculationSheet
        show={showExplanation}
        onDismiss={() => setShowExplanation(false)}
      />
    </View>
  );
};
