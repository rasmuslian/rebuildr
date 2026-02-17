import { Divider } from "@components/dividers/divider";
import { ExplainCO2CalculationSheet } from "@components/explanation-information-sheets/explain-co2-calculation-bottom-sheet";
import { Body, Display, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { View } from "react-native";

type Props = {
  totalCO2Savings: number;
};

export const CO2Summary = ({ totalCO2Savings }: Props) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();

  return (
    <View
      style={[
        {
          backgroundColor: colors.background.primary,
          gap: 24,
          borderRadius: borderRadius.medium,
          paddingVertical: 17,
          paddingHorizontal: 16,
        },
        isDesktop && {
          maxWidth: 720,
          alignSelf: "center",
        },
      ]}
    >
      <Display size="large">
        {Math.round(totalCO2Savings * 100) / 100} kg CO2
      </Display>
      <Title size="medium">
        Total CO2 besparing från dina försäljningar på RebuildR
      </Title>
      <Divider />
      <Body size="small">
        Cirka 90–99% lägre än en ny vara. Vi jämför klimat-påverkan för en ny
        vara med de små utsläpp som uppstår vid återbruk, främst transport och
        hantering. Skillnaden är din klimat-besparing.{" "}
      </Body>
      <Body size="small" onPress={() => setShowExplanation(true)}>
        Läs mer hur vi räknar
      </Body>
      <ExplainCO2CalculationSheet
        show={showExplanation}
        onDismiss={() => setShowExplanation(false)}
      />
    </View>
  );
};
