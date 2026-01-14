import { ProductConditionEnum } from "@/gql/graphql";

import { Body, Display, Label, Title } from "@components/typography/text";
import { conditions } from "@constants/conditions";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { View } from "react-native";
import { StepSlider } from "@components/slider/step-slider";

type Props = {
  condition: ProductConditionEnum;
  onSelect: (condition: ProductConditionEnum) => void;
};

export const ConditionSection = ({
  condition: _condition = ProductConditionEnum.Good,
  onSelect,
}: Props) => {
  const [condition, setCondition] = useState(_condition);
  const colors = useThemeColor();

  const values = () => {
    return Object.values(ProductConditionEnum)
      .reverse()
      .map((c) => c) as ProductConditionEnum[];
  };

  return (
    <View>
      <Display size="small" style={{ marginBottom: 24 }}>
        Ange skick
      </Display>
      <View style={{ gap: 4, marginBottom: 16 }}>
        <Title size="medium">Vad är skicket?</Title>
        <Body size="medium">
          Att ange rätt skick är viktigt för både dig och köparen. Det skapar
          förtroende och underlättar försäljningen. Läs vår{" "}
          <Body size="medium" isLink>
            guide här.
          </Body>
        </Body>
      </View>
      <View style={{ gap: 24 }}>
        <View
          style={{
            backgroundColor: colors.background.secondary,
            borderRadius: borderRadius.medium,
            padding: 16,
            gap: 4,
          }}
        >
          <Label size="medium">{conditions[condition].name}</Label>
          <Body size="small" color="secondary">
            {conditions[condition].description}
          </Body>
        </View>

        <StepSlider
          values={values()}
          value={condition}
          onChange={setCondition}
          onRelease={onSelect}
          compareFunction={(v1, v2) => v1 === v2}
        />
      </View>
    </View>
  );
};
