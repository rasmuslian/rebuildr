import { Pressable, View } from "react-native";
import { Button } from "@components/buttons/button";
import { Check } from "@components/controls/check";
import { Body, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { Icon } from "@icons/icon";
import { useThemeColor } from "@hooks/useThemeColor";
import { useOnboarding } from "@hooks/use-onboarding";
import { useOnboardingChecklist } from "@hooks/use-onboarding-checklist";
import { OnboardingCelebration } from "./onboarding-celebration";

// Compact companion to the account screen's full checklist: the feed shows one
// step at a time. Required steps stay until they are actually done; optional
// ones carry an X that retires that single step for good.
export const OnboardingHomeStrip = () => {
  const {
    isLoggedIn,
    loading,
    steps,
    completedCount,
    justCompleted,
    dismissCelebration,
  } = useOnboardingChecklist();
  const { isReady, dismissedSteps, dismissStep } = useOnboarding();
  const colors = useThemeColor();

  if (!isLoggedIn || loading || !isReady) return null;

  if (justCompleted) {
    return (
      <View style={{ marginBottom: 24 }}>
        <OnboardingCelebration onDismiss={dismissCelebration} />
      </View>
    );
  }

  const nextStep = steps.find(
    (step) => !step.done && !dismissedSteps.includes(step.key),
  );

  if (!nextStep) return null;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 16,
        marginBottom: 24,
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.medium,
      }}
    >
      <Pressable
        onPress={nextStep.onPress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          flex: 1,
        }}
      >
        <View pointerEvents="none">
          <Check selected={false} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Title size="small">{nextStep.title}</Title>
          <Body size="medium" color="secondary">
            Kom igång på RebuildR • {completedCount} av {steps.length} klart
          </Body>
        </View>
        <Icon icon="chevronRight" color="secondary" size={18} />
      </Pressable>
      {nextStep.optional && (
        <Button
          icon="X"
          type="text"
          onPress={() => dismissStep(nextStep.key)}
        />
      )}
    </View>
  );
};
