import { Pressable, View } from "react-native";
import { Button } from "@components/buttons/button";
import { Body, Label, Title } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { Icon } from "@icons/icon";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { useOnboarding } from "@hooks/use-onboarding";
import { useOnboardingChecklist } from "@hooks/use-onboarding-checklist";
import { OnboardingCelebration } from "./onboarding-celebration";

const ProgressBar = ({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) => {
  const colors = useThemeColor();

  return (
    <View
      style={{
        width: 84,
        height: 4,
        borderRadius: borderRadius.full,
        backgroundColor: colors.buttons.tonal.enabled,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${total === 0 ? 0 : (completed / total) * 100}%`,
          height: "100%",
          borderRadius: borderRadius.full,
          backgroundColor: primitives.primary700,
        }}
      />
    </View>
  );
};

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
  const { isDesktop } = useScreenType();
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

  const action = (
    <Button
      label={nextStep.cta}
      type="outlined"
      onPress={nextStep.onPress}
      style={isDesktop ? undefined : { width: "100%" }}
    />
  );

  return (
    <View
      style={{
        padding: 20,
        marginBottom: 24,
        gap: 16,
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.medium,
      }}
    >
      <View
        style={{
          flexDirection: isDesktop ? "row" : "column",
          alignItems: isDesktop ? "center" : "stretch",
          gap: 16,
        }}
      >
        <View style={{ flex: 1, gap: 6, paddingRight: 24 }}>
          <Title size="small">{nextStep.title}</Title>
          <Body size="medium" color="secondary">
            {nextStep.description}
          </Body>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ProgressBar completed={completedCount} total={steps.length} />
            <Label size="small" color="secondary">
              {completedCount} av {steps.length} klart
            </Label>
          </View>
        </View>
        {action}
      </View>
      {nextStep.optional && (
        <Pressable
          onPress={() => dismissStep(nextStep.key)}
          hitSlop={12}
          accessibilityLabel="Dölj det här tipset"
          style={{ position: "absolute", top: 12, right: 12 }}
        >
          <Icon icon="X" color="secondary" size={16} />
        </Pressable>
      )}
    </View>
  );
};
