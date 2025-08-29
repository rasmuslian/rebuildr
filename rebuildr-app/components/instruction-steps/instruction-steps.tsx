import { Check } from "@components/controls/check";
import { Body, Headline } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { ReactElement } from "react";
import { View } from "react-native";

type Props = {
  title?: string;
  steps: (string | ReactElement)[];
};
export const InstructionSteps = ({ title = "Såhär gör du:", steps }: Props) => {
  return (
    <View style={{ gap: 16 }}>
      <Headline size="small">{title}</Headline>
      {steps.map((step, i) => (
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          key={i}
        >
          <Check
            checkColor="primaryDark"
            selected
            color={primitives.primary200}
          />
          {typeof step === "string" ? <Body size="medium">{step}</Body> : step}
        </View>
      ))}
    </View>
  );
};
