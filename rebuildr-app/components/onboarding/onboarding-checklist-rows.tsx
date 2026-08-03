import { Pressable, View } from "react-native";
import { Check } from "@components/controls/check";
import { Body, Title } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { primitives } from "@constants/colors";
import { ChecklistStep } from "@hooks/use-onboarding-checklist";

type Props = {
  steps: ChecklistStep[];
  // Runs before a step's own action — used to dismiss a host sheet before
  // navigating away from it.
  onBeforePress?: () => void;
};

export const OnboardingChecklistRows = ({ steps, onBeforePress }: Props) => (
  <View style={{ gap: 12 }}>
    {steps.map((step) => (
      <Pressable
        key={step.key}
        onPress={() => {
          onBeforePress?.();
          step.onPress();
        }}
        style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
      >
        <View pointerEvents="none">
          <Check
            selected={step.done}
            checkColor="primaryDark"
            color={step.done ? primitives.primary200 : undefined}
          />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Title
            size="small"
            style={
              step.done ? { textDecorationLine: "line-through" } : undefined
            }
            color={step.done ? "secondary" : "primaryDark"}
          >
            {step.title}
          </Title>
          {!step.done && (
            <Body size="medium" color="secondary">
              {step.description}
            </Body>
          )}
        </View>
        {!step.done && <Icon icon="chevronRight" color="secondary" size={18} />}
      </Pressable>
    ))}
  </View>
);
