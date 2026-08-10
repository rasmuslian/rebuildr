import { View } from "react-native";
import { Body, Headline } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { useOnboardingChecklist } from "@hooks/use-onboarding-checklist";
import { OnboardingCelebration } from "./onboarding-celebration";
import { OnboardingChecklistRows } from "./onboarding-checklist-rows";

export const OnboardingChecklistCard = () => {
  const {
    isLoggedIn,
    loading,
    steps,
    completedCount,
    allDone,
    justCompleted,
    dismissCelebration,
  } = useOnboardingChecklist();
  const colors = useThemeColor();

  if (!isLoggedIn || loading) return null;

  if (justCompleted) {
    return <OnboardingCelebration onDismiss={dismissCelebration} />;
  }

  // Derived purely from server data: the card disappears for good once every
  // step is done, with no extra persisted flag.
  if (allDone) return null;

  return (
    <View
      style={{
        padding: 16,
        gap: 16,
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.medium,
      }}
    >
      <View style={{ gap: 4 }}>
        <Headline size="small">Kom igång på RebuildR</Headline>
        <Body size="medium" color="secondary">
          {completedCount} av {steps.length} klart
        </Body>
      </View>
      <OnboardingChecklistRows steps={steps} />
    </View>
  );
};
