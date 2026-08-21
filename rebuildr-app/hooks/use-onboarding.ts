import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const STORAGE_KEY = "hasSeenWelcome";
const DISMISSED_STEPS_KEY = "onboardingDismissedSteps";

export const useOnboarding = () => {
  const [isReady, setIsReady] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [dismissedSteps, setDismissedSteps] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(DISMISSED_STEPS_KEY),
    ]).then(([welcome, dismissed]) => {
      setHasSeenWelcome(welcome === "true");
      try {
        const parsed = dismissed ? JSON.parse(dismissed) : [];
        if (Array.isArray(parsed)) setDismissedSteps(parsed);
      } catch {
        setDismissedSteps([]);
      }
      setIsReady(true);
    });
  }, []);

  const markWelcomeSeen = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "true");
    setHasSeenWelcome(true);
  };

  // "Not interested" is an answer, but only for the step it was given on —
  // dismissing the optional profile nudge must not silence the steps that
  // still stand between the user and a completed sale.
  const dismissStep = async (key: string) => {
    const next = dismissedSteps.includes(key)
      ? dismissedSteps
      : [...dismissedSteps, key];
    await AsyncStorage.setItem(DISMISSED_STEPS_KEY, JSON.stringify(next));
    setDismissedSteps(next);
  };

  // Dev-only: clears the flags so the first-open welcome sheet and the feed
  // nudge can be re-triggered without reinstalling the app while testing.
  const resetWelcome = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEY, DISMISSED_STEPS_KEY]);
    setHasSeenWelcome(false);
    setDismissedSteps([]);
  };

  return {
    isReady,
    hasSeenWelcome,
    dismissedSteps,
    markWelcomeSeen,
    dismissStep,
    resetWelcome,
  };
};
