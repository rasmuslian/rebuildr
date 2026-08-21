import { ProductConditionEnum } from "@/gql/graphql";

import { Body, Display, Label } from "@components/typography/text";
import { conditions } from "@constants/conditions";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { StepSlider } from "@components/slider/step-slider";
import { ExplainConditionsBottomSheet } from "@components/explanation-information-sheets/explain-conditions-bottom-sheet";

type Props = {
  compact?: boolean;
  condition: ProductConditionEnum;
  onSelect: (condition: ProductConditionEnum) => void;
};

export const ConditionSection = ({
  compact = false,
  condition: _condition = ProductConditionEnum.Good,
  onSelect,
}: Props) => {
  const [condition, setCondition] = useState(_condition);
  const [showExplanation, setShowExplanation] = useState(false);
  const colors = useThemeColor();

  useEffect(() => {
    setCondition(_condition);
  }, [_condition]);

  const values = () => {
    return Object.values(ProductConditionEnum)
      .reverse()
      .map((c) => c) as ProductConditionEnum[];
  };

  return (
    <View>
      {compact ? (
        <Label size="small">Skick: {conditions[condition].name}</Label>
      ) : (
        <>
          <Display size="small" style={{ marginBottom: 24 }}>
            Skick
          </Display>
          <View style={{ gap: 4, marginBottom: 16 }}>
            <Body size="medium">
              Att ange rätt skick är viktigt för både dig och köparen. Det
              skapar förtroende och underlättar försäljningen. Läs vår{" "}
              <Body
                size="medium"
                onPress={() => {
                  setShowExplanation(true);
                }}
              >
                guide här.
              </Body>
            </Body>
          </View>
        </>
      )}
      <View style={{ gap: compact ? 8 : 24, marginTop: compact ? 8 : 0 }}>
        {!compact && (
          <View
            style={{
              backgroundColor: colors.background.secondary,
              borderRadius: borderRadius.medium,
              padding: 16,
              gap: 4,
              height: 100,
            }}
          >
            <Label size="medium">{conditions[condition].name}</Label>
            <Body size="small" color="secondary">
              {conditions[condition].description}
            </Body>
          </View>
        )}

        <StepSlider
          values={values()}
          value={condition}
          onChange={setCondition}
          onRelease={onSelect}
          compareFunction={(v1, v2) => v1 === v2}
        />
      </View>
      {!compact && (
        <ExplainConditionsBottomSheet
          show={showExplanation}
          onDismiss={() => setShowExplanation(false)}
        />
      )}
    </View>
  );
};
