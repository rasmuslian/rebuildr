import { Pressable, View } from "react-native";
import { Check } from "@components/controls/check";
import { Body, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { Icon } from "@icons/icon";
import { useThemeColor } from "@hooks/useThemeColor";
import { useOnboardingChecklist } from "@hooks/use-onboarding-checklist";
import { OnboardingCelebration } from "./onboarding-celebration";

// Compact companion to the account screen's full checklist: the feed only shows
// the single next step so it stays a thin strip above the browsing content.
export const OnboardingHomeStrip = () => {
  const {
    isLoggedIn,
    loading,
    steps,
    completedCount,
    allDone,
    justCompleted,
    dismissCelebration,
    nextStep,
  } = useOnboardingChecklist();
  const colors = useThemeColor();

  if (!isLoggedIn || loading) return null;

  if (justCompleted) {
    return (
      <View style={{ marginBottom: 24 }}>
        <OnboardingCelebration onDismiss={dismissCelebration} />
      </View>
    );
  }

  if (allDone || !nextStep) return null;

  return (
    <Pressable
      onPress={nextStep.onPress}
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
  );
};
